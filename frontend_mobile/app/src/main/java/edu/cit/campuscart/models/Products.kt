package edu.cit.campuscart.models

import com.google.gson.annotations.SerializedName
import java.io.Serializable

data class Products(
    @SerializedName("code") val code: Int,
    @SerializedName("name") val name: String,
    @SerializedName("pdtDescription") val pdtDescription: String,
    @SerializedName("qtyInStock") val qtyInStock: Int,
    @SerializedName("buyPrice") val buyPrice: Double,
    @SerializedName("imagePath") val imagePath: String,
    @SerializedName("category") val category: String,
    @SerializedName("status") val status: String,
    @SerializedName("conditionType") val conditionType: String,
    @SerializedName("userUsername") val userUsername: String?,
    @SerializedName("userProfileImagePath") val userProfileImagePath: String?
): Serializable
