package me.vidrox.safegistics.dagger.components

import dagger.Component
import me.vidrox.safegistics.MainActivity
import me.vidrox.safegistics.apollo.repositories.AuthRepository
import me.vidrox.safegistics.dagger.modules.AppModule
import me.vidrox.safegistics.dagger.modules.UserModule
import me.vidrox.safegistics.ui.auth.AuthFragment
import me.vidrox.safegistics.ui.main.MainFragment
import javax.inject.Singleton

@Singleton
@Component(modules = [AppModule::class, UserModule::class])
interface AppComponent {
    // Activities
    fun inject(target: MainActivity)

    // Fragments
    fun inject(target: AuthFragment)
    fun inject(target: MainFragment)

    // Classes
    fun inject(target: AuthRepository)
}