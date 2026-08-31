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

data class UiState(val loading: Boolean = false, val loggedIn: Boolean = false, val portal: String = "", val error: String? = null, val message: String = "Ready", val deviceOutcome: String? = null, val scanners: List<ScannerDto> = emptyList(), val scanner: ScannerDto? = null, val batches: List<BatchDto> = emptyList(), val batch: BatchDto? = null, val sessionId: String = "", val scanning: Boolean = false, val connected: Boolean = false, val manualAction: String = "check_in", val unique: Int = 0, val processed: Int = 0, val rejected: Int = 0, val results: List<ScanResultDto> = emptyList())

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
        sessionScanAction = mode?.takeIf { it == "manual" }?.let { mutable.value.manualAction }
        val session = repository.start(scannerUuid)
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
        sessionScanAction = null
    }
    fun clearData() = launchLoading {
        if (mutable.value.scanning) error("Stop scanning before clearing data")
        val sessionId = mutable.value.sessionId
        if (sessionId.isNotBlank()) repository.clear(sessionId)
        deduplicator.clear(); unique.clear(); buffer.clear()
        mutable.update { it.copy(sessionId = "", unique = 0, processed = 0, rejected = 0, results = emptyList(), message = "Scan data cleared") }
    }
    fun changeScanner() = viewModelScope.launch {
        if (mutable.value.scanning) stopSession()
        heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect()
        val scanners = runCatching { repository.scanners() }.getOrElse { mutable.value.scanners }
        mutable.update { it.copy(scanner = null, batch = null, scanners = scanners, sessionId = "", connected = false, unique = 0, processed = 0, rejected = 0, results = emptyList(), error = null, message = "Select a scanner") }
    }
    private fun onTag(read: com.clothsync.scanner.rfid.RfidRead) {
        if (!mutable.value.scanning) return
        if (!deduplicator.accept(read.epc, System.currentTimeMillis())) return
        if (unique.add(read.epc)) {
            feedback.acceptedTag()
            buffer += read.epc
            mutable.update { state ->
                state.copy(
                    unique = unique.size,
                    results = state.results + ScanResultDto(
                        epc = read.epc,
                        accepted = true,
                        status = "pending",
                        statusLabel = "Pending",
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
        while (buffer.isNotEmpty()) {
            val chunk = buffer.take(25)
            buffer.subList(0, chunk.size).clear()
            runCatching { repository.upload(mutable.value.sessionId, chunk, sessionScanAction) }
                .onSuccess { response ->
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
                .onFailure { error -> mutable.update { it.copy(message = "Upload failed: ${friendly(error)}") } }
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
    fun logout() = viewModelScope.launch { if (mutable.value.scanning) stopSession(); heartbeat?.cancel(); scannerRefresh?.cancel(); reader.disconnect(); repository.logout(); mutable.value = UiState() }
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
