package edu.cit.campuscart

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.ImageButton
import android.widget.Toast
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.forms.AddProductDialogFragment
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class LikePage: BaseActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var productAdapter: ProductAdapters
    private var productList = mutableListOf<Products>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_likepage)

        // Initialize RecyclerView
        recyclerView = findViewById(R.id.recyclerViewProducts)
        recyclerView.layoutManager = GridLayoutManager(this, 2)
        productAdapter = ProductAdapters(productList) { selectedProduct ->
            val dialog = ProductDetailDialogFragment.newInstance(selectedProduct)
            dialog.show(supportFragmentManager, "ProductDetailDialog")
        }
        recyclerView.adapter = productAdapter

        // Fetch products
        fetchProducts(getLoggedInUsername())

        // Setup fragment result listener to refresh list after product is added
        supportFragmentManager.setFragmentResultListener("product_added", this) { _, _ ->
            fetchProducts(getLoggedInUsername())
        }

        // Bottom nav buttons
        val likeButton = findViewById<ImageButton>(R.id.btnLikes)
        likeButton.setOnClickListener {
            if (this::class.java != LikePage::class.java) {
                startActivity(Intent(this@LikePage, LikePage::class.java))
                finish()
            }
        }

        val homeButton = findViewById<ImageButton>(R.id.btnHome)
        homeButton.setOnClickListener {
            startActivity(Intent(this@LikePage, HomePage::class.java))
        }

        val browseButton = findViewById<ImageButton>(R.id.btnBrowse)
        browseButton.setOnClickListener {
            startActivity(Intent(this@LikePage, BrowsePage::class.java))
        }

        val notifButton = findViewById<ImageButton>(R.id.btnNotifs)
        notifButton.setOnClickListener {
            startActivity(Intent(this@LikePage, NotificationPage::class.java))
        }
/*
        val messageButton = findViewById<ImageButton>(R.id.btnMessage)
        browseButton.setOnClickListener {
            startActivity(Intent(this@LikePage, MessagePage::class.java))
        }
 */
        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        profileButton.setOnClickListener {
            startActivity(Intent(this@LikePage, ProfilePage::class.java))
        }
    }

    private fun getLoggedInUsername(): String {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        return sharedPref.getString("loggedInUsername", "") ?: ""
    }

    private fun fetchProducts(username: String) {
        val apiService = RetrofitClient.instance
        val call = apiService.getAllProducts(username)

        call.enqueue(object : Callback<List<Products>> {
            override fun onResponse(call: Call<List<Products>>, response: Response<List<Products>>) {
                if (response.isSuccessful && response.body() != null) {
                    val approvedProducts = response.body()!!.filter {
                        it.status.equals("approved", ignoreCase = true)
                    }

                    runOnUiThread {
                        productList.clear()
                        productList.addAll(approvedProducts)
                        productAdapter.notifyDataSetChanged()
                    }
                } else {
                    Log.e("BrowsePage", "Failed to load products: ${response.message()}")
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                Log.e("BrowsePage", "Error: ${t.message}")
                Toast.makeText(this@LikePage, "Failed to load products", Toast.LENGTH_SHORT).show()
            }
        })
    }
}