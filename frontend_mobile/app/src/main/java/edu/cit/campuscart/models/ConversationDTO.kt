package edu.cit.campuscart.models
import com.google.gson.annotations.SerializedName

data class ConversationDTO(
    val id: Long = 0,
    @SerializedName("participant1")
    val participant1: String,
    @SerializedName("participant2")
    val participant2: String,
    @SerializedName("last_message")
    val lastMessage: MessageDTO? = null,
    @SerializedName("product_code")
    val productCode: Int? = null,
    @SerializedName("product_name")
    val productName: String? = null,
    @SerializedName("product_image_path")
    val productImagePath: String? = null,
    @SerializedName("product_price")
    val productPrice: Double? = null,
    @SerializedName("product_description")
    val productDescription: String? = null
)