package edu.cit.campuscart.pages
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.fragments.SellerProductDetail
import edu.cit.campuscart.models.Notification
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfilePage : BaseActivity() {

    private lateinit var recyclerViewProfileProducts: RecyclerView

    private fun updateNotificationBadgeFromPrefs(badgeTextView: TextView) {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val json = sharedPref.getString("notificationList", null)
        val type = object : TypeToken<MutableList<Notification>>() {}.type
        val notifications: MutableList<Notification> = Gson().fromJson(json, type) ?: mutableListOf()

        if (notifications.isNotEmpty()) {
            badgeTextView.text = notifications.size.toString()
            badgeTextView.visibility = View.VISIBLE
        } else {
            badgeTextView.visibility = View.GONE
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profilepage) // Make sure this layout has a RecyclerView with the ID

        val badgeTextView: TextView = findViewById(R.id.notificationBadge)
        updateNotificationBadgeFromPrefs(badgeTextView)

        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        profileButton.setOnClickListener {
            if (this::class.java != ProfilePage::class.java) {
                startActivity(Intent(this@ProfilePage, HomePage::class.java))
                finish()
            }
        }

        val browseButton = findViewById<ImageButton>(R.id.btnBrowse)
        browseButton.setOnClickListener {
            startActivity(Intent(this@ProfilePage, BrowsePage::class.java))
        }

        val notifButton = findViewById<ImageButton>(R.id.btnNotifs)
        notifButton.setOnClickListener {
            startActivity(Intent(this@ProfilePage, NotificationPage::class.java))
        }

        val homeButton = findViewById<ImageButton>(R.id.btnHome)
        homeButton.setOnClickListener {
            startActivity(Intent(this@ProfilePage, HomePage::class.java))
        }
        /*
        val messageButton = findViewById<ImageButton>(R.id.btnMessage)
        messageButton.setOnClickListener {
            startActivity(Intent(this@ProfilePage, MessagePage::class.java))
        }*/

        val likeButton = findViewById<ImageButton>(R.id.btnLikes)
        likeButton.setOnClickListener {
            startActivity(Intent(this@ProfilePage, LikePage::class.java))
        }

        recyclerViewProfileProducts = findViewById(R.id.recyclerUserProducts)
        recyclerViewProfileProducts.layoutManager = GridLayoutManager(this, 2)

        val username = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
            .getString("loggedInUsername", "") ?: ""

        if (username.isNotEmpty()) {
            loadUserProducts(username)
        } else {
            Toast.makeText(this, "No username found", Toast.LENGTH_SHORT).show()
        }
    }

    private fun loadUserProducts(username: String) {
        val apiService = RetrofitClient.instance
        val token = "Bearer ${
            getSharedPreferences("CampusCartPrefs", MODE_PRIVATE).getString(
                "auth_token",
                ""
            )
        }"

        val call = apiService.getProductsByUser(token, username)
        call.enqueue(object : Callback<List<Products>> {
            override fun onResponse(
                call: Call<List<Products>>,
                response: Response<List<Products>>
            ) {
                if (response.isSuccessful && response.body() != null) {
                    val userProducts = response.body()!! // No filtering

                    val adapter = ProductAdapters(userProducts.toMutableList()) { selectedProduct ->
                        Log.d("ProfilePage", "Selected Product Category: ${selectedProduct.category}")
                        val dialog = SellerProductDetail.newInstance(selectedProduct)
                        dialog.show(supportFragmentManager, "SellerProductDetail")
                    }

                    recyclerViewProfileProducts.adapter = adapter
                } else {
                    Toast.makeText(
                        this@ProfilePage,
                        "Failed to load your products",
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                Toast.makeText(this@ProfilePage, "Network error: ${t.message}", Toast.LENGTH_SHORT)
                    .show()
            }
        })
    }
}