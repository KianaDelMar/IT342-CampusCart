package edu.cit.campuscart.utils

import com.google.gson.GsonBuilder
import edu.cit.campuscart.api.APIService
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import okhttp3.logging.HttpLoggingInterceptor

object RetrofitClient {
    val instance: APIService by lazy {

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .build()

        // Make Gson lenient
        val gson = GsonBuilder()
            .setLenient()
            .create()

        val retrofit = Retrofit.Builder()
            .baseUrl(Constants.BASE_URL + "/")
            .addConverterFactory(GsonConverterFactory.create(gson)) // use custom Gson
            .client(client)
            .build()

        retrofit.create(APIService::class.java)
    }
}