package edu.cit.campuscart.pages

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.forms.AddProductDialogFragment
import edu.cit.campuscart.fragments.ProductDetailDialogFragment
import edu.cit.campuscart.fragments.SellerProductDetail
import edu.cit.campuscart.models.Notification
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class HomePage : BaseActivity() {

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
        setContentView(R.layout.activity_homepage) // Make sure this layout exists!

        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val username = sharedPref.getString("loggedInUsername", "User")
        val txtUsername = findViewById<TextView>(R.id.txtUsername)
        txtUsername.text = "Welcome, $username!"

        val badgeTextView: TextView = findViewById(R.id.notificationBadge)
        updateNotificationBadgeFromPrefs(badgeTextView)

        val addButton = findViewById<ImageButton>(R.id.btnAddProduct)
        addButton.setOnClickListener {
            val dialog = AddProductDialogFragment()
            dialog.show(supportFragmentManager, "AddProductDialog")
        }

        val homeButton = findViewById<ImageButton>(R.id.btnHome)
        homeButton.setOnClickListener {
            // If you're already on HomePage, no need to start a new instance of HomePage
            if (this::class.java != HomePage::class.java) {
                startActivity(Intent(this@HomePage, HomePage::class.java))
                finish()
            }
        }

        loadRecentProducts(getLoggedInUsername())

        val browseButton = findViewById<ImageButton>(R.id.btnBrowse)
        browseButton.setOnClickListener {
            startActivity(Intent(this@HomePage, BrowsePage::class.java))// Navigate to Browse Page
        }

        val likeButton = findViewById<ImageButton>(R.id.btnLikes)
        likeButton.setOnClickListener {
            startActivity(Intent(this@HomePage, LikePage::class.java))
        }

        val notifButton = findViewById<ImageButton>(R.id.btnNotifs)
        notifButton.setOnClickListener {
            startActivity(Intent(this@HomePage, NotificationPage::class.java))
        }

        /*val messageButton = findViewById<ImageButton>(R.id.btnMessage)
        messageButton.setOnClickListener {
            startActivity(Intent(this@HomePage, MessagePage::class.java))
        }*/

        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        profileButton.setOnClickListener {
            startActivity(Intent(this@HomePage, ProfilePage::class.java))
        }

        val intent = Intent(this, BrowsePage::class.java)

        findViewById<Button>(R.id.btnFood).setOnClickListener {
            val intent = Intent(this, BrowsePage::class.java)
            intent.putExtra("CATEGORY", "Food")
            startActivity(intent)
        }

        findViewById<Button>(R.id.btnClothes).setOnClickListener {
            val intent = Intent(this, BrowsePage::class.java)
            intent.putExtra("CATEGORY", "Clothes")
            startActivity(intent)
        }

        findViewById<Button>(R.id.btnAccessories).setOnClickListener {
            val intent = Intent(this, BrowsePage::class.java)
            intent.putExtra("CATEGORY", "Accessories")
            startActivity(intent)
        }

        findViewById<Button>(R.id.btnElectronics).setOnClickListener {
            val intent = Intent(this, BrowsePage::class.java)
            intent.putExtra("CATEGORY", "Electronics")
            startActivity(intent)
        }

        findViewById<Button>(R.id.btnMerch).setOnClickListener {
            val intent = Intent(this, BrowsePage::class.java)
            intent.putExtra("CATEGORY", "Merchandise")
            startActivity(intent)
        }

    }

    private fun getLoggedInUsername(): String {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        return sharedPref.getString("loggedInUsername", "") ?: ""
    }

    private fun loadRecentProducts(username:String) {
        val recyclerView = findViewById<RecyclerView>(R.id.recyclerRecentProducts)
        recyclerView.layoutManager = GridLayoutManager(this, 2)

        showLoadingOverlay()

        val apiService = RetrofitClient.instance
        val call = apiService.getAllProducts(username)

        call.enqueue(object : Callback<List<Products>> {
            override fun onResponse(call: Call<List<Products>>, response: Response<List<Products>>) {

                hideLoadingOverlay()

                if (response.isSuccessful) {
                    val approvedProducts = response.body()!!.filter {
                        it.status.equals("approved", ignoreCase = true)
                    }

                   // val allProducts = response.body() ?: emptyList()

                    // Show the last 10 added products (most recent assumed at end)
                    val recentProducts = approvedProducts.takeLast(10).reversed()

                    val adapter = ProductAdapters(recentProducts.toMutableList()) { product ->
                        val dialog = ProductDetailDialogFragment.newInstance(product)
                        dialog.show(supportFragmentManager, "ProductDetailDialogFragment")
                    }

                    recyclerView.adapter = adapter
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                hideLoadingOverlay()
                Log.e("HomePage", "Failed to load recent products: ${t.message}")
            }
        })
    }
}