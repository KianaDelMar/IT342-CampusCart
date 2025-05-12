package edu.cit.campuscart.utils

object Constants {
   // const val BASE_URL = "http://192.168.1.59:8080"//192.168.1.54
    const val USE_LOCAL_SERVER = false
    val BASE_URL: String
        get() = if (USE_LOCAL_SERVER) {
            "http://192.168.1.59:8080/"
        } else {
            "https://campuscart-online-marketplace-system-production.up.railway.app/"
        }
}