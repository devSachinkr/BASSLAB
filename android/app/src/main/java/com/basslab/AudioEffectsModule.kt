package com.basslab

import com.facebook.react.bridge.*

class AudioEffectsModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName() = "AudioEffects"

    @ReactMethod
    fun initialize(promise: Promise) {
        promise.resolve("Listening for audio sessions")
    }

    @ReactMethod
    fun setBass(value: Int, promise: Promise) {
        try {
            EffectsEngine.setBass(value)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("BASS_ERROR", e.message, e)
        }
    }
    @ReactMethod
     fun setPreset(name: String, promise: Promise) {
    try {
        EffectsEngine.setPreset(name)
        promise.resolve(true)
    } catch (e: Exception) {
        promise.reject("PRESET_ERROR", e.message, e)
    }
}
    @ReactMethod
    fun setEqualizerBand(band: Int, value: Int, promise: Promise) {
        try {
            EffectsEngine.setBand(band, value)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("EQ_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun getStatus(promise: Promise) {
        try {
            val (sessions, bands) = EffectsEngine.getInfo()

            val map = Arguments.createMap()
            map.putInt("activeSessions", sessions)
            map.putInt("bands", bands)

            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("STATUS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun release(promise: Promise) {
        try {
            EffectsEngine.releaseAll()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("RELEASE_ERROR", e.message, e)
        }
    }
}