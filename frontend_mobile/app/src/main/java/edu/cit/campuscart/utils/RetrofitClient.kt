package edu.cit.campuscart.utils

import edu.cit.campuscart.api.ApiService
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import okhttp3.logging.HttpLoggingInterceptor

object RetrofitClient {
    val instance: ApiService by lazy {

        // Create logging interceptor
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        // Create OkHttpClient with the logging interceptor
        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .build()

        // Create Retrofit instance and pass in the client
        val retrofit = Retrofit.Builder()
            .baseUrl(Constants.BASE_URL + "/") // Assuming Constants.BASE_URL already ends with "/"
            .addConverterFactory(GsonConverterFactory.create())
            .client(client) // Attach OkHttpClient to Retrofit
            .build()

        // Return the ApiService instance
        retrofit.create(ApiService::class.java)
    }
}