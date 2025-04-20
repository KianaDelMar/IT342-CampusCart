package edu.cit.campuscart.models

data class GoogleLoginRequest(
    val googleIdToken: String?,
    val email: String,
    val name: String?,
    val profilePhoto: String?
)
