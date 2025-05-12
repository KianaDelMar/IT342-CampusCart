package edu.cit.campuscart.pages
import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.fragments.ProductDetailDialogFragment
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.models.Notification
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.PreferenceUtils
import edu.cit.campuscart.utils.RetrofitClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
class LikePage : BaseActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ProductAdapters

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

    private fun updateMessageBadgeFromApi(badgeTextView: TextView) {
        val sharedPreferences = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", "") ?: ""
        val username = sharedPreferences.getString("loggedInUsername", "") ?: ""

        if (token.isEmpty() || username.isEmpty()) {
            badgeTextView.visibility = View.GONE
            return
        }

        val bearerToken = "Bearer $token"

        // Use lifecycleScope to launch a coroutine
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.instance.getUnreadMessageCount(bearerToken, username)

                withContext(Dispatchers.Main) {
                    val count = response.body() ?: 0
                    if (response.isSuccessful && count > 0) {
                        badgeTextView.text = count.toString()
                        badgeTextView.visibility = View.VISIBLE
                    } else {
                        badgeTextView.visibility = View.GONE
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    badgeTextView.visibility = View.GONE
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_likepage)

        val badgeTextView: TextView = findViewById(R.id.notificationBadge)
        updateNotificationBadgeFromPrefs(badgeTextView)

        val messageBadgeTextView: TextView = findViewById(R.id.messageBadge)
        updateMessageBadgeFromApi(messageBadgeTextView)

        val likeButton = findViewById<ImageButton>(R.id.btnLikes)
        likeButton.setOnClickListener {
            if (this::class.java != LikePage::class.java) {
                startActivity(Intent(this@LikePage, LikePage::class.java))
                finish()
            }
        }

        val browseButton = findViewById<ImageButton>(R.id.btnBrowse)
        browseButton.setOnClickListener {
            startActivity(Intent(this@LikePage, BrowsePage::class.java))
        }

        val notifButton = findViewById<ImageButton>(R.id.btnNotifs)
        notifButton.setOnClickListener {
            startActivity(Intent(this@LikePage, NotificationPage::class.java))
        }

        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        profileButton.setOnClickListener {
            startActivity(Intent(this@LikePage, ProfilePage::class.java))
        }

        val homeButton = findViewById<ImageButton>(R.id.btnHome)
        homeButton.setOnClickListener {
            startActivity(Intent(this@LikePage, HomePage::class.java))
        }

        val messageButton = findViewById<ImageButton>(R.id.btnMessage)
        messageButton.setOnClickListener {
            startActivity(Intent(this@LikePage, MessagePage::class.java))
        }

        val recyclerView = findViewById<RecyclerView>(R.id.recyclerViewLikes)
        val adapter = ProductAdapters(mutableListOf(), ::onProductClicked)
        recyclerView.layoutManager = GridLayoutManager(this, 2)
        recyclerView.adapter = adapter

        val likedNames = PreferenceUtils.getLikedProducts(this)

        showLoadingOverlay()

        RetrofitClient.instance.getAllProducts(getLoggedInUsername()).enqueue(object :
            Callback<List<Products>> {
            override fun onResponse(
                call: Call<List<Products>>,
                response: Response<List<Products>>
            ) {
                hideLoadingOverlay()
                if (response.isSuccessful) {
                    val likedProducts =
                        response.body()?.filter { likedNames.contains(it.name) } ?: emptyList()
                    adapter.updateData(likedProducts)
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                hideLoadingOverlay()
                Toast.makeText(this@LikePage, "Failed to load liked items", Toast.LENGTH_SHORT)
                    .show()
            }
        })
    }
    private fun onProductClicked(product: Products) {
        // Handle click event, e.g., show detail dialog
        val dialog = ProductDetailDialogFragment.newInstance(product)
        dialog.show(supportFragmentManager, "ProductDetailDialog")
    }
    private fun getLoggedInUsername(): String {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        return sharedPref.getString("loggedInUsername", "") ?: ""
    }
}