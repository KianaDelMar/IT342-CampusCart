package edu.cit.campuscart.api

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.Headers
import retrofit2.http.POST
import edu.cit.campuscart.models.LoginRequest
import edu.cit.campuscart.models.LoginResponse
import edu.cit.campuscart.models.Seller
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Multipart
import retrofit2.http.Part

interface ApiService {
    @Headers("Content-Type: application/json")
    @POST("api/seller/postSellerRecord") // Endpoint
    fun registerSeller(@Body seller: Seller): Call<Void> // No response body expected

    @Headers("Content-Type: application/json")
    @POST("api/seller/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

    // New endpoint for posting a product
    @Multipart
    @POST("api/seller/postproduct")
    fun postProduct(
        @Part("name") name: RequestBody,
        @Part("pdtDescription") description: RequestBody,
        @Part("qtyInStock") quantity: RequestBody,
        @Part("buyPrice") price: RequestBody,
        @Part image: MultipartBody.Part, // Image file
        @Part("category") category: RequestBody,
        @Part("status") status: RequestBody,
        @Part("conditionType") conditionType: RequestBody,
        @Part("seller_username") sellerUsername: RequestBody
    ): Call<Void>
}
