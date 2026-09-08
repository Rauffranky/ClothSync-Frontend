package com.clothsync.scanner.rfid

import org.junit.Assert.*
import org.junit.Test

class TagDeduplicatorTest {
    @Test fun keepsRejecting_a_tag_that_remains_in_range() { val subject = TagDeduplicator(1_500); assertTrue(subject.accept("EPC-1", 1_000)); assertFalse(subject.accept("EPC-1", 2_000)); assertFalse(subject.accept("EPC-1", 2_500)); assertFalse(subject.accept("EPC-1", 3_000)) }
    @Test fun accepts_a_tag_after_it_leaves_and_returns() { val subject = TagDeduplicator(1_500); assertTrue(subject.accept("EPC-1", 1_000)); assertFalse(subject.accept("EPC-1", 1_800)); assertTrue(subject.accept("EPC-1", 3_300)) }
    @Test fun acceptsDifferentEpcs() { val subject = TagDeduplicator(); assertTrue(subject.accept("EPC-1", 1)); assertTrue(subject.accept("EPC-2", 2)) }
    @Test fun clearStartsNewWindow() { val subject = TagDeduplicator(); assertTrue(subject.accept("EPC-1", 1)); subject.clear(); assertTrue(subject.accept("EPC-1", 2)) }
}
