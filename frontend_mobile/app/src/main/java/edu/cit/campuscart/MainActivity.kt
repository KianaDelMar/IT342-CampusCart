package edu.cit.campuscart

import android.content.Intent
import android.os.Bundle
import android.widget.*
import edu.cit.campuscart.models.LoginRequest
import edu.cit.campuscart.models.LoginResponse
import edu.cit.campuscart.pages.HomePage
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : BaseActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val usernameInput = findViewById<EditText>(R.id.username)
        val passwordInput = findViewById<EditText>(R.id.password)
        val loginButton = findViewById<Button>(R.id.loginButton)
        val registerText = findViewById<TextView>(R.id.registerText)

        loginButton.setOnClickListener {
            val username = usernameInput.text.toString().trim()
            val password = passwordInput.text.toString().trim()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter both username and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            attemptLogin(username, password)
        }

        registerText.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
    }

    private fun attemptLogin(username: String, password: String) {
        val apiService = RetrofitClient.instance
        val loginRequest = LoginRequest(username, password)

        showLoadingOverlay()
        Toast.makeText(this, "Logging you in...", Toast.LENGTH_SHORT).show()

        apiService.login(loginRequest).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                hideLoadingOverlay()

                if (response.isSuccessful) {
                    val body = response.body()
                    if (body?.message == "Login Successful") {
                        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
                        sharedPref.edit()
                            .putString("loggedInUsername", username)
                            .putString("authToken", body.token)
                            .apply()

                        Toast.makeText(this@MainActivity, "Login successful!", Toast.LENGTH_SHORT).show()
                        val intent = Intent(this@MainActivity, HomePage::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@MainActivity, "Invalid credentials", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Toast.makeText(this@MainActivity, "Invalid Credentials. Try Again.", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                hideLoadingOverlay()
                Toast.makeText(this@MainActivity, "Network error", Toast.LENGTH_SHORT).show()
            }
        })
    }
}
