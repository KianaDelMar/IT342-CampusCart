package edu.cit.campuscart.models

data class Notification(
    val id: Long,
    val message: String,
    val type: String,
    val isRead: Boolean,
    val timestamp: String
)
