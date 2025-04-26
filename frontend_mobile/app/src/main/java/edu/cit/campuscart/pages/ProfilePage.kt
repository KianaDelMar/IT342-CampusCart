package edu.cit.campuscart.pages
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.widget.PopupMenu
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.bumptech.glide.Glide
import com.google.android.material.imageview.ShapeableImageView
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.MainActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.fragments.SellerProductDetail
import edu.cit.campuscart.models.Notification
import edu.cit.campuscart.models.Seller
import edu.cit.campuscart.utils.Constants
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ProfilePage : BaseActivity() {

    private lateinit var recyclerViewProfileProducts: RecyclerView
    private lateinit var reviewTextView: TextView
    private lateinit var tabListings: TextView
    private lateinit var tabReviews: TextView

    private fun updateNotificationBadgeFromPrefs(badgeTextView: TextView) {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val json = sharedPref.getString("notificationList", null)
        val type = object : TypeToken<MutableList<Notification>>() {}.type
        val notifications: MutableList<Notification> = Gson().fromJson(json, type) ?: mutableListOf()

        // View bindings
        tabListings = findViewById(R.id.tabListings)
        tabReviews = findViewById(R.id.tabReviews)
        recyclerViewProfileProducts = findViewById(R.id.recyclerUserProducts)
        reviewTextView = findViewById(R.id.reviewTextView)

        if (notifications.isNotEmpty()) {
            badgeTextView.text = notifications.size.toString()
            badgeTextView.visibility = View.VISIBLE
        } else {
            badgeTextView.visibility = View.GONE
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_profilepage)
        val kebabButton = findViewById<ImageButton>(R.id.kebabMenu)

        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val userTxt = sharedPref.getString("loggedInUsername", "") ?: ""
        val token = "Bearer ${sharedPref.getString("authToken", "")}"

        val txtUsername = findViewById<TextView>(R.id.usernameText)
        val phone = findViewById<TextView>(R.id.phoneNumber)
        val txtAddress = findViewById<TextView>(R.id.addressText)
        val profilepic = findViewById<ShapeableImageView>(R.id.profilepic)

        if (userTxt.isNotEmpty()) {
            val apiService = RetrofitClient.instance
            apiService.getUserByUsername(token, userTxt)
                .enqueue(object : Callback<Seller> {
                    override fun onResponse(call: Call<Seller>, response: Response<Seller>) {
                        if (response.isSuccessful && response.body() != null) {
                            val user = response.body()!!

                            // Set user details
                            txtUsername.text = user.username
                            phone.text = user.contactNo
                            txtAddress.text = user.address

                            // Load profile picture using Glide (or Picasso)
                            if (user.profilePhoto.isNotEmpty()) {
                                Glide.with(this@ProfilePage)
                                    .load("${Constants.BASE_URL}uploads/${user.profilePhoto}")
                                    .placeholder(R.drawable.defaultphoto)
                                    .error(R.drawable.defaultphoto)
                                    .into(profilepic)
                            } else {
                                profilepic.setImageResource(R.drawable.defaultphoto) // Set default image
                            }

                            Log.d("ProfilePage", "Setting texts: ${user.username}, ${user.contactNo}, ${user.address}")

                        } else {
                            Toast.makeText(this@ProfilePage, "Failed to load user data", Toast.LENGTH_SHORT).show()
                        }
                    }

                    override fun onFailure(call: Call<Seller>, t: Throwable) {
                        Toast.makeText(this@ProfilePage, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
                    }
                })
        }

        val badgeTextView: TextView = findViewById(R.id.notificationBadge)
        updateNotificationBadgeFromPrefs(badgeTextView)

        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        profileButton.setOnClickListener {
            if (this::class.java != ProfilePage::class.java) {
                startActivity(Intent(this@ProfilePage, ProfilePage::class.java))
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
// Tab switching
        tabListings.setOnClickListener {
            // Text appearance
            tabListings.setTextColor(resources.getColor(android.R.color.black, theme))
            tabListings.textSize = 17F
            tabListings.setTypeface(null, android.graphics.Typeface.BOLD)

            tabReviews.setTextColor(resources.getColor(android.R.color.black, theme))
            tabReviews.textSize = 15F
            tabReviews.setTypeface(null, android.graphics.Typeface.NORMAL)

            // Content visibility
            recyclerViewProfileProducts.visibility = View.VISIBLE
            reviewTextView.visibility = View.GONE
        }

        tabReviews.setOnClickListener {
            // Text appearance
            tabListings.setTextColor(resources.getColor(android.R.color.black, theme))
            tabListings.textSize = 15F
            tabListings.setTypeface(null, android.graphics.Typeface.NORMAL)

            tabReviews.setTextColor(resources.getColor(android.R.color.black, theme))
            tabReviews.textSize = 17F
            tabReviews.setTypeface(null, android.graphics.Typeface.BOLD)

            // Content visibility
            recyclerViewProfileProducts.visibility = View.GONE
            reviewTextView.visibility = View.VISIBLE
        }

        kebabButton.setOnClickListener {
            val popupMenu = PopupMenu(this, kebabButton)
            popupMenu.menuInflater.inflate(R.menu.menu_profile, popupMenu.menu)

            popupMenu.setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.action_settings -> {
                        // Handle settings navigation
                        val intent = Intent(this, AccountSettings::class.java)
                        startActivity(intent)
                        true
                    }
                    R.id.action_logout -> {
                        // Clear login info and go back to login page
                        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
                        sharedPref.edit().clear().apply()

                        val intent = Intent(this, MainActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        true
                    }
                    else -> false
                }
            }

            popupMenu.show()
        }

        val swipeRefreshLayout = findViewById<SwipeRefreshLayout>(R.id.swipeRefreshLayout)

        swipeRefreshLayout.setOnRefreshListener {
            // Call the function to refresh your content, e.g. fetch new data or update the UI
            loadUserProducts(username)

            // Once the data is refreshed, stop the refresh animation
            swipeRefreshLayout.isRefreshing = false
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