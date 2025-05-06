package edu.cit.campuscart

import android.content.Intent
import android.os.Bundle
import android.widget.*
import com.sendbird.android.SendbirdChat
import com.sendbird.android.handler.InitResultHandler
import com.sendbird.android.exception.SendbirdException
import com.sendbird.android.user.User
import com.sendbird.android.params.InitParams
import com.sendbird.android.params.GroupChannelCreateParams
import com.sendbird.android.channel.GroupChannel
import edu.cit.campuscart.models.LoginRequest
import edu.cit.campuscart.models.LoginResponse
import edu.cit.campuscart.pages.HomePage
import edu.cit.campuscart.pages.MessagePage
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class MainActivity : BaseActivity() {

    private val SENDBIRD_APP_ID = "161770D1-ABAA-4CB5-8D2A-31B39251E992"

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
                        initSendBird(username)
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

    private fun initSendBird(username: String) {
        val params = InitParams(SENDBIRD_APP_ID, applicationContext, true)

        SendbirdChat.init(params, object : InitResultHandler {
            override fun onMigrationStarted() {
                Toast.makeText(this@MainActivity, "SendBird migration started", Toast.LENGTH_SHORT).show()
            }

            override fun onInitFailed(e: SendbirdException) {
                Toast.makeText(this@MainActivity, "SendBird Init failed: ${e.message}", Toast.LENGTH_LONG).show()
            }

            override fun onInitSucceed() {
                authenticateWithSendBird(username)
            }
        })
    }

    private fun authenticateWithSendBird(username: String) {
        SendbirdChat.connect(username) { user: User?, e: SendbirdException? ->
            if (e != null) {
                e.printStackTrace()
                Toast.makeText(this@MainActivity, "SendBird Connect Error: ${e.message}", Toast.LENGTH_LONG).show()
                return@connect
            }

            Toast.makeText(this@MainActivity, "SendBird Connected!", Toast.LENGTH_SHORT).show()

            // ✅ Redirect to HomePage
            val intent = Intent(this@MainActivity, HomePage::class.java)
            startActivity(intent)
            finish()

            // Optional: Automatically join/create a chat channel
             //createOrJoinChannel(listOf(username, "admin"))
        }
    }

    private fun createOrJoinChannel(userIds: List<String>) {
        val params = GroupChannelCreateParams().apply {
            this.userIds = userIds
            this.name = "Campus Chat"
            this.isDistinct = true
        }

        GroupChannel.createChannel(params) { channel, e ->
            if (e != null) {
                e.printStackTrace()
                Toast.makeText(this@MainActivity, "Failed to create/join channel", Toast.LENGTH_SHORT).show()
                return@createChannel
            }

            Toast.makeText(this@MainActivity, "Chat channel ready", Toast.LENGTH_SHORT).show()
        }
    }
}
