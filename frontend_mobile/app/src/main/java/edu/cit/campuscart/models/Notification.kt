package edu.cit.campuscart.models

import androidx.annotation.Keep
import com.google.gson.annotations.Expose
@Keep
data class Notification(
    @Expose val id: Long,
    @Expose val message: String,
    @Expose val type: String,
    @Expose val isRead: Boolean,
    @Expose val timestamp: String
)
