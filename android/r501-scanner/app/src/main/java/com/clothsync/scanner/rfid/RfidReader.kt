package com.clothsync.scanner.rfid

import android.content.Context
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import java.lang.reflect.Proxy

data class RfidRead(val epc: String, val rssi: Int, val timestamp: Long = System.currentTimeMillis())
interface RfidReader { fun connect(): Boolean; fun disconnect(); fun startInventory(): Boolean; fun stopInventory(); fun observeTags(): Flow<RfidRead> }

class R501RfidReader(context: Context) : RfidReader {
    private val reads = MutableSharedFlow<RfidRead>(extraBufferCapacity = 1024)
    private val appContext = context.applicationContext
    private var manager: Any? = null
    private var barcodeManager: Any? = null
    private var listener: Any? = null
    private var listenerRegistered = false

    private fun invoke(target: Any?, method: String, vararg args: Any?): Any? {
        if (target == null) return null
        val candidate = target.javaClass.methods.firstOrNull { it.name == method && it.parameterTypes.size == args.size }
            ?: return null
        return runCatching { candidate.invoke(target, *args) }.getOrNull()
    }

    private fun loadManager(className: String, factory: String): Any? = runCatching {
        val type = Class.forName(className)
        type.getMethod(factory, Context::class.java).invoke(null, appContext)
    }.getOrNull()

    override fun connect(): Boolean = runCatching {
        manager = loadManager("android.bld.RFIDManager", "getDefaultInstance")
            ?: loadManager("android.bld.RFIDManager", "getInstance")
        barcodeManager = loadManager("android.bld.ScanManager", "getDefaultInstance")
        val rfid = manager ?: error("RFID SDK is not available on this device")
        val listenerType = Class.forName("android.bld.rfid.aidl.RFIDServerListener")
        listener = Proxy.newProxyInstance(listenerType.classLoader ?: ClassLoader.getSystemClassLoader(), arrayOf(listenerType)) { _, method, args ->
            if (method.name == "onScanData") {
                val data = args?.firstOrNull()
                val epc = runCatching { data?.javaClass?.getField("epcId")?.get(data)?.toString() }.getOrNull()
                    ?: runCatching { data?.javaClass?.getMethod("getEpcId")?.invoke(data)?.toString() }.getOrNull()
                val rssi = runCatching { data?.javaClass?.getField("rssi")?.get(data)?.toString()?.toInt() ?: 0 }.getOrDefault(0)
                epc?.trim()?.takeIf { it.isNotEmpty() }?.let { reads.tryEmit(RfidRead(it.uppercase(), rssi)) }
            }
            null
        }
        if (!listenerRegistered) { invoke(rfid, "registerListener", listener); listenerRegistered = true }
        if (invoke(rfid, "getRFIDType") == 0) { invoke(rfid, "setRFIDType", 32); Thread.sleep(2_000) }
        if (invoke(rfid, "isOpened") != true) invoke(rfid, "open")
        if (invoke(rfid, "isConnected") != true) invoke(rfid, "connect")
        invoke(barcodeManager, "setHandleKey", false)
        invoke(rfid, "setHandleKey", true)
        invoke(rfid, "setOutputMode", 5)
        invoke(rfid, "setContinuousScan", true)
        invoke(rfid, "setDisableSame", false)
        invoke(rfid, "isConnected") == true || invoke(rfid, "isOpened") == true
    }.getOrDefault(false)
    override fun disconnect() { invoke(manager, "stopScan"); invoke(manager, "setHandleKey", false); invoke(barcodeManager, "setHandleKey", true); if (listenerRegistered) { invoke(manager, "unregisterListener", listener); listenerRegistered = false }; invoke(manager, "disconnect"); invoke(manager, "close") }
    override fun startInventory() = invoke(manager, "startScan") == true
    override fun stopInventory() { invoke(manager, "stopScan") }
    override fun observeTags(): Flow<RfidRead> = reads
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
