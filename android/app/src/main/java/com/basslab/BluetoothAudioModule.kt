package com.basslab

import android.content.Context
import android.media.AudioDeviceInfo
import android.media.AudioManager
import com.facebook.react.bridge.*

class BluetoothAudioModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "BluetoothAudio"

    @ReactMethod
    fun getConnectedAudioDevices(promise: Promise) {
        try {
            val audioManager =
                reactApplicationContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

            val devices = audioManager.getDevices(AudioManager.GET_DEVICES_OUTPUTS)

            val result = Arguments.createArray()

            for (device in devices) {
                val isBluetooth =
                    device.type == AudioDeviceInfo.TYPE_BLUETOOTH_A2DP ||
                    device.type == AudioDeviceInfo.TYPE_BLUETOOTH_SCO ||
                    (android.os.Build.VERSION.SDK_INT >= 31 &&
                     device.type == AudioDeviceInfo.TYPE_BLE_HEADSET)

                if (isBluetooth) {
                    val item = Arguments.createMap()

                    item.putString("name", device.productName.toString())
                    item.putString("type", device.type.toString())
                    item.putBoolean("connected", true)

                    result.pushMap(item)
                }
            }

            promise.resolve(result)

        } catch (e: Exception) {
            promise.reject("BLUETOOTH_ERROR", e.message, e)
        }
    }
}