package edu.cit.campuscart.models

import com.google.gson.annotations.SerializedName

data class MessageDTO(
    val id: Long = 0,
    val sender: String,
    val receiver: String,
    val content: String,
    @SerializedName("created_at")
    val timestamp: String,
    @SerializedName("is_read")
    val isRead: Boolean = false,
    @SerializedName("product_code")
    val productCode: Int? = null
)