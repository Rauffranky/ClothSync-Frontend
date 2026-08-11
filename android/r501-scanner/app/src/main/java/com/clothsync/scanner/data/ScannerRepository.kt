package com.clothsync.scanner.data

import android.content.Context
import android.provider.Settings
import androidx.work.*
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import retrofit2.HttpException
import java.util.UUID
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScannerRepository @Inject constructor(private val api: MobileScannerApi, private val store: SecureSessionStore, private val dao: OfflineScanDao, private val gson: Gson, @ApplicationContext private val context: Context) {
    val storedSession = store.session
    val pendingOffline: Flow<Int> = dao.pendingCount()
    suspend fun login(email: String, password: String): StoredSession {
        val data = api.login(LoginRequest(email.trim(), password, Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID), android.os.Build.MODEL)).data ?: error("Invalid login response")
        return StoredSession(data.accessToken, data.refreshToken, data.sessionId, data.portalType, data.user?.id.orEmpty(), data.user?.fullName.orEmpty(), data.owner?.id.orEmpty()).also(store::save)
    }
    suspend fun logout() { runCatching { api.logout() }; dao.clear(); store.clear() }
    suspend fun scanners() = api.scanners().data?.items.orEmpty().filter { it.status.isNullOrBlank() || it.status.equals("active", true) }
    suspend fun selectScanner(scanner: ScannerDto): ScannerDto {
        val uuid = scanner.actualUuid() ?: error("Scanner UUID is missing. Refresh scanners and try again.")
        return api.selectScanner(uuid, SelectScannerRequest(Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID))).data ?: scanner
    }
    suspend fun batches() = api.batches().data?.items.orEmpty()
    suspend fun start(scannerId: String, batchId: String?) = api.startSession(StartSessionRequest(scannerId, batchId)).data?.actualSession() ?: error("Session ID was not returned")
    suspend fun upload(sessionId: String, epcs: List<String>, action: String?): ApiEnvelope<ScanResponseData> {
        val request = ScanRequest(UUID.randomUUID().toString(), epcs, action)
        return try { api.scans(sessionId, request) } catch (error: Exception) { if (retryable(error)) { dao.save(OfflineScanEntity(request.requestId, sessionId, gson.toJson(epcs), action, System.currentTimeMillis())); scheduleSync() }; throw error }
    }
    suspend fun stop(sessionId: String) = api.stop(sessionId)
    suspend fun clear(sessionId: String) = api.clear(sessionId)
    suspend fun heartbeat(body: HeartbeatRequest) = api.heartbeat(body)
    private fun retryable(error: Exception): Boolean = error !is HttpException || error.code() in listOf(500, 502, 503, 504)
    private fun scheduleSync() { WorkManager.getInstance(context).enqueueUniqueWork("offline-scan-sync", ExistingWorkPolicy.KEEP, OneTimeWorkRequestBuilder<OfflineScanWorker>().setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 15, TimeUnit.SECONDS).setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build()).build()) }
}
