package edu.cit.campuscart.models

import com.google.gson.annotations.SerializedName

data class Seller(
    @SerializedName("username") val username: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    @SerializedName("address") val address: String,
    @SerializedName("email") val email: String,
    @SerializedName("contactNo") val contactNo: String,
    @SerializedName("password") val password: String
)
