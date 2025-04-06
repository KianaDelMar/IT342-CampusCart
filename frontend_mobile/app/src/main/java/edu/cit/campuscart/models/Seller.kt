package edu.cit.campuscart.models

import com.google.gson.annotations.SerializedName

data class Seller(
    @SerializedName("username") val username: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    @SerializedName("contactNo") val contactNo: String,
    @SerializedName("email") val email: String,
    @SerializedName("address") val address: String,
    @SerializedName("password") val password: String,
    @SerializedName("profilePhoto") val profilePhoto: String,  // Added profile photo field
    @SerializedName("products") val products: List<Products>? = null  // List of products associated with the seller (optional)
)
