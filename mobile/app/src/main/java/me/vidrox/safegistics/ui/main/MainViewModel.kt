package me.vidrox.safegistics.ui.main

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import me.vidrox.safegistics.apollo.entities.User

class MainViewModel : ViewModel() {
    val user: MutableLiveData<User?> = MutableLiveData()
}
