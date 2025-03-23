package edu.cit.campuscart.api

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST
import edu.cit.campuscart.models.LoginRequest
import edu.cit.campuscart.models.LoginResponse
import edu.cit.campuscart.models.Seller

interface ApiService {
    @Headers("Content-Type: application/json")
    @POST("api/seller/postSellerRecord") // Endpoint
    fun registerSeller(@Body seller: Seller): Call<Void> // No response body expected

    @Headers("Content-Type: application/json")
    @POST("api/seller/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

}
