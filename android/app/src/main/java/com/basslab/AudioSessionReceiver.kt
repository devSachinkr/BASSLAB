package com.basslab

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.audiofx.AudioEffect
import android.util.Log

class AudioSessionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {

        val sessionId = intent.getIntExtra(
            AudioEffect.EXTRA_AUDIO_SESSION,
            -1
        )

        Log.d("BassLabReceiver", "Action: ${intent.action}, Session: $sessionId")

        when (intent.action) {

            AudioEffect.ACTION_OPEN_AUDIO_EFFECT_CONTROL_SESSION -> {
                EffectsEngine.attach(sessionId)
            }

            AudioEffect.ACTION_CLOSE_AUDIO_EFFECT_CONTROL_SESSION -> {
                EffectsEngine.detach(sessionId)
            }
        }
    }
}