package com.clothsync.scanner.data

import android.content.Context
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

data class QueuedScan(val requestId: String, val sessionId: String, val epcs: List<String>, val scanAction: String? = null, val createdAt: Long = System.currentTimeMillis(), val attemptCount: Int = 0, val lastError: String? = null, val scannerId: String? = null, val batchId: String? = null)

@Singleton
class ScanQueueStore @Inject constructor(@ApplicationContext context: Context, private val gson: Gson) {
    private val prefs = context.getSharedPreferences("scan_upload_queue", Context.MODE_PRIVATE)
    private val type = object : TypeToken<List<QueuedScan>>() {}.type
    @Synchronized fun all(): List<QueuedScan> = gson.fromJson<List<QueuedScan>>(prefs.getString(KEY, "[]"), type) ?: emptyList()
    @Synchronized fun enqueue(item: QueuedScan) { if (all().none { it.requestId == item.requestId }) save(all() + item) }
    @Synchronized fun remove(requestId: String) { save(all().filterNot { it.requestId == requestId }) }
    @Synchronized fun removeForSession(sessionId: String) { save(all().filterNot { it.sessionId == sessionId }) }
    @Synchronized fun clearAll() { save(emptyList()) }
    @Synchronized fun markFailed(item: QueuedScan, error: String) { save(all().map { if (it.requestId == item.requestId) item.copy(attemptCount = item.attemptCount + 1, lastError = error) else it }) }
    @Synchronized fun permanentlyRejected(): List<QueuedScan> = all().filter { item ->
        val err = item.lastError.orEmpty()
        err.contains(Regex("HTTP (400|401|403|404|409|410|422)")) ||
        err.contains("closed", ignoreCase = true) ||
        err.contains("expired", ignoreCase = true) ||
        err.contains("not found", ignoreCase = true) ||
        err.contains("invalid", ignoreCase = true) ||
        err.contains("reconciliation", ignoreCase = true) ||
        item.attemptCount >= 3
    }
    @Synchronized fun discardPermanentlyRejected(): Int {
        val rejected = permanentlyRejected()
        if (rejected.isEmpty()) {
            val failed = all().filter { it.lastError != null || it.attemptCount > 0 }
            if (failed.isNotEmpty()) {
                val failedIds = failed.map { it.requestId }.toSet()
                save(all().filterNot { it.requestId in failedIds })
                return failedIds.size
            }
            return 0
        }
        val rejectedIds = rejected.map { it.requestId }.toSet()
        save(all().filterNot { it.requestId in rejectedIds })
        return rejectedIds.size
    }
    private fun save(items: List<QueuedScan>) { check(prefs.edit().putString(KEY, gson.toJson(items)).commit()) { "Could not persist scan uploads; scanning must stop" } }
    companion object { private const val KEY = "items" }
}
