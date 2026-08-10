package com.clothsync.scanner.rfid

class TagDeduplicator(private val windowMs: Long = 1_500) {
    private val seenAt = mutableMapOf<String, Long>()
    fun accept(epc: String, now: Long): Boolean { val last = seenAt[epc] ?: Long.MIN_VALUE; if (last != Long.MIN_VALUE && now - last < windowMs) return false; seenAt[epc] = now; return true }
    fun clear() = seenAt.clear()
}
