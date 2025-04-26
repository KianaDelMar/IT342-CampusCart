package edu.cit.campuscart.models

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)
