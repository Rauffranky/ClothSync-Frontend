package com.clothsync.scanner.data

import android.content.Context
import android.provider.Settings
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScannerRepository @Inject constructor(private val api: MobileScannerApi, private val store: SecureSessionStore, @ApplicationContext private val context: Context) {
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
    suspend fun start(scannerId: String) = api.startSession(StartSessionRequest(scannerId)).data?.actualSession() ?: error("Session ID was not returned")
    suspend fun upload(sessionId: String, epcs: List<String>, action: String?): ApiEnvelope<ScanResponseData> {
        // Each batch gets one UUID. The backend stores its payload hash, so a
        // caller retrying the same request is idempotent and a changed payload
        // with that UUID is rejected. Scans are never queued while offline.
        val request = ScanRequest(UUID.randomUUID().toString(), epcs.distinct(), action)
        return api.scans(sessionId, request)
    }
    suspend fun stop(sessionId: String) = api.stop(sessionId)
    suspend fun clear(sessionId: String) = api.clear(sessionId)
    suspend fun heartbeat(body: HeartbeatRequest) = api.heartbeat(body)
}
