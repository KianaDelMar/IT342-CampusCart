package edu.cit.campuscart
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import edu.cit.campuscart.models.LoginResponse
import edu.cit.campuscart.models.LoginRequest
import edu.cit.campuscart.api.ApiService
import edu.cit.campuscart.utils.RetrofitClient

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val usernameInput = findViewById<EditText>(R.id.username)
        val passwordInput = findViewById<EditText>(R.id.password)
        val loginButton = findViewById<Button>(R.id.loginButton)

        loginButton.setOnClickListener {
            val username = usernameInput.text.toString()
            val password = passwordInput.text.toString()

            if (username.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Please enter both username and password", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            attemptLogin(username, password)
        }
    }

    private fun attemptLogin(username: String, password: String) {
        Log.d("LoginDebug", "Attempting login with username: $username")

        val apiService = RetrofitClient.instance  // ✅ FIXED: No need for .create(ApiService::class.java)
        val loginRequest = LoginRequest(username, password)

        apiService.login(loginRequest).enqueue(object : Callback<LoginResponse> {
            override fun onResponse(call: Call<LoginResponse>, response: Response<LoginResponse>) {
                Log.d("LoginDebug", "Raw Response: ${response.raw()}")
                Log.d("LoginDebug", "Response Code: ${response.code()}")

                if (response.isSuccessful) {
                    val responseBody = response.body()
                    Log.d("LoginDebug", "Parsed Response: $responseBody")

                    if (responseBody?.message == "Login Successful") {
                        Toast.makeText(this@MainActivity, "Login Successful", Toast.LENGTH_SHORT).show()

                        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
                        sharedPref.edit().putString("loggedInUsername", username).apply()

                        val intent = Intent(this@MainActivity, HomePage::class.java)
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@MainActivity, "Invalid credentials", Toast.LENGTH_SHORT).show()
                    }
                } else {
                    Log.e("LoginDebug", "Error: ${response.errorBody()?.string()}")
                    Toast.makeText(this@MainActivity, "Login failed", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<LoginResponse>, t: Throwable) {
                Log.e("LoginDebug", "Login request failed: ${t.message}")
                Toast.makeText(this@MainActivity, "Network error", Toast.LENGTH_SHORT).show()
            }
        })
    }
}