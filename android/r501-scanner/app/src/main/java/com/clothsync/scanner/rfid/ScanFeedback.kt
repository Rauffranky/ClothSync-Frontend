package com.clothsync.scanner.rfid

import android.media.AudioManager
import android.media.ToneGenerator
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ScanFeedback @Inject constructor() {
    private val tone = ToneGenerator(AudioManager.STREAM_MUSIC, 90)

    fun acceptedTag() {
        tone.startTone(ToneGenerator.TONE_PROP_BEEP, 90)
    }
}
