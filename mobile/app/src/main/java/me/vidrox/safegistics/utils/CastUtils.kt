package me.vidrox.safegistics.utils

object CastUtils {
    inline fun <reified T> Any?.tryCast(block: T.() -> Unit) {
        if (this is T) {
            block()
        }
    }
}