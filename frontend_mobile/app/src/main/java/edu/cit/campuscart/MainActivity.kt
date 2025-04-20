// MainActivity.kt
package edu.cit.campuscart

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.*
import androidx.activity.result.IntentSenderRequest
import com.google.android.gms.auth.api.identity.BeginSignInRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.auth.api.identity.SignInClient
import com.google.android.gms.common.api.ApiException
import androidx.activity.result.contract.ActivityResultContracts
import edu.cit.campuscart.models.*
import edu.cit.campuscart.pages.HomePage
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : BaseActivity() {

    private lateinit var oneTapClient: SignInClient
    private lateinit var signInRequest: BeginSignInRequest

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val usernameInput = findViewById<EditText>(R.id.username)
        val passwordInput = findViewById<EditText>(R.id.password)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val registerButton = findViewById<TextView>(R.id.registerText)
        val googleLoginButton = findViewById<LinearLayout>(R.id.googleLoginButton)

        loginButton.setOnClickListener {
            val username = usernameInput.text.toString()
            val password = passwordInput.text.toString()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter both username and password", Toast.LENGTH_SHORT)
                    .show()
                return@setOnClickListener
            }

            attemptLogin(username, password)
        }

        registerButton.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        // GOOGLE SIGN-IN INIT
        val clientId = BuildConfig.GOOGLE_CLIENT_ID
        if (clientId.isBlank()) {
            Toast.makeText(this, "Missing Google Client ID", Toast.LENGTH_LONG).show()
            Log.e("GoogleLogin", "GOOGLE_CLIENT_ID is missing!")
            return
        }

        oneTapClient = Identity.getSignInClient(this)
        signInRequest = BeginSignInRequest.builder()
            .setGoogleIdTokenRequestOptions(
                BeginSignInRequest.GoogleIdTokenRequestOptions.builder()
                    .setSupported(true)
                    .setServerClientId(clientId)
                    .setFilterByAuthorizedAccounts(false)
                    .build()
            )
            .build()

        googleLoginButton.setOnClickListener {
            oneTapClient.beginSignIn(signInRequest)
                .addOnSuccessListener(this) { result ->
                    googleSignInLauncher.launch(
                        IntentSenderRequest.Builder(result.pendingIntent.intentSender).build()
                    )
                }
                .addOnFailureListener(this) { e ->
                    Log.e("GoogleLogin", "Google Sign-In failed to start", e)
                    Toast.makeText(this, "Google Sign-In failed", Toast.LENGTH_SHORT).show()
                }
        }
    }

    private val googleSignInLauncher = registerForActivityResult(ActivityResultContracts.StartIntentSenderForResult()) { result ->
        if (result.resultCode == RESULT_OK) {
            try {
                val credential = oneTapClient.getSignInCredentialFromIntent(result.data)
                val idToken = credential.googleIdToken
                val name = credential.displayName
                val email = credential.id
                val pictureUrl = credential.profilePictureUri?.toString()

                if (idToken != null) {
                    sendGoogleTokenToBackend(idToken, email, name, pictureUrl)
                } else {
                    Toast.makeText(this, "Google Sign-In failed: ID token is null", Toast.LENGTH_SHORT).show()
                }
            } catch (e: ApiException) {
                Log.e("GoogleLogin", "Google Sign-In failed", e)
                Toast.makeText(this, "Google Sign-In failed", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun sendGoogleTokenToBackend(idToken: String, email: String, name: String?, pictureUrl: String?) {
        val apiService = RetrofitClient.instance
        val googleUserData = GoogleLoginRequest(
            googleIdToken = idToken,
            email = email,
            name = name,
            profilePhoto = pictureUrl
        )

        apiService.googleLogin(googleUserData).enqueue(object : Callback<GoogleLoginResponse> {
            override fun onResponse(call: Call<GoogleLoginResponse>, response: Response<GoogleLoginResponse>) {
                if (response.isSuccessful && response.body()?.token != null) {
                    val token = response.body()!!.token
                    val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
                    sharedPref.edit()
                        .putString("loggedInUsername", response.body()?.username)
                        .putString("authToken", token)
                        .apply()

                    Toast.makeText(this@MainActivity, "Google Login Successful", Toast.LENGTH_SHORT).show()
                    startActivity(Intent(this@MainActivity, HomePage::class.java))
                    finish()
                } else {
                    Toast.makeText(this@MainActivity, "Google login failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<GoogleLoginResponse>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Google login network error", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun attemptLogin(username: String, password: String) {
        val apiService = RetrofitClient.instance
        val loginRequest = LoginRequest(username, password)

        apiService.login(loginRequest).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                if (response.isSuccessful) {
                    val responseBody = response.body()
                    if (responseBody?.message == "Login Successful") {
                        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
                        sharedPref.edit()
                            .putString("loggedInUsername", username)
                            .putString("authToken", responseBody.token)
                            .apply()
                        Toast.makeText(this@MainActivity, "Login Successful!", Toast.LENGTH_SHORT).show()
                        startActivity(Intent(this@MainActivity, HomePage::class.java))
                        finish()
                    } else {
                        Toast.makeText(this@MainActivity, "Invalid credentials", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@MainActivity, "Login failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Toast.makeText(this@MainActivity, "Network error", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
