package me.vidrox.safegistics.listeners.recyclerview

import android.view.View

interface RecyclerViewItemClickListener<T> {
    fun onClick(itemData: T?)
    fun onLongClick(view: View, itemData: T?)
}