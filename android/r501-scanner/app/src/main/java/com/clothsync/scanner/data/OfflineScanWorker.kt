package com.clothsync.scanner.data

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import retrofit2.HttpException

@HiltWorker
class OfflineScanWorker @AssistedInject constructor(@Assisted context: Context, @Assisted params: WorkerParameters, private val api: MobileScannerApi, private val dao: OfflineScanDao, private val gson: Gson) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result {
        for (item in dao.pending()) {
            try {
                val epcs: List<String> = gson.fromJson(item.epcsJson, object : TypeToken<List<String>>() {}.type)
                api.scans(item.sessionId, ScanRequest(item.requestId, epcs, item.scanAction))
                dao.delete(item)
            } catch (error: Exception) {
                val retry = error !is HttpException || error.code() in listOf(500, 502, 503, 504)
                return if (retry) Result.retry() else Result.failure()
            }
        }
        return Result.success()
    }
}
