package com.clothsync.scanner.data

import com.google.gson.annotations.SerializedName

data class ApiEnvelope<T>(val success: Boolean = false, val message: String = "", val data: T? = null)
data class LoginRequest(val email: String, val password: String, val deviceId: String, val deviceName: String, val platform: String = "android", val appVersion: String = "1.0.0")
data class RefreshRequest(val refreshToken: String, val sessionId: String)
data class DeviceIdentityRequest(
    val hardwareIdentifier: String,
    val hardwareIdentifierType: String = "android_id",
    val scannerFamily: String? = null,
    val deviceModel: String? = null,
    val platform: String = "android",
    val appVersion: String? = null,
    val metadata: Map<String, Any>? = null,
)
data class DeviceIdentityData(
    val outcome: String? = null,
    val scanner: ScannerDto? = null,
    val message: String? = null,
)
data class LoginData(val accessToken: String, val refreshToken: String, val sessionId: String, val portalType: String = "", val accessTokenExpiresAt: String? = null, val user: UserDto? = null, val owner: UserDto? = null)
data class UserDto(val id: String = "", val fullName: String = "", val email: String = "")
data class ScannerTranslationDto(val zoneName: String? = null, val locationName: String? = null)
data class ScannerDto(
    val scannerUuid: String? = null,
    val scannerCode: String? = null,
    val id: String? = null,
    val scannerId: String? = null,
    val name: String? = null,
    val scannerName: String? = null,
    val scannerType: String? = null,
    val scannerMode: String? = null,
    val location: String? = null,
    val zoneName: String? = null,
    val locationName: String? = null,
    val scannerLocation: String? = null,
    val translations: Map<String, ScannerTranslationDto>? = null,
    val assignedOperator: UserDto? = null,
    val status: String? = null,
)
fun ScannerDto.actualUuid(): String? = scannerUuid?.takeIf { it.isNotBlank() } ?: id?.takeIf { it.isNotBlank() }
fun ScannerDto.displayCode(): String = scannerCode?.takeIf { it.isNotBlank() } ?: scannerId.orEmpty()
fun ScannerDto.displayName(): String = name?.takeIf { it.isNotBlank() } ?: scannerName?.takeIf { it.isNotBlank() } ?: displayCode()
fun ScannerDto.displayLocation(): String = location?.takeIf { it.isNotBlank() }
    ?: zoneName?.takeIf { it.isNotBlank() }
    ?: locationName?.takeIf { it.isNotBlank() }
    ?: scannerLocation?.takeIf { it.isNotBlank() }
    ?: translations?.get("en")?.zoneName?.takeIf { it.isNotBlank() }
    ?: translations?.get("en")?.locationName?.takeIf { it.isNotBlank() }
    ?: translations?.values?.firstNotNullOfOrNull { translation ->
        translation.zoneName?.takeIf { it.isNotBlank() }
            ?: translation.locationName?.takeIf { it.isNotBlank() }
    }
    ?: "—"
data class ScannerListData(val items: List<ScannerDto> = emptyList())
data class SelectScannerRequest(val deviceId: String)
data class BatchBusinessDto(
    val businessName: String? = null,
    val companyName: String? = null,
    val name: String? = null,
)
data class BatchDto(
    @SerializedName(value = "id", alternate = ["_id"])
    val id: String? = null,
    val batchId: String? = null,
    @SerializedName(value = "batchCode", alternate = ["code"])
    val batchCode: String? = null,
    val businessName: String? = null,
    val tenant: BatchBusinessDto? = null,
    val business: BatchBusinessDto? = null,
    val status: String? = null,
    val statusLabel: String? = null,
    val totalItems: Int? = null,
    val itemsCount: Int? = null,
    val totalTagsCount: Int? = null,
    val dispatchedAt: String? = null,
    val dispatchDate: String? = null,
    val createdAt: String? = null,
)
fun BatchDto.actualId(): String? = id?.takeIf { it.isNotBlank() }
fun BatchDto.displayCode(): String = batchCode?.takeIf { it.isNotBlank() }
    ?: batchId?.takeIf { it.isNotBlank() }
    ?: actualId().orEmpty()
fun BatchDto.displayBusiness(): String = tenant?.businessName?.takeIf { it.isNotBlank() }
    ?: tenant?.companyName?.takeIf { it.isNotBlank() }
    ?: tenant?.name?.takeIf { it.isNotBlank() }
    ?: business?.businessName?.takeIf { it.isNotBlank() }
    ?: business?.companyName?.takeIf { it.isNotBlank() }
    ?: business?.name?.takeIf { it.isNotBlank() }
    ?: businessName.orEmpty()
fun BatchDto.displayStatus(): String = statusLabel?.takeIf { it.isNotBlank() } ?: status.orEmpty()
fun BatchDto.displayTotal(): Int = totalItems ?: itemsCount ?: totalTagsCount ?: 0
fun BatchDto.displayDispatchDate(): String = dispatchedAt ?: dispatchDate ?: createdAt.orEmpty()
data class BatchListData(val items: List<BatchDto> = emptyList())
data class StartSessionRequest(val scannerId: String, val batchId: String? = null, val sessionPurpose: String? = null)
data class SessionDto(val id: String? = null, val status: String = "active", val scannerId: String? = null, val batchId: String? = null, val laundryBatchId: String? = null, val sessionPurpose: String? = null)
data class StartSessionData(val id: String? = null, val status: String = "active", val session: SessionDto? = null) {
    fun actualSession(): SessionDto? = session?.takeIf { !it.id.isNullOrBlank() }
        ?: id?.takeIf { it.isNotBlank() }?.let { SessionDto(it, status) }
}
data class ScanRequest(val requestId: String, val epcs: List<String>, val scanAction: String? = null)
data class ScanCounters(
    val receivedCount: Int = 0,
    val uniqueCount: Int = 0,
    val processedCount: Int = 0,
    val rejectedCount: Int = 0,
    val duplicateCount: Int = 0,
    val checkedInCount: Int = 0,
    val checkedOutCount: Int = 0,
    val rejectionReasons: Map<String, Int> = emptyMap(),
)
data class BatchCounterDto(val batchId: String? = null, val batchCode: String? = null, val checkedInCount: Int = 0, val checkedOutCount: Int = 0, val acceptedCount: Int = 0, val rejectedCount: Int = 0)
data class ScanResultDto(val epc: String = "", val accepted: Boolean = false, val batchId: String? = null, val batchCode: String? = null, val reason: String? = null, val status: String? = null, val statusLabel: String? = null, val details: String? = null)
data class UndoDto(val id: String = "", val expiresAt: String = "", val durationSeconds: Int = 0, val displayDuration: String = "")
data class ScanResponseData(val session: SessionDto? = null, val counters: ScanCounters = ScanCounters(), val affectedBatchIds: List<String> = emptyList(), val batchCounters: List<BatchCounterDto> = emptyList(), val undos: List<UndoDto> = emptyList(), val results: List<ScanResultDto> = emptyList())
data class HeartbeatRequest(
    val scannerId: String,
    val appVersion: String = "1.0.0",
    val batteryLevel: Int,
    val networkState: String,
    val rfidConnected: Boolean,
    val metadata: Map<String, Any>? = null,
)
data class RemoteScannerCommand(val id: String? = null, val command: String? = null)
data class HeartbeatData(val scannerActive: Boolean = true, val command: RemoteScannerCommand? = null)

data class StoredSession(val accessToken: String, val refreshToken: String, val sessionId: String, val portalType: String, val userId: String, val userName: String, val ownerId: String)
