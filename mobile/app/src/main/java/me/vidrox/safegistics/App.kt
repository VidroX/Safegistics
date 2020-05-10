package me.vidrox.safegistics

import android.app.Application
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.dagger.components.AppComponent
import me.vidrox.safegistics.dagger.components.DaggerAppComponent
import me.vidrox.safegistics.dagger.modules.AppModule
import me.vidrox.safegistics.dagger.modules.UserModule

class App: Application() {
    companion object {
        lateinit var appComponent: AppComponent
    }

    override fun onCreate() {
        super.onCreate()
        appComponent = initDagger()
    }

    private fun initDagger(): AppComponent =
        DaggerAppComponent.builder()
            .appModule(AppModule(app = this@App))
            .userModule(UserModule())
            .build()
}