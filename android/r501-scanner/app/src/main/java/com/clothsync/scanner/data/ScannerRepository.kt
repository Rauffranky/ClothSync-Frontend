package com.clothsync.scanner.data

import android.content.Context
import android.provider.Settings
import com.clothsync.scanner.BuildConfig
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScannerRepository @Inject constructor(private val api: MobileScannerApi, private val store: SecureSessionStore, private val queue: ScanQueueStore, @ApplicationContext private val context: Context) {
    val storedSession = store.session
    suspend fun login(email: String, password: String): StoredSession {
        val data = api.login(LoginRequest(email.trim(), password, Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID), android.os.Build.MODEL)).data ?: error("Invalid login response")
        return StoredSession(data.accessToken, data.refreshToken, data.sessionId, data.portalType, data.user?.id.orEmpty(), data.user?.fullName.orEmpty(), data.owner?.id.orEmpty()).also(store::save)
    }
    suspend fun logout() { runCatching { api.logout() }; store.clear() }
    suspend fun identifyDevice(body: DeviceIdentityRequest) = api.identifyDevice(body)
    suspend fun scanners() = api.scanners().data?.items.orEmpty()
    suspend fun selectScanner(scanner: ScannerDto): ScannerDto {
        val uuid = scanner.actualUuid() ?: error("Scanner UUID is missing. Refresh scanners and try again.")
        return api.selectScanner(uuid, SelectScannerRequest(Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID))).data ?: scanner
    }
    suspend fun batches() = api.batches().data?.items.orEmpty()
    suspend fun upload(sessionId: String, epcs: List<String>, action: String?, scannerId: String? = null, batchId: String? = null): ApiEnvelope<ScanResponseData> {
        val request = ScanRequest(UUID.randomUUID().toString(), epcs.distinct(), action)
        val queued = QueuedScan(request.requestId, sessionId, request.epcs, request.scanAction, scannerId = scannerId, batchId = batchId)
        queue.enqueue(queued)
        return try { api.scans(sessionId, request).also { check(it.success && it.data != null) { "Upload was not acknowledged" }; queue.remove(request.requestId) } }
        catch (error: Throwable) {
            val msg = if (error is retrofit2.HttpException) {
                val body = runCatching { error.response()?.errorBody()?.string() }.getOrNull()
                val serverMsg = runCatching { org.json.JSONObject(body.orEmpty()).optString("message") }.getOrNull()
                if (!serverMsg.isNullOrBlank()) "HTTP ${error.code()}: $serverMsg" else "HTTP ${error.code()} ${error.message()}"
            } else error.message ?: "Upload failed"
            queue.markFailed(queued, msg)
            throw error
        }
    }

    suspend fun retryQueuedScans(scannerId: String?, batchId: String?) {
        // Never move an old request to another session or rewrite its action.
        val items = queue.all().filter { it.scannerId == scannerId && scannerId != null }
        for (item in items) {
            try {
                val response = api.scans(item.sessionId, ScanRequest(item.requestId, item.epcs, item.scanAction))
                check(response.success && response.data != null) { "Upload was not acknowledged" }
                queue.remove(item.requestId)
            } catch (error: kotlinx.coroutines.CancellationException) { throw error }
            catch (error: Throwable) {
                val msg = if (error is retrofit2.HttpException) {
                    val body = runCatching { error.response()?.errorBody()?.string() }.getOrNull()
                    val serverMsg = runCatching { org.json.JSONObject(body.orEmpty()).optString("message") }.getOrNull()
                    if (!serverMsg.isNullOrBlank()) "HTTP ${error.code()}: $serverMsg" else "HTTP ${error.code()} ${error.message()}"
                } else error.message ?: "Retry failed"
                queue.markFailed(item, msg)
                break
            }
        }
    }
    suspend fun activeSession(scannerId: String) = api.activeSession(scannerId).data?.actualSession()
    suspend fun session(sessionId: String) = api.session(sessionId).data?.actualSession()
    suspend fun start(scannerId: String, batchId: String? = null, purpose: String? = null) = api.startSession(StartSessionRequest(scannerId, batchId, purpose)).data?.actualSession() ?: error("Session ID was not returned")
    fun hasQueuedChunk(sessionId: String, epcs: List<String>) = queue.all().any { it.sessionId == sessionId && it.epcs == epcs.distinct() }
    fun queuedScanCount(): Int = queue.all().size
    fun permanentlyRejectedUploads() = queue.permanentlyRejected()
    fun discardPermanentlyRejectedUploads() = queue.discardPermanentlyRejected()
    fun discardAllQueued() = queue.clearAll()
    fun discardSessionQueue(sessionId: String) = queue.removeForSession(sessionId)
    suspend fun stop(sessionId: String) = api.stop(sessionId)
    suspend fun clear(sessionId: String) = api.clear(sessionId)
    suspend fun heartbeat(body: HeartbeatRequest) = api.heartbeat(body)
    suspend fun acknowledgeCommand(id: String) = api.acknowledgeCommand(id)
}
