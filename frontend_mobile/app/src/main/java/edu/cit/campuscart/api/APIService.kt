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
import retrofit2.http.Header
import retrofit2.http.Headers
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path


interface ApiService {
    @Headers("Content-Type: application/json")
    @POST("api/user/postUserRecord")
    fun registerSeller(@Body seller: Seller): Call<Void>

    @Headers("Content-Type: application/json")
    @POST("api/user/login")
    fun login(@Body request: LoginRequest): Call<LoginResponse>

   // @Headers("Content-Type: application/json")
   @Multipart
   @POST("/api/product/postproduct")
   fun postProduct(
       @Header("Authorization") token: String,
       @Part("name") name: RequestBody,
       @Part("pdtDescription") description: RequestBody,
       @Part("qtyInStock") quantity: RequestBody,
       @Part("buyPrice") price: RequestBody,
       @Part("category") category: RequestBody,
       @Part("status") status: RequestBody,
       @Part("conditionType") condition: RequestBody,
       @Part("user_username") username: RequestBody,
       @Part image: MultipartBody.Part // No name needed here
   ): Call<ResponseBody>

    @Headers("Content-Type: application/json")
    @GET("api/product/getAllProducts/{username}")
    fun getAllProducts(
        @Path("username") username: String
    ): Call<List<Products>> // Remove the nullable return type

    // Get product image
    @Headers("Content-Type: application/json")
    @GET("/{imagePath}")
    fun getProductImage(@Path("imagePath") imagePath: String?): Call<ResponseBody?>?

    @Headers("Content-Type: application/json")
    @GET("/uploads/{sellerPhoto}")
    fun getSellerPhoto(@Path("sellerPhoto") sellerPhoto: String?): Call<ResponseBody?>?

    @Headers("Content-Type: application/json")
    @GET("/approved")
    fun getApprovedProducts(): Call<List<Products>>
}
