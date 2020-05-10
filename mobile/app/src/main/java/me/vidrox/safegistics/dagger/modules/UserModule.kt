package me.vidrox.safegistics.dagger.modules

import android.content.Context
import dagger.Module
import dagger.Provides
import me.vidrox.safegistics.apollo.entities.User
import javax.inject.Singleton

@Module
class UserModule {
    @Provides
    @Singleton
    fun provideUser(context: Context): User = User.get(context)
}