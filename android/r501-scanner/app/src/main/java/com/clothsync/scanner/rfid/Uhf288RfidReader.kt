package com.clothsync.scanner.rfid

import android.content.Context
import android.util.Log
import dalvik.system.DexClassLoader
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import java.io.File
import java.util.zip.ZipFile
import java.lang.reflect.Proxy

/** Adapter for the fixed UHF288 reader exposed by com.uhf288.scanlable. */
class Uhf288RfidReader(context: Context) : RfidReader {
    private companion object {
        const val TAG = "Uhf288RfidReader"

        // Android permits a native .so to be opened only once for each app
        // process. The fixed-reader screen can reconnect after a stop, so all
        // reader instances must use the same class loader.
        @Volatile
        private var vendorLoader: DexClassLoader? = null

        @Synchronized
        fun getVendorLoader(context: Context, vendorApk: String, nativeDir: File): DexClassLoader {
            return vendorLoader ?: DexClassLoader(
                vendorApk,
                context.codeCacheDir.path,
                nativeDir.path,
                Uhf288RfidReader::class.java.classLoader,
            ).also { vendorLoader = it }
        }
    }
    private val reads = MutableSharedFlow<RfidRead>(extraBufferCapacity = 1024)
    private val appContext = context.applicationContext
    private var library: Any? = null
    private var callback: Any? = null

    private fun method(target: Any?, name: String, count: Int) = target?.javaClass?.methods?.firstOrNull {
        it.name == name && it.parameterTypes.size == count
    }

    private fun invoke(target: Any?, name: String, vararg args: Any?): Any? = target?.let {
        val method = method(it, name, args.size) ?: return null
        runCatching { method.invoke(it, *args) }.onFailure {
            Log.e(TAG, "$name failed", it)
        }.getOrNull()
    }

    private fun invokeStarted(target: Any?, name: String): Boolean {
        val callable = method(target, name, 0) ?: return false
        return runCatching {
            val result = callable.invoke(target)
            when (result) {
                null -> true // UHF288 SDK uses void StartRead on some firmware.
                is Boolean -> result
                is Number -> result.toInt() == 0
                else -> true
            }
        }.getOrDefault(false)
    }

    override fun connect(): Boolean = runCatching {
        val vendor = appContext.packageManager
            .getApplicationInfo("com.uhf288.scanlable", 0).sourceDir
        val nativeDir = File(appContext.codeCacheDir, "uhf288-native").apply { mkdirs() }
        extractNativeLibrary(vendor, nativeDir)
        val loader = getVendorLoader(appContext, vendor, nativeDir)
        val type = loader.loadClass("com.rfid.trans2000.UHFLib")
        library = type.methods.firstNotNullOfOrNull { method ->
            if (method.name == "getInstance" && method.parameterTypes.isEmpty()) {
                runCatching { method.invoke(null) }.getOrNull()
            } else null
        } ?: type.getDeclaredConstructor(Int::class.javaPrimitiveType, String::class.java)
            .newInstance(0, "/dev/ttyS0")

        val callbackType = loader.loadClass("com.rfid.trans2000.TagCallback")
        callback = Proxy.newProxyInstance(callbackType.classLoader, arrayOf(callbackType)) { _, method, args ->
            if (method.name == "tagCallback") {
                val tag = args?.firstOrNull()
                val epc = listOf("epcId", "epc", "EPC").firstNotNullOfOrNull { field ->
                    runCatching { tag?.javaClass?.getField(field)?.get(tag)?.toString() }.getOrNull()
                        ?: runCatching { tag?.javaClass?.getMethod("get${field.replaceFirstChar(Char::uppercase)}")?.invoke(tag)?.toString() }.getOrNull()
                }
                epc?.trim()?.takeIf(String::isNotEmpty)?.let { reads.tryEmit(RfidRead(it.uppercase(), 0)) }
            }
            // tagCallbackFailed returns int in the UHF288 SDK. Returning null
            // there makes Java unboxing throw and can terminate the app.
            if (method.returnType == Int::class.javaPrimitiveType) 0 else null
        }
        val connectResult = invoke(library, "Connect", "/dev/ttyS0", 57600)
        if (connectResult !is Number || connectResult.toInt() != 0) {
            Log.e(TAG, "UHF288 Connect failed: $connectResult")
            return false
        }
        invoke(library, "SetCallBack", callback)
        Log.i(TAG, "UHF288 connected on /dev/ttyS0 at 57600")
        true
    }.onFailure { Log.e(TAG, "UHF288 initialization failed", it) }.getOrDefault(false)

    private fun extractNativeLibrary(apkPath: String, destination: File) {
        val output = File(destination, "libserial_port.so")
        if (output.exists() && output.length() > 0) return
        ZipFile(apkPath).use { apk ->
            val entry = apk.entries().asSequence().firstOrNull {
                it.name.endsWith("/libserial_port.so")
            } ?: error("libserial_port.so is missing from the UHF288 vendor APK")
            apk.getInputStream(entry).use { input -> output.outputStream().use { input.copyTo(it) } }
        }
        output.setReadable(true, false)
        output.setExecutable(true, false)
        Log.i(TAG, "Extracted UHF288 native serial library: ${output.path}")
    }

    override fun disconnect() {
        invoke(library, "StopRead")
        invoke(library, "DisConnect")
        callback = null
        library = null
    }

    override fun startInventory() = invokeStarted(library, "StartRead").also {
        Log.i(TAG, "UHF288 StartRead result: $it")
    }
    override fun stopInventory() { invoke(library, "StopRead") }
    override fun observeTags(): Flow<RfidRead> = reads
}
