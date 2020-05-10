package me.vidrox.safegistics.utils

import android.util.Base64
import java.nio.charset.StandardCharsets

object Crypto {
    fun encode64(textToEncode: String): String {
        val textData = textToEncode.toByteArray(StandardCharsets.UTF_8)
        return Base64.encodeToString(textData, Base64.DEFAULT)
    }

    fun decode64(textToDecode: String): String {
        val decodedData = Base64.decode(textToDecode, Base64.DEFAULT)
        return String(decodedData, StandardCharsets.UTF_8)
    }
}