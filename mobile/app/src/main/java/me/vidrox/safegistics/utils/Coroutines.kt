package me.vidrox.safegistics.utils

import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

object Coroutines {
    fun mainThread(asyncJob: suspend (() -> Unit)) =
        CoroutineScope(Dispatchers.Main).launch {
            asyncJob()
        }

    fun ioThread(asyncJob: suspend (() -> Unit)) =
        CoroutineScope(Dispatchers.IO).launch {
            asyncJob()
        }
}