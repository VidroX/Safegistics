package me.vidrox.safegistics

object Config {
    // -- API
    const val API_BASE_URL = "http://192.168.1.62:5000/graphql/"
    const val API_ROW_COUNT = 10
    // - User Session
    const val USER_SHARED_PREFERENCES = BuildConfig.APPLICATION_ID + ".User"
}