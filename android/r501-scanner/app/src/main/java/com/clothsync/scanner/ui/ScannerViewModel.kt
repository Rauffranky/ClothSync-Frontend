package com.clothsync.scanner.ui

import androidx.lifecycle.ViewModel
import com.clothsync.scanner.BuildConfig
import androidx.lifecycle.viewModelScope
import com.clothsync.scanner.data.*
import com.clothsync.scanner.rfid.RfidReader
import com.clothsync.scanner.rfid.ScanFeedback
import com.clothsync.scanner.rfid.TagDeduplicator
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import android.content.Context
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import retrofit2.HttpException
import org.json.JSONObject
import javax.inject.Inject

data class UiState(val loading: Boolean = false, val loggedIn: Boolean = false, val portal: String = "", val error: String? = null, val message: String = "Ready", val deviceOutcome: String? = null, val scanners: List<ScannerDto> = emptyList(), val scanner: ScannerDto? = null, val batches: List<BatchDto> = emptyList(), val batch: BatchDto? = null, val sessionId: String = "", val scanning: Boolean = false, val connected: Boolean = false, val manualAction: String = "check_in", val unique: Int = 0, val processed: Int = 0, val rejected: Int = 0, val queued: Int = 0, val rejectedUploadReason: String? = null, val results: List<ScanResultDto> = emptyList())

@HiltViewModel
class ScannerViewModel @Inject constructor(private val repository: ScannerRepository, private val reader: RfidReader, private val feedback: ScanFeedback, @ApplicationContext private val context: Context) : ViewModel() {
    private val mutable = MutableStateFlow(UiState())
    val state: StateFlow<UiState> = mutable.asStateFlow()
    private val deduplicator = TagDeduplicator()
    private val unique = linkedSetOf<String>()
    private val buffer = mutableListOf<String>()
    private val flushMutex = Mutex()
    private var heartbeat: Job? = null
    private var flushJob: Job? = null
    private var scannerRefresh: Job? = null
    private var sessionScanAction: String? = null

    init {
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
    fun retryConnection() = launchLoading { loadPortal(mutable.value.portal) }
    fun refreshScanner() = launchLoading {
        val connectivity = context.getSystemService(Context.CONNECTIVITY_SERVICE) as android.net.ConnectivityManager
        val connected = connectivity.activeNetwork != null
        if (!connected) error("Internet connection is required to refresh scanner status")
        val deviceId = android.provider.Settings.Secure.getString(context.contentResolver, android.provider.Settings.Secure.ANDROID_ID)
            ?: error("Unable to read this device identifier")
        val identity = repository.identifyDevice(DeviceIdentityRequest(
            hardwareIdentifier = deviceId,
            scannerFamily = if (BuildConfig.SCANNER_VARIANT == "fixed") "uhf288" else "r501",
            deviceModel = android.os.Build.MODEL,
            appVersion = "1.0.0",
            metadata = mapOf("scannerVariant" to BuildConfig.SCANNER_VARIANT, "refreshOnly" to true),
        )).data ?: error("Scanner status response was empty")
        val refreshed = identity.scanner
        if (refreshed == null) {
            mutable.update { it.copy(scanner = null, scanning = false, connected = false, message = identity.message ?: "This device is not registered") }
            return@launchLoading
        }
        if (!refreshed.status.equals("active", true) && mutable.value.scanning) stopSession()
        mutable.update { it.copy(scanner = refreshed, scanners = listOf(refreshed), connected = refreshed.status.equals("active", true) && it.connected, message = if (refreshed.status.equals("active", true)) "Scanner is active" else lifecycleMessage(refreshed.status)) }
    }
    private suspend fun loadPortal(portal: String) {
        mutable.update { it.copy(loggedIn = true, portal = portal, loading = true, error = null) }
        val deviceId = android.provider.Settings.Secure.getString(
            context.contentResolver,
            android.provider.Settings.Secure.ANDROID_ID,
        ) ?: error("Unable to read this device identifier")
        val identity = repository.identifyDevice(
            DeviceIdentityRequest(
                hardwareIdentifier = deviceId,
                scannerFamily = if (BuildConfig.SCANNER_VARIANT == "fixed") "uhf288" else "r501",
                deviceModel = android.os.Build.MODEL,
                appVersion = "1.0.0",
                metadata = mapOf("scannerVariant" to BuildConfig.SCANNER_VARIANT),
            ),
        ).data ?: error("Device identification response was empty")
        val boundScanner = identity.scanner
        if (boundScanner != null) {
            mutable.update {
                it.copy(
                    loading = false,
                    deviceOutcome = identity.outcome,
                    scanner = boundScanner,
                    scanners = listOf(boundScanner),
                    message = when (identity.outcome) {
                        "enrolled" -> "Scanner registered successfully. Complete configuration from the ClothSync Web Portal."
                        else -> if (boundScanner.status.equals("active", true)) "Continue to scan" else "Scanner configuration is required"
                    },
                )
            }
            boundScanner.actualUuid()?.let(::startScannerRefresh)
            if (BuildConfig.SCANNER_VARIANT == "fixed" && boundScanner.status.equals("active", true)) {
                start()
            }
            return
        }
        val scanners = repository.scanners()
        mutable.update { it.copy(loading = false, scanners = scanners, message = if (scanners.isEmpty()) "This device is not registered. Please ask an administrator to activate it." else "A scanner is not bound to this device") }
    }
    fun selectScanner(scanner: ScannerDto) = launchLoading {
        if (scanner.actualUuid() == null) error("Scanner UUID is missing. Refresh scanners and try again.")
        val selectedResponse = repository.selectScanner(scanner)
        val selectedUuid = selectedResponse.actualUuid() ?: scanner.actualUuid()
            ?: error("Scanner UUID is missing. Refresh scanners and try again.")
        val refreshedScanners = repository.scanners()
        val selected = refreshedScanners.firstOrNull { it.actualUuid() == selectedUuid }
            ?: selectedResponse.takeIf { it.actualUuid() != null }
            ?: scanner
        mutable.update { it.copy(scanner = selected, scanners = refreshedScanners, message = "Continue to scan") }
        startScannerRefresh(selectedUuid)
        if (BuildConfig.SCANNER_VARIANT == "fixed" && selected.status.equals("active", true)) {
            start()
        }
    }
    fun setManualAction(action: String) { mutable.update { it.copy(manualAction = action) } }
    fun start() = launchLoading {
        val scanner = mutable.value.scanner ?: error("Select a scanner")
        if (!scanner.status.equals("active", true)) error("Scanner is not active. Complete configuration or contact an administrator.")
        val scannerUuid = scanner.actualUuid() ?: error("Scanner UUID is missing. Refresh scanners and try again.")
        val mode = scanner.scannerMode?.lowercase()
        if (mode !in setOf("entry", "exit", "manual", "auto")) {
            error("Invalid scanner mode. Configure the scanner as Entry, Exit, Manual, or Auto.")
        }
        sessionScanAction = mode?.takeIf { it == "manual" && BuildConfig.SCANNER_VARIANT != "fixed" }?.let { mutable.value.manualAction }
        flush()
        if (repository.queuedScanCount() > 0) {
            val rejected = repository.permanentlyRejectedUploads().firstOrNull()
            if (rejected != null) {
                mutable.update { it.copy(rejectedUploadReason = rejected.lastError) }
                error("A previous upload was rejected (${rejected.lastError}). Discard it to start a new session.")
            }
            error("Pending uploads need retry before a new session")
        }
        val purpose = if (mutable.value.portal != "laundry") null else if (mode == "exit" || (mode == "manual" && sessionScanAction == "check_out")) "outbound" else "receipt"
        val session = repository.activeSession(scannerUuid) ?: repository.start(scannerUuid, mutable.value.batch?.actualId(), purpose)
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
        flush(); if (BuildConfig.SCANNER_VARIANT != "fixed") heartbeat?.cancel()
        if (repository.queuedScanCount() > 0 || buffer.isNotEmpty()) {
            mutable.update { it.copy(queued = repository.queuedScanCount(), error = "Pending uploads must be acknowledged before Finish", message = "Stopped reading; uploads still pending") }
            return
        }
        runCatching { repository.stop(mutable.value.sessionId) }.onSuccess { mutable.update { it.copy(message = "Session stopped") } }.onFailure(::showError)
        sessionScanAction = null
    }
    fun clearData() = launchLoading {
        if (mutable.value.scanning) error("Stop scanning before clearing data")
        if (repository.queuedScanCount() > 0) {
            repository.discardPermanentlyRejectedUploads()
            if (repository.queuedScanCount() > 0) repository.discardAllQueued()
        }
        val sessionId = mutable.value.sessionId
        if (sessionId.isNotBlank()) runCatching { repository.clear(sessionId) }
        deduplicator.clear(); unique.clear(); buffer.clear()
        mutable.update { it.copy(sessionId = "", unique = 0, processed = 0, rejected = 0, queued = 0, rejectedUploadReason = null, results = emptyList(), error = null, message = "Scan data cleared") }
    }
    fun discardRejectedUploads() = launchLoading {
        var removed = repository.discardPermanentlyRejectedUploads()
        if (removed == 0 && repository.queuedScanCount() > 0) {
            val count = repository.queuedScanCount()
            repository.discardAllQueued()
            removed = count
        }
        if (removed == 0) error("No rejected uploads to discard.")
        mutable.update { it.copy(queued = repository.queuedScanCount(), rejectedUploadReason = null, error = null, message = "$removed rejected upload(s) discarded. You can start a new session.") }
    }
    fun changeScanner() = viewModelScope.launch {
        if (mutable.value.scanning) stopSession()
        if (repository.queuedScanCount() > 0) repository.discardPermanentlyRejectedUploads()
        if (repository.queuedScanCount() > 0 || buffer.isNotEmpty()) { showError(IllegalStateException("Pending uploads must be resolved before switching scanner")); return@launch }
        heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect()
        val scanners = runCatching { repository.scanners() }.getOrElse { mutable.value.scanners }
        mutable.update { it.copy(scanner = null, batch = null, scanners = scanners, sessionId = "", connected = false, unique = 0, processed = 0, rejected = 0, results = emptyList(), error = null, message = "Select a scanner") }
    }
    private fun onTag(read: com.clothsync.scanner.rfid.RfidRead) {
        if (!mutable.value.scanning) return
        if (!deduplicator.accept(read.epc, System.currentTimeMillis())) return
        val firstSeenInSession = unique.add(read.epc)
        // Fixed readers stay active. A tag is sent again after it leaves the
        // field and returns; portable scanners retain one read per session.
        val shouldUpload = BuildConfig.SCANNER_VARIANT == "fixed" || firstSeenInSession
        if (shouldUpload) {
            feedback.acceptedTag()
            buffer += read.epc
            mutable.update { state ->
                state.copy(
                    unique = unique.size,
                    results = state.results.filterNot { it.epc.equals(read.epc, ignoreCase = true) } + ScanResultDto(
                        epc = read.epc, accepted = true, status = "pending", statusLabel = "Pending",
                    ),
                )
            }
            if (flushJob?.isActive != true) {
                flushJob = viewModelScope.launch {
                    if (buffer.size < 25) delay(100)
                    flush()
                }
            }
        }
    }
    private suspend fun flush() = flushMutex.withLock {
        repository.retryQueuedScans(mutable.value.scanner?.actualUuid(), mutable.value.batch?.actualId())
        while (buffer.isNotEmpty()) {
            val chunk = buffer.take(25)
            var acknowledged = false
            runCatching { repository.upload(mutable.value.sessionId, chunk, sessionScanAction, mutable.value.scanner?.actualUuid(), mutable.value.batch?.actualId()) }
                .onSuccess { response ->
                    acknowledged = true
                    val counters = response.data?.counters ?: ScanCounters()
                    val batches = response.data?.batchCounters.orEmpty().mapNotNull { it.batchCode }.distinct()
                    val batchMessage = if (batches.isEmpty()) response.message else "${response.message} Batches: ${batches.joinToString()}"
                    val reasons = counters.rejectionReasons.entries
                        .joinToString { "${it.key}: ${it.value}" }
                    val rejectionMessage = if (reasons.isBlank()) batchMessage else "$batchMessage Rejections: $reasons"
                    val responseResults = response.data?.results.orEmpty()
                    val visibleResults = responseResults.map { result ->
                        result
                    }
                    mutable.update { state ->
                        val responseByEpc = visibleResults.associateBy { it.epc.uppercase() }
                        val mergedResults = state.results.map { current ->
                            responseByEpc[current.epc.uppercase()] ?: current
                        }.toMutableList()
                        visibleResults.forEach { result ->
                            if (mergedResults.none { it.epc.equals(result.epc, ignoreCase = true) }) mergedResults += result
                        }
                        state.copy(
                            processed = state.processed + counters.processedCount,
                            rejected = state.rejected + counters.rejectedCount,
                            results = mergedResults,
                            message = rejectionMessage,
                        )
                    }
                }
                .onFailure { error ->
                    reader.stopInventory()
                    mutable.update { it.copy(scanning = false, message = "Upload pending: ${friendly(error)}") }
                }
            if (acknowledged || repository.hasQueuedChunk(mutable.value.sessionId, chunk)) buffer.subList(0, chunk.size).clear()
            else break
        }
        val rejected = repository.permanentlyRejectedUploads().firstOrNull()
        mutable.update {
            it.copy(
                queued = repository.queuedScanCount(),
                rejectedUploadReason = rejected?.lastError ?: it.rejectedUploadReason,
            )
        }
    }
    private fun startHeartbeat(scannerId: String) {
        heartbeat?.cancel()
        heartbeat = viewModelScope.launch {
            while (isActive) {
                delay(30_000)
                val response = runCatching {
                    repository.heartbeat(
                        HeartbeatRequest(
                            scannerId = scannerId,
                            batteryLevel = 100,
                            networkState = "connected",
                            rfidConnected = mutable.value.connected,
                            metadata = mapOf("deviceModel" to android.os.Build.MODEL, "scannerVariant" to BuildConfig.SCANNER_VARIANT),
                        ),
                    )
                }
                response.onSuccess { heartbeatResponse ->
                    val command = heartbeatResponse.data?.command
                    if (BuildConfig.SCANNER_VARIANT == "fixed" && !command?.id.isNullOrBlank()) {
                        when (command?.command) {
                            "start" -> if (!mutable.value.scanning) start()
                            "stop" -> if (mutable.value.scanning) stopSession()
                            "rescan" -> { deduplicator.clear(); mutable.update { it.copy(message = "Portal requested a new scan cycle") } }
                        }
                        repository.acknowledgeCommand(command!!.id!!)
                    }
                    if (heartbeatResponse.data?.scannerActive == false) {
                        reader.stopInventory()
                        mutable.update { it.copy(scanning = false, connected = false, message = "Scanner was deactivated by the backend") }
                        cancel()
                    }
                }.onFailure { error ->
                    if (error is HttpException && error.code() in listOf(401, 403, 409)) {
                        reader.stopInventory()
                        mutable.update { it.copy(scanning = false, connected = false, error = "Scanner authorization is no longer valid. Sign in again or contact an administrator.", message = "Scanning stopped: authorization revoked") }
                        cancel()
                    } else {
                        mutable.update { it.copy(message = "Heartbeat unavailable; scanning paused until the connection recovers") }
                        reader.stopInventory()
                        mutable.update { it.copy(scanning = false, connected = false) }
                        cancel()
                    }
                }
            }
        }
    }
    private fun startScannerRefresh(scannerId: String) {
        scannerRefresh?.cancel()
        scannerRefresh = viewModelScope.launch {
            while (isActive) {
                delay(5_000)
                runCatching {
                    val currentId = mutable.value.sessionId
                    if (currentId.isNotBlank()) {
                        val session = repository.session(currentId)
                        if (session?.status != "active") {
                            reader.stopInventory()
                            mutable.update { it.copy(scanning = false) }
                            flush()
                            repository.discardPermanentlyRejectedUploads()
                            if (repository.queuedScanCount() == 0 && buffer.isEmpty()) {
                                mutable.update { it.copy(sessionId = "", rejectedUploadReason = null, error = null, message = "Session closed; waiting for continuation") }
                            } else {
                                val reason = repository.permanentlyRejectedUploads().firstOrNull()?.lastError ?: "Session closed on backend"
                                mutable.update { it.copy(rejectedUploadReason = reason, error = "Closed session has pending uploads. Discard or reconcile.") }
                            }
                        }
                    }
                    if (repository.queuedScanCount() > 0) flush()
                    if (BuildConfig.SCANNER_VARIANT == "fixed" && !mutable.value.scanning && mutable.value.sessionId.isBlank() && repository.queuedScanCount() == 0 && !mutable.value.loading) {
                        if (repository.activeSession(scannerId) != null) start()
                    }
                }.onFailure { error ->
                    reader.stopInventory()
                    mutable.update { it.copy(scanning = false, message = "Connection paused: ${friendly(error)}") }
                }
                val scanners = runCatching { repository.scanners() }.getOrNull() ?: continue
                val refreshed = scanners.firstOrNull { it.actualUuid() == scannerId }
                if (refreshed == null) {
                    if (mutable.value.scanning) stopSession()
                    mutable.update { it.copy(scanner = null, batch = null, scanners = scanners, connected = false, message = "Scanner is no longer active or assigned") }
                    cancel()
                } else {
                    val oldMode = mutable.value.scanner?.scannerMode
                    if (!refreshed.status.equals("active", true) && mutable.value.scanning) {
                        stopSession()
                    }
                    mutable.update {
                        it.copy(
                            scanner = refreshed,
                            scanners = scanners,
                            connected = if (refreshed.status.equals("active", true)) it.connected else false,
                            message = if (!refreshed.status.equals("active", true)) lifecycleMessage(refreshed.status) else if (!oldMode.equals(refreshed.scannerMode, true)) "Scanner mode updated to ${refreshed.scannerMode.orEmpty()}" else it.message,
                        )
                    }
                }
            }
        }
    }
    fun logout() = viewModelScope.launch {
        if (mutable.value.scanning) stopSession()
        if (repository.queuedScanCount() > 0) repository.discardPermanentlyRejectedUploads()
        if (repository.queuedScanCount() > 0 || buffer.isNotEmpty()) {
            showError(IllegalStateException("Resolve pending uploads before logout"))
            return@launch
        }
        heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect(); repository.logout(); mutable.value = UiState()
    }
    private fun launchLoading(block: suspend () -> Unit) = viewModelScope.launch { mutable.update { it.copy(loading = true, error = null) }; runCatching { block() }.onFailure(::showError); mutable.update { it.copy(loading = false) } }
    private fun showError(error: Throwable) { mutable.update { it.copy(error = friendly(error), message = friendly(error)) } }
    private fun friendly(error: Throwable): String {
        if (error is HttpException) {
            val body = runCatching { error.response()?.errorBody()?.string() }.getOrNull()
            val message = runCatching { JSONObject(body.orEmpty()).optString("message") }.getOrNull()
            if (!message.isNullOrBlank()) return message
        }
        return error.message?.takeIf { it.isNotBlank() } ?: "Request failed"
    }
    private fun lifecycleMessage(status: String?) = when (status?.lowercase()) {
        "pending_configuration" -> "Configuration required before scanning"
        "inactive" -> "Scanner is inactive"
        "blocked" -> "Scanner is blocked by the administrator"
        "replaced" -> "Scanner hardware was replaced; reconnect is required"
        "retired" -> "Scanner is retired and cannot scan"
        else -> "Scanner is not active"
    }
    override fun onCleared() { heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect(); super.onCleared() }
}
