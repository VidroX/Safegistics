package me.vidrox.safegistics.listeners.recyclerview

import me.vidrox.safegistics.exceptions.ExceptionWithCode

interface PageRequestListener<T: Any> {
    fun onRequest()
    fun onSuccess(result: T, cursor: String, hasNextPage: Boolean)
    fun onError(e: List<ExceptionWithCode>)
}