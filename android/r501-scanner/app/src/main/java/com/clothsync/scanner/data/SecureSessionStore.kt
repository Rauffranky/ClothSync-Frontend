package com.clothsync.scanner.data

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecureSessionStore @Inject constructor(@ApplicationContext context: Context) {
    private val prefs = EncryptedSharedPreferences.create(context, "secure_session", MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(), EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV, EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM)
    private val state = MutableStateFlow(read())
    val session: StateFlow<StoredSession?> = state
    fun save(value: StoredSession) { prefs.edit().putString("access", value.accessToken).putString("refresh", value.refreshToken).putString("session", value.sessionId).putString("portal", value.portalType).putString("user_id", value.userId).putString("user_name", value.userName).putString("owner_id", value.ownerId).apply(); state.value = value }
    fun accessToken(): String = prefs.getString("access", "").orEmpty()
    fun refreshToken(): String = prefs.getString("refresh", "").orEmpty()
    fun clear() { prefs.edit().clear().apply(); state.value = null }
    private fun read(): StoredSession? { val access = prefs.getString("access", null) ?: return null; return StoredSession(access, prefs.getString("refresh", "").orEmpty(), prefs.getString("session", "").orEmpty(), prefs.getString("portal", "").orEmpty(), prefs.getString("user_id", "").orEmpty(), prefs.getString("user_name", "").orEmpty(), prefs.getString("owner_id", "").orEmpty()) }
}
