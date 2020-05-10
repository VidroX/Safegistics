package me.vidrox.safegistics.listeners

import me.vidrox.safegistics.exceptions.ExceptionWithCode

interface RequestListener<T: Any> {
    fun onRequest()
    fun onSuccess(result: T?)
    fun onError(e: List<ExceptionWithCode> = emptyList())
}