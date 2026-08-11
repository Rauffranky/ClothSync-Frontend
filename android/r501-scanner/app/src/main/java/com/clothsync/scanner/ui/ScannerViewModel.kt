package com.clothsync.scanner.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clothsync.scanner.data.*
import com.clothsync.scanner.rfid.RfidReader
import com.clothsync.scanner.rfid.ScanFeedback
import com.clothsync.scanner.rfid.TagDeduplicator
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import javax.inject.Inject

data class UiState(val loading: Boolean = false, val loggedIn: Boolean = false, val portal: String = "", val error: String? = null, val message: String = "Ready", val scanners: List<ScannerDto> = emptyList(), val scanner: ScannerDto? = null, val batches: List<BatchDto> = emptyList(), val batch: BatchDto? = null, val sessionId: String = "", val scanning: Boolean = false, val connected: Boolean = false, val manualAction: String = "check_in", val unique: Int = 0, val processed: Int = 0, val rejected: Int = 0, val pending: Int = 0)

@HiltViewModel
class ScannerViewModel @Inject constructor(private val repository: ScannerRepository, private val reader: RfidReader, private val feedback: ScanFeedback) : ViewModel() {
    private val mutable = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = mutable.asStateFlow()
    private val deduplicator = TagDeduplicator()
    private val unique = linkedSetOf<String>()
    private val buffer = mutableListOf<String>()
    private val flushMutex = Mutex()
    private var heartbeat: Job? = null
    private var flushJob: Job? = null
    private var scannerRefresh: Job? = null

    init {
        viewModelScope.launch { repository.pendingOffline.collect { mutable.update { s -> s.copy(pending = it) } } }
        viewModelScope.launch {
            repository.storedSession.collect { stored ->
                if (stored != null && !mutable.value.loggedIn) {
                    runCatching { loadPortal(stored.portalType) }
                        .onFailure(::showError)
                    mutable.update { it.copy(loading = false) }
                }
            }
        }
        viewModelScope.launch { reader.observeTags().collect(::onTag) }
    }

    fun login(email: String, password: String) = launchLoading { loadPortal(repository.login(email, password).portalType) }
    private suspend fun loadPortal(portal: String) { mutable.update { it.copy(loggedIn = true, portal = portal, loading = true, error = null) }; val scanners = repository.scanners(); mutable.update { it.copy(loading = false, scanners = scanners, message = if (scanners.isEmpty()) "No assigned active scanners" else "Select a scanner") } }
    fun selectScanner(scanner: ScannerDto) = launchLoading {
        if (scanner.actualUuid() == null) error("Scanner UUID is missing. Refresh scanners and try again.")
        val selectedResponse = repository.selectScanner(scanner)
        val selectedUuid = selectedResponse.actualUuid() ?: scanner.actualUuid()
            ?: error("Scanner UUID is missing. Refresh scanners and try again.")
        val refreshedScanners = repository.scanners()
        val selected = refreshedScanners.firstOrNull { it.actualUuid() == selectedUuid }
            ?: selectedResponse.takeIf { it.actualUuid() != null }
            ?: scanner
        val batches = if (mutable.value.portal == "laundry") repository.batches() else emptyList()
        mutable.update { it.copy(scanner = selected, scanners = refreshedScanners, batches = batches, message = if (batches.isEmpty() && it.portal == "laundry") "No incoming batches" else "Continue to scan") }
        startScannerRefresh(selectedUuid)
    }
    fun selectBatch(batch: BatchDto) { mutable.update { it.copy(batch = batch) } }
    fun setManualAction(action: String) { mutable.update { it.copy(manualAction = action) } }
    fun start() = launchLoading {
        val scanner = mutable.value.scanner ?: error("Select a scanner")
        val scannerUuid = scanner.actualUuid() ?: error("Scanner UUID is missing. Refresh scanners and try again.")
        val batchId = mutable.value.batch?.actualId()
        if (mutable.value.portal == "laundry" && batchId == null) error("Selected incoming batch UUID is missing")
        val session = repository.start(scannerUuid, if (mutable.value.portal == "laundry") batchId else null)
        val connected = reader.connect()
        if (!connected || !reader.startInventory()) error("RFID reader could not start")
        deduplicator.clear(); unique.clear(); buffer.clear()
        val sessionId = session.id ?: error("Session ID was not returned")
        mutable.update { it.copy(sessionId = sessionId, scanning = true, connected = true, unique = 0, processed = 0, rejected = 0, message = "Scanning") }
        startHeartbeat(scannerUuid)
    }
    fun stop() = viewModelScope.launch { stopSession() }
    private suspend fun stopSession() {
        reader.stopInventory(); mutable.update { it.copy(scanning = false, message = "Stopping…") }
        flushJob?.join()
        flush(); heartbeat?.cancel()
        runCatching { repository.stop(mutable.value.sessionId) }.onSuccess { mutable.update { it.copy(message = "Session stopped") } }.onFailure(::showError)
    }
    fun clearData() = launchLoading {
        if (mutable.value.scanning) error("Stop scanning before clearing data")
        val sessionId = mutable.value.sessionId
        if (sessionId.isNotBlank()) repository.clear(sessionId)
        deduplicator.clear(); unique.clear(); buffer.clear()
        mutable.update { it.copy(sessionId = "", unique = 0, processed = 0, rejected = 0, message = "Scan data cleared") }
    }
    fun changeScanner() = viewModelScope.launch {
        if (mutable.value.scanning) stopSession()
        heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect()
        val scanners = runCatching { repository.scanners() }.getOrElse { mutable.value.scanners }
        mutable.update { it.copy(scanner = null, batch = null, scanners = scanners, sessionId = "", connected = false, unique = 0, processed = 0, rejected = 0, error = null, message = "Select a scanner") }
    }
    private fun onTag(read: com.clothsync.scanner.rfid.RfidRead) {
        if (!mutable.value.scanning) return
        if (!deduplicator.accept(read.epc, System.currentTimeMillis())) return
        if (unique.add(read.epc)) {
            feedback.acceptedTag()
            buffer += read.epc
            mutable.update { it.copy(unique = unique.size) }
            if (flushJob?.isActive != true) {
                flushJob = viewModelScope.launch {
                    if (buffer.size < 25) delay(350)
                    flush()
                }
            }
        }
    }
    private suspend fun flush() = flushMutex.withLock {
        while (buffer.isNotEmpty()) {
            val chunk = buffer.take(25)
            buffer.subList(0, chunk.size).clear()
            val action = mutable.value.scanner?.scannerMode?.takeIf { it.equals("manual", true) }?.let { mutable.value.manualAction }
            runCatching { repository.upload(mutable.value.sessionId, chunk, action) }
                .onSuccess { response ->
                    val counters = response.data?.counters ?: ScanCounters()
                    mutable.update { it.copy(processed = it.processed + counters.processedCount, rejected = it.rejected + counters.rejectedCount, message = response.message) }
                }
                .onFailure { error -> mutable.update { it.copy(message = "Upload failed: ${friendly(error)}") } }
        }
    }
    private fun startHeartbeat(scannerId: String) { heartbeat?.cancel(); heartbeat = viewModelScope.launch { while (isActive) { delay(30_000); val response = runCatching { repository.heartbeat(HeartbeatRequest(scannerId, batteryLevel = 100, networkState = "wifi", rfidConnected = mutable.value.connected)) }.getOrNull(); if (response?.data?.scannerActive == false) { reader.stopInventory(); mutable.update { it.copy(scanning = false, message = "Scanner was deactivated by the backend") }; cancel() } } } }
    private fun startScannerRefresh(scannerId: String) {
        scannerRefresh?.cancel()
        scannerRefresh = viewModelScope.launch {
            while (isActive) {
                delay(5_000)
                val scanners = runCatching { repository.scanners() }.getOrNull() ?: continue
                val refreshed = scanners.firstOrNull { it.actualUuid() == scannerId }
                if (refreshed == null) {
                    if (mutable.value.scanning) stopSession()
                    mutable.update { it.copy(scanner = null, batch = null, scanners = scanners, connected = false, message = "Scanner is no longer active or assigned") }
                    cancel()
                } else {
                    val oldMode = mutable.value.scanner?.scannerMode
                    mutable.update { it.copy(scanner = refreshed, scanners = scanners, message = if (!oldMode.equals(refreshed.scannerMode, true)) "Scanner mode updated to ${refreshed.scannerMode.orEmpty()}" else it.message) }
                }
            }
        }
    }
    fun logout() = viewModelScope.launch { if (mutable.value.scanning) stopSession(); heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect(); repository.logout(); mutable.value = UiState() }
    private fun launchLoading(block: suspend () -> Unit) = viewModelScope.launch { mutable.update { it.copy(loading = true, error = null) }; runCatching { block() }.onFailure(::showError); mutable.update { it.copy(loading = false) } }
    private fun showError(error: Throwable) { mutable.update { it.copy(error = friendly(error), message = friendly(error)) } }
    private fun friendly(error: Throwable) = error.message?.takeIf { it.isNotBlank() } ?: "Request failed"
    override fun onCleared() { heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect(); super.onCleared() }
}
