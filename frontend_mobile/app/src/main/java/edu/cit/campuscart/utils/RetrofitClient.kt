package edu.cit.campuscart.utils

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import edu.cit.campuscart.api.ApiService

object RetrofitClient {
    private const val BASE_URL = "http://10.0.2.2:8080/" // Use 10.0.2.2 for local Spring Boot

    val instance: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

}
