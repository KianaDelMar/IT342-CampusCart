package edu.cit.campuscart.models

data class GoogleLoginResponse(
    val token: String,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String
)