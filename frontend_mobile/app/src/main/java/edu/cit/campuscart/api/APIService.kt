package edu.cit.campuscart.api

import edu.cit.campuscart.models.LoginRequest
import edu.cit.campuscart.models.LoginResponse
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.models.Seller
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path


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

    @Headers("Content-Type: application/json")
    @GET("api/product/getAllProducts/{username}")
    fun getAllProducts(
        @Path("username") username: String
    ): Call<List<Products>> // Remove the nullable return type

    // Get product image
    @Headers("Content-Type: application/json")
    @GET("/{imagePath}")
    fun getProductImage(@Path("imagePath") imagePath: String?): Call<ResponseBody?>?

    // Get seller's profile photo
    @Headers("Content-Type: application/json")
    @GET("/uploads/{sellerPhoto}")
    fun getSellerPhoto(@Path("sellerPhoto") sellerPhoto: String?): Call<ResponseBody?>?

    @Headers("Content-Type: application/json")
    @GET("/approved")
    fun getApprovedProducts(): Call<List<Products>>
}
