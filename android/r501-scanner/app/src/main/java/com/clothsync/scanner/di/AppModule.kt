package com.clothsync.scanner.di

import android.content.Context
import androidx.room.Room
import com.clothsync.scanner.BuildConfig
import com.clothsync.scanner.data.*
import com.clothsync.scanner.rfid.R501RfidReader
import com.clothsync.scanner.rfid.RfidReader
import com.google.gson.Gson
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.runBlocking
import okhttp3.*
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module @InstallIn(SingletonComponent::class)
object AppModule {
    @Provides @Singleton fun database(@ApplicationContext context: Context): ScannerDatabase = Room.databaseBuilder(context, ScannerDatabase::class.java, "scanner.db").build()
    @Provides fun dao(db: ScannerDatabase) = db.offlineScans()
    @Provides @Singleton fun gson() = Gson()
    @Provides @Singleton fun api(store: SecureSessionStore, gson: Gson): MobileScannerApi {
        val client = OkHttpClient.Builder().connectTimeout(15, TimeUnit.SECONDS).readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor { chain -> chain.proceed(chain.request().newBuilder().apply { store.accessToken().takeIf { it.isNotBlank() }?.let { header("Authorization", "Bearer $it") } }.build()) }
            .authenticator { _, response ->
                if (responseCount(response) > 1 || store.refreshToken().isBlank()) return@authenticator null
                val refreshClient = Retrofit.Builder().baseUrl(BuildConfig.API_BASE_URL).addConverterFactory(GsonConverterFactory.create(gson)).client(OkHttpClient()).build().create(MobileScannerApi::class.java)
                val current = store.session.value ?: return@authenticator null
                val refreshed = runCatching { runBlocking { refreshClient.refresh(RefreshRequest(current.refreshToken, current.sessionId)).data } }.getOrNull() ?: run { store.clear(); return@authenticator null }
                store.save(current.copy(accessToken = refreshed.accessToken, refreshToken = refreshed.refreshToken.ifBlank { current.refreshToken }))
                response.request.newBuilder().header("Authorization", "Bearer ${refreshed.accessToken}").build()
            }.build()
        return Retrofit.Builder().baseUrl(BuildConfig.API_BASE_URL).client(client).addConverterFactory(GsonConverterFactory.create(gson)).build().create(MobileScannerApi::class.java)
    }
    @Provides @Singleton fun rfid(@ApplicationContext context: Context): RfidReader = R501RfidReader(context)
    private fun responseCount(response: Response): Int { var result = 1; var prior = response.priorResponse; while (prior != null) { result++; prior = prior.priorResponse }; return result }
}
