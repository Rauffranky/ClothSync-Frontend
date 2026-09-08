package com.clothsync.scanner.rfid

class TagDeduplicator(private val windowMs: Long = 1_500) {
    private val seenAt = mutableMapOf<String, Long>()
    // Every callback refreshes presence. A tag is accepted only after it has
    // been absent for the configured window, avoiding repeat uploads while it
    // remains in the fixed reader's field.
    fun accept(epc: String, now: Long): Boolean {
        val last = seenAt.put(epc, now)
        return last == null || now - last >= windowMs
    }
    fun clear() = seenAt.clear()
}
