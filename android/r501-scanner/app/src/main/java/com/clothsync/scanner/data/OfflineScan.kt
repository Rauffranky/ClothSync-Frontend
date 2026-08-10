package com.clothsync.scanner.data

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "offline_scans")
data class OfflineScanEntity(@PrimaryKey val requestId: String, val sessionId: String, val epcsJson: String, val scanAction: String?, val createdAt: Long, val retryCount: Int = 0, val syncStatus: String = "pending", val lastError: String? = null)

@Dao
interface OfflineScanDao {
    @Query("SELECT * FROM offline_scans WHERE syncStatus = 'pending' ORDER BY createdAt") suspend fun pending(): List<OfflineScanEntity>
    @Query("SELECT COUNT(*) FROM offline_scans WHERE syncStatus = 'pending'") fun pendingCount(): Flow<Int>
    @Insert(onConflict = OnConflictStrategy.REPLACE) suspend fun save(item: OfflineScanEntity)
    @Delete suspend fun delete(item: OfflineScanEntity)
    @Query("DELETE FROM offline_scans") suspend fun clear()
}

@Database(entities = [OfflineScanEntity::class], version = 1, exportSchema = false)
abstract class ScannerDatabase : RoomDatabase() { abstract fun offlineScans(): OfflineScanDao }
