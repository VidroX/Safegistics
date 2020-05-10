package me.vidrox.safegistics.dagger.modules

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import com.apollographql.apollo.ApolloClient
import dagger.Module
import dagger.Provides
import me.vidrox.safegistics.Config
import me.vidrox.safegistics.apollo.ApolloConnector
import me.vidrox.safegistics.apollo.entities.User
import me.vidrox.safegistics.apollo.interceptors.AuthInterceptor
import javax.inject.Singleton

@Module
class AppModule(private val app: Application) {
    @Provides
    @Singleton
    fun provideContext(): Context = app

    @Provides
    @Singleton
    fun provideUserSharedPreferences(): SharedPreferences =
        app.applicationContext.getSharedPreferences(
            Config.USER_SHARED_PREFERENCES,
            Context.MODE_PRIVATE
        )

    @Provides
    @Singleton
    fun provideAuthInterceptor(context: Context, user: User): AuthInterceptor =
        AuthInterceptor(context, user)

    @Provides
    @Singleton
    fun provideApollo(authInterceptor: AuthInterceptor): ApolloClient =
        ApolloConnector(authInterceptor).setupApollo()
}