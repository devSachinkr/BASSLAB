package com.basslab

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import android.util.Log

object EffectsEngine {

    private class Session(
        val eq: Equalizer,
        val bass: BassBoost
    )

    private val sessions = mutableMapOf<Int, Session>()

    private var bassStrength = 0
    private var bandLevels = mutableMapOf<Int, Int>()
    private var currentPreset = "Balanced"

    @Synchronized
    fun attach(sessionId: Int) {
        if (sessionId <= 0 || sessions.containsKey(sessionId)) return

        try {
            val eq = Equalizer(0, sessionId)
            val bass = BassBoost(0, sessionId)

            eq.enabled = true
            bass.enabled = true

            sessions[sessionId] = Session(eq, bass)
            applyTo(sessions[sessionId]!!)

            Log.d("EffectsEngine", "Attached session: $sessionId")
        } catch (e: Exception) {
            Log.e("EffectsEngine", "Attach failed", e)
        }
    }

    @Synchronized
    fun detach(sessionId: Int) {
        sessions.remove(sessionId)?.let {
            it.eq.release()
            it.bass.release()
        }

        Log.d("EffectsEngine", "Detached session: $sessionId")
    }

    @Synchronized
    fun setBass(strength: Int) {
        bassStrength = strength.coerceIn(0, 1000)
        currentPreset = "Custom"

        sessions.values.forEach { applyTo(it) }

        Log.d("EffectsEngine", "Bass strength: $bassStrength")
    }

    @Synchronized
    fun setBand(band: Int, level: Int) {
        bandLevels[band] = level
        currentPreset = "Custom"

        sessions.values.forEach { applyTo(it) }
    }

    @Synchronized
    fun setPreset(name: String) {
        bandLevels.clear()

        when (name.lowercase()) {

            "balanced" -> {
                bassStrength = 300
            }

            "basshead" -> {
                bassStrength = 900
                bandLevels[-1] = 0
            }

            "edm" -> {
                bassStrength = 750
            }

            "dubstep" -> {
                bassStrength = 1000
            }

            "gaming" -> {
                bassStrength = 250
            }

            else -> {
                bassStrength = 300
            }
        }

        currentPreset = name

        sessions.values.forEach { applyTo(it) }

        Log.d("EffectsEngine", "Preset applied: $name")
    }

    @Synchronized
    fun getInfo(): Pair<Int, Int> {
        val bands = sessions.values.firstOrNull()?.eq?.numberOfBands?.toInt() ?: 0
        return Pair(sessions.size, bands)
    }

    @Synchronized
    fun releaseAll() {
        sessions.values.forEach {
            it.eq.release()
            it.bass.release()
        }

        sessions.clear()
    }

    private fun presetGain(frequency: Int): Int {
        val freq = frequency / 1000

        return when (currentPreset.lowercase()) {

            "balanced" -> when {
                freq < 100 -> 150
                freq < 250 -> 50
                freq < 2000 -> 0
                freq < 8000 -> 50
                else -> 100
            }

            "basshead" -> when {
                freq < 100 -> 500
                freq < 250 -> 350
                freq < 1000 -> 100
                freq < 5000 -> 0
                else -> 100
            }

            "edm" -> when {
                freq < 100 -> 450
                freq < 250 -> 300
                freq < 1000 -> 0
                freq < 5000 -> 100
                else -> 250
            }

            "dubstep" -> when {
    freq < 100 -> 700
    freq < 250 -> 450
    freq < 1000 -> 100
    freq < 4000 -> 0
    freq < 8000 -> 150
    else -> 250
}

            "gaming" -> when {
                freq < 100 -> -300
                freq < 250 -> -150
                freq < 1000 -> 100
                freq < 4000 -> 300
                freq < 8000 -> 350
                else -> 200
            }

            else -> 0
        }
    }

    private fun applyTo(session: Session) {
        try {
            if (session.bass.strengthSupported) {
                session.bass.setStrength(bassStrength.toShort())
            }

            val range = session.eq.bandLevelRange
            val maxLevel = range[1].toInt()
            val minLevel = range[0].toInt()

            for (band in 0 until session.eq.numberOfBands) {

                val frequency =
                    session.eq.getCenterFreq(band.toShort()).toInt()

                val gain = presetGain(frequency)

                session.eq.setBandLevel(
                    band.toShort(),
                    gain.coerceIn(minLevel, maxLevel).toShort()
                )
            }

            bandLevels.forEach { (band, level) ->
                if (band in 0 until session.eq.numberOfBands) {
                    session.eq.setBandLevel(
                        band.toShort(),
                        level.coerceIn(minLevel, maxLevel).toShort()
                    )
                }
            }

            session.eq.enabled = true
            session.bass.enabled = bassStrength > 0

        } catch (e: Exception) {
            Log.e("EffectsEngine", "Apply failed", e)
        }
    }
}