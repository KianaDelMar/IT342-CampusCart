package edu.cit.campuscart.models

import com.google.gson.annotations.SerializedName

data class LoginResponse(
    @SerializedName("token") val token: String?,
    @SerializedName("message") val message: String,
    @SerializedName("status") val status: String?,  // Example: Add extra fields for debugging
    @SerializedName("error") val error: String?  // Check if API sends an error field
)
