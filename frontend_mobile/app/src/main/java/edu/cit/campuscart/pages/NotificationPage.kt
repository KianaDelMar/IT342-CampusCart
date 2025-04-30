package edu.cit.campuscart.pages

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.widget.ImageButton
import android.widget.Toast
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.NotificationAdapter
import edu.cit.campuscart.api.APIService
import edu.cit.campuscart.models.Notification
import edu.cit.campuscart.utils.Constants
import retrofit2.*
import retrofit2.converter.gson.GsonConverterFactory

class NotificationPage : BaseActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: NotificationAdapter
    private lateinit var apiService: APIService
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout
    private var notificationStack: MutableList<Notification> = mutableListOf()

    private lateinit var username: String
    private lateinit var authToken: String
    private val handler = Handler(Looper.getMainLooper())
    private val refreshInterval: Long = 10000 // 10 seconds

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_notificationpage)

        recyclerView = findViewById(R.id.notificationRecyclerView)
        recyclerView.layoutManager = LinearLayoutManager(this)

        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        swipeRefreshLayout.setOnRefreshListener {
            fetchNotifications(username, authToken)
        }

        setupNavigationButtons()
        initializeRetrofit()

        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        username = sharedPref.getString("loggedInUsername", null) ?: ""
        authToken = sharedPref.getString("authToken", null) ?: ""

        if (username.isNotEmpty() && authToken.isNotEmpty()) {
            loadNotificationsFromPrefs()
            adapter = NotificationAdapter(notificationStack)
            recyclerView.adapter = adapter
            fetchNotifications(username, authToken)
            startAutoRefresh()
        } else {
            Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        stopAutoRefresh()
    }

    private fun initializeRetrofit() {
        val retrofit = Retrofit.Builder()
            .baseUrl(Constants.BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()

        apiService = retrofit.create(APIService::class.java)
    }

    private fun setupNavigationButtons() {
        findViewById<ImageButton>(R.id.btnNotifs).setOnClickListener {
            // Already in NotificationPage
        }
        findViewById<ImageButton>(R.id.btnHome).setOnClickListener {
            startActivity(Intent(this, HomePage::class.java))
        }
        findViewById<ImageButton>(R.id.btnLikes).setOnClickListener {
            startActivity(Intent(this, LikePage::class.java))
        }
        findViewById<ImageButton>(R.id.btnBrowse).setOnClickListener {
            startActivity(Intent(this, BrowsePage::class.java))
        }
        findViewById<ImageButton>(R.id.btnProfile).setOnClickListener {
            startActivity(Intent(this, ProfilePage::class.java))
        }
    }

    private fun fetchNotifications(username: String, token: String) {
        showLoadingOverlay()
        apiService.getUserNotifications("Bearer $token", username).enqueue(object : Callback<List<Notification>> {
            override fun onResponse(call: Call<List<Notification>>, response: Response<List<Notification>>) {
                swipeRefreshLayout.isRefreshing = false
                hideLoadingOverlay()
                if (response.isSuccessful) {
                    val newNotifications = response.body() ?: emptyList()
                    val existingIds = newNotifications.map { it.id }

                    // Remove notifications for products that have gone back to pending
                    val iterator = notificationStack.iterator()
                    var removedPending = false
                    while (iterator.hasNext()) {
                        val notif = iterator.next()
                        if (!existingIds.contains(notif.id)) {
                            iterator.remove()
                            removedPending = true
                        }
                    }

                    // Add new notifications that don't already exist
                    var addedNew = false
                    for (notification in newNotifications.reversed()) {
                        if (notificationStack.none { it.id == notification.id }) {
                            notificationStack.add(0, notification)
                            addedNew = true
                        }
                    }

                    if (addedNew || removedPending) {
                        adapter.notifyDataSetChanged()
                        saveNotificationsToPrefs()
                    }
                } else {
                    Toast.makeText(this@NotificationPage, "Error: ${response.message()}", Toast.LENGTH_SHORT).show()
                }
            }

            override fun onFailure(call: Call<List<Notification>>, t: Throwable) {
                swipeRefreshLayout.isRefreshing = false
                hideLoadingOverlay()
                Toast.makeText(this@NotificationPage, "Failed: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun saveNotificationsToPrefs() {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val editor = sharedPref.edit()
        val gson = Gson()
        val json = gson.toJson(notificationStack)
        editor.putString("notificationList", json)
        editor.apply()
    }

    private fun loadNotificationsFromPrefs() {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val json = sharedPref.getString("notificationList", null)
        if (json != null) {
            val type = object : TypeToken<MutableList<Notification>>() {}.type
            notificationStack = Gson().fromJson(json, type)
        }
    }

    private fun startAutoRefresh() {
        handler.postDelayed(object : Runnable {
            override fun run() {
                fetchNotifications(username, authToken)
                handler.postDelayed(this, refreshInterval)
            }
        }, refreshInterval)
    }

    private fun stopAutoRefresh() {
        handler.removeCallbacksAndMessages(null)
    }
}
