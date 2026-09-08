package com.clothsync.scanner.data

import retrofit2.http.*

interface MobileScannerApi {
    @POST("login") suspend fun login(@Body body: LoginRequest): ApiEnvelope<LoginData>
    @POST("refresh") suspend fun refresh(@Body body: RefreshRequest): ApiEnvelope<LoginData>
    @POST("logout") suspend fun logout(): ApiEnvelope<Unit>
    @POST("device/identify") suspend fun identifyDevice(@Body body: DeviceIdentityRequest): ApiEnvelope<DeviceIdentityData>
    @GET("scanners") suspend fun scanners(): ApiEnvelope<ScannerListData>
    @POST("scanners/{scannerId}/select") suspend fun selectScanner(@Path("scannerId") id: String, @Body body: SelectScannerRequest): ApiEnvelope<ScannerDto>
    @GET("scanners/{scannerId}/active-session") suspend fun activeSession(@Path("scannerId") id: String): ApiEnvelope<StartSessionData>
    @GET("incoming-batches") suspend fun batches(): ApiEnvelope<BatchListData>
    @POST("sessions/start") suspend fun startSession(@Body body: StartSessionRequest): ApiEnvelope<StartSessionData>
    @POST("sessions/{sessionId}/scans") suspend fun scans(@Path("sessionId") id: String, @Body body: ScanRequest): ApiEnvelope<ScanResponseData>
    @GET("sessions/{sessionId}") suspend fun session(@Path("sessionId") id: String): ApiEnvelope<StartSessionData>
    @POST("sessions/{sessionId}/stop") suspend fun stop(@Path("sessionId") id: String): ApiEnvelope<StartSessionData>
    @PUT("sessions/{sessionId}/clear") suspend fun clear(@Path("sessionId") id: String): ApiEnvelope<Unit>
    @POST("heartbeat") suspend fun heartbeat(@Body body: HeartbeatRequest): ApiEnvelope<HeartbeatData>
    @POST("commands/{commandId}/ack") suspend fun acknowledgeCommand(@Path("commandId") id: String): ApiEnvelope<Unit>
}
