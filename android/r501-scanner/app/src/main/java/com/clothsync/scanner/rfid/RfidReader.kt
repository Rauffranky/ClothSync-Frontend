package com.clothsync.scanner.rfid

import android.bld.RFIDManager
import android.bld.ScanManager
import android.bld.rfid.aidl.RFIDServerListener
import android.bld.rfid.aidl.TagData
import android.content.Context
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow

data class RfidRead(val epc: String, val rssi: Int, val timestamp: Long = System.currentTimeMillis())
interface RfidReader { fun connect(): Boolean; fun disconnect(); fun startInventory(): Boolean; fun stopInventory(); fun observeTags(): Flow<RfidRead> }

class R501RfidReader(context: Context) : RfidReader, RFIDServerListener {
    private val reads = MutableSharedFlow<RfidRead>(extraBufferCapacity = 1024)
    private val appContext = context.applicationContext
    private var manager = RFIDManager.getInstance(appContext)
    private val barcodeManager = ScanManager.getDefaultInstance(appContext)
    private var listenerRegistered = false
    override fun connect(): Boolean = runCatching {
        if (manager.getRFIDType() == 0) {
            manager.setRFIDType(32)
            Thread.sleep(2_000)
            manager = RFIDManager.getInstance(appContext)
        }
        if (!listenerRegistered) { manager.registerListener(this); listenerRegistered = true }
        if (!manager.isOpened()) manager.open()
        if (!manager.isConnected()) manager.connect()
        barcodeManager.setHandleKey(false)
        manager.setHandleKey(true)
        manager.setOutputMode(5)
        manager.setContinuousScan(true)
        manager.setDisableSame(false)
        manager.isConnected() || manager.isOpened()
    }.getOrDefault(false)
    override fun disconnect() { runCatching { manager.stopScan() }; runCatching { manager.setHandleKey(false) }; runCatching { barcodeManager.setHandleKey(true) }; if (listenerRegistered) { runCatching { manager.unregisterListener(this) }; listenerRegistered = false }; runCatching { manager.disconnect() }; runCatching { manager.close() } }
    override fun startInventory() = manager.startScan()
    override fun stopInventory() { manager.stopScan() }
    override fun observeTags(): Flow<RfidRead> = reads
    override fun onScanData(data: TagData?) { data?.epcId?.trim()?.takeIf { it.isNotEmpty() }?.let { reads.tryEmit(RfidRead(it.uppercase(), data.rssi)) } }
    override fun onBoot(a: Boolean, b: Boolean) = Unit
    override fun onClose(ok: Boolean) = Unit
    override fun onConnect(ok: Boolean) = Unit
    override fun onDisconnect(ok: Boolean) = Unit
    override fun onOpen(ok: Boolean) = Unit
}

class MockRfidReader : RfidReader {
    private val reads = MutableSharedFlow<RfidRead>(extraBufferCapacity = 64)
    override fun connect() = true
    override fun disconnect() = Unit
    override fun startInventory() = true
    override fun stopInventory() = Unit
    override fun observeTags(): Flow<RfidRead> = reads
    fun emit(epc: String) { reads.tryEmit(RfidRead(epc, -45)) }
}
