package edu.cit.campuscart.utils

import edu.cit.campuscart.api.ApiService
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    val instance: ApiService by lazy {
        val retrofit = Retrofit.Builder()
            .baseUrl(Constants.BASE_URL + "/") // Add trailing slash
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        retrofit.create(ApiService::class.java)
    }
}
