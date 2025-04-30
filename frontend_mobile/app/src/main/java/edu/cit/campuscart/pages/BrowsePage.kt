package edu.cit.campuscart.pages

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.PopupWindow
import android.widget.ProgressBar
import android.widget.Spinner
import android.widget.TextView
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
import com.google.gson.reflect.TypeToken
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.google.gson.Gson
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.fragments.ProductDetailDialogFragment
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Notification

class BrowsePage : BaseActivity() {
    private lateinit var recyclerView: RecyclerView
    private lateinit var productAdapter: ProductAdapters
    private var productList = mutableListOf<Products>()
    private lateinit var swipeRefreshLayout: SwipeRefreshLayout  // Add SwipeRefreshLayout
    private var allProducts = mutableListOf<Products>()
    
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
        setContentView(R.layout.activity_browsepage)

        val selectedCategory = intent.getStringExtra("CATEGORY")
        fetchProducts(getLoggedInUsername(), selectedCategory)

        // Initialize SwipeRefreshLayout
        swipeRefreshLayout = findViewById(R.id.swipeRefreshLayout)
        swipeRefreshLayout.setOnRefreshListener {
            fetchProducts(getLoggedInUsername(), selectedCategory)
        }

        // Initialize RecyclerView
        recyclerView = findViewById(R.id.recyclerViewProducts)
        recyclerView.layoutManager = GridLayoutManager(this, 2)


        // Initialize RecyclerView
        recyclerView = findViewById(R.id.recyclerViewProducts)
        recyclerView.layoutManager = GridLayoutManager(this, 2)

        val badgeTextView: TextView = findViewById(R.id.notificationBadge)
        updateNotificationBadgeFromPrefs(badgeTextView)

        productAdapter = ProductAdapters(productList) { selectedProduct ->
            val dialog = ProductDetailDialogFragment.newInstance(selectedProduct)
            dialog.show(supportFragmentManager, "ProductDetailDialog")
        }
        recyclerView.adapter = productAdapter

        //fetchProducts(getLoggedInUsername())

        supportFragmentManager.setFragmentResultListener("product_added", this) { _, _ ->
            fetchProducts(getLoggedInUsername())
        }

        val searchBar = findViewById<EditText>(R.id.searchBar)
        searchBar.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(query: CharSequence?, start: Int, before: Int, count: Int) {
                val filtered = allProducts.filter {
                    it.name.contains(query.toString(), ignoreCase = true)
                }
                productAdapter.updateList(filtered.toMutableList())
            }

            override fun afterTextChanged(s: Editable?) {}
        })

        val addButton = findViewById<ImageButton>(R.id.btnAddProduct)
        addButton.setOnClickListener {
            val dialog = AddProductDialogFragment()
            dialog.show(supportFragmentManager, "AddProductDialog")
        }

        val btnShowFilters = findViewById<ImageButton>(R.id.btnShowFilters)
        btnShowFilters.setOnClickListener {
            showFilterPopup(it)
        }

        // Bottom Nav Buttons
        val browseButton = findViewById<ImageButton>(R.id.btnBrowse)
        browseButton.setOnClickListener {
            if (this::class.java != BrowsePage::class.java) {
                startActivity(Intent(this@BrowsePage, BrowsePage::class.java))
                finish()
            }
        }

        val homeButton = findViewById<ImageButton>(R.id.btnHome)
        homeButton.setOnClickListener {
            startActivity(Intent(this@BrowsePage, HomePage::class.java))
        }

        val likeButton = findViewById<ImageButton>(R.id.btnLikes)
        likeButton.setOnClickListener {
            startActivity(Intent(this@BrowsePage, LikePage::class.java))
        }

        val notifButton = findViewById<ImageButton>(R.id.btnNotifs)
        notifButton.setOnClickListener {
            startActivity(Intent(this@BrowsePage, NotificationPage::class.java))
        }

        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        profileButton.setOnClickListener {
            startActivity(Intent(this@BrowsePage, ProfilePage::class.java))
        }
        /*
        val messageButton = findViewById<ImageButton>(R.id.btnMessage)
        messageButton.setOnClickListener {
            startActivity(Intent(this@BrowsePage, MessagePage::class.java))
        }*/

    }

    private fun getLoggedInUsername(): String {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        return sharedPref.getString("loggedInUsername", "") ?: ""
    }

    private fun fetchProducts(username: String, category: String? = null) {
        val apiService = RetrofitClient.instance
        val call = apiService.getAllProducts(username)
        showLoadingOverlay()

        call.enqueue(object : Callback<List<Products>> {
            override fun onResponse(call: Call<List<Products>>, response: Response<List<Products>>) {
                hideLoadingOverlay()

                if (response.isSuccessful && response.body() != null) {
                    val approvedProducts = response.body()!!.filter {
                        it.status.equals("approved", ignoreCase = true)
                    }

                    val categoryFiltered = category?.let {
                        approvedProducts.filter { product ->
                            product.category.equals(it, ignoreCase = true)
                        }
                    } ?: approvedProducts

                    runOnUiThread {
                        productList.clear()
                        productList.addAll(categoryFiltered)

                        allProducts.clear()
                        allProducts.addAll(categoryFiltered)

                        productAdapter.notifyDataSetChanged()
                    }
                } else {
                    Log.e("BrowsePage", "Failed to load products: ${response.message()}")
                }

                swipeRefreshLayout.isRefreshing = false
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                hideLoadingOverlay()

                Log.e("BrowsePage", "Error: ${t.message}")
                Toast.makeText(this@BrowsePage, "Failed to load products", Toast.LENGTH_SHORT).show()
                swipeRefreshLayout.isRefreshing = false
            }
        })
    }

    private fun fetchFilteredProducts(username: String, category: String?, condition: String?) {
        val sharedPreferences = getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
        val token = sharedPreferences.getString("authToken", "") ?: ""

        if (token.isEmpty()) {
            Toast.makeText(this, "User not authenticated. Please log in again.", Toast.LENGTH_SHORT).show()
            return
        }

        val bearerToken = "Bearer $token"
        showLoadingOverlay()

        RetrofitClient.instance.getFilteredProducts(
            bearerToken, username, category, condition
        ).enqueue(object : Callback<List<Products>> {
            override fun onResponse(call: Call<List<Products>>, response: Response<List<Products>>) {
                hideLoadingOverlay()

                if (response.isSuccessful) {
                    val filteredProducts = response.body() ?: emptyList()
                    productAdapter.updateList(filteredProducts)
                } else {
                    Log.e("BrowsePage", "Failed to load filtered products: ${response.code()}")
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                hideLoadingOverlay()
                Toast.makeText(this@BrowsePage, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun filterProductsByCategory(category: String) {
        val filtered = allProducts.filter { it.category == category }
        productAdapter.updateList(filtered)
    }

    private fun showFilterPopup(anchorView: View) {
        val popupView = LayoutInflater.from(this).inflate(R.layout.filter_dialog, null)
        val popupWindow = PopupWindow(
            popupView,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            true
        )

        val location = IntArray(2)
        anchorView.getLocationOnScreen(location)

        val screenWidth = resources.displayMetrics.widthPixels
        val popupX = location[0] + anchorView.width
        val popupY = location[1] + anchorView.height

        val maxPopupWidth = screenWidth - popupX
        if (maxPopupWidth < popupView.measuredWidth) {
            popupWindow.width = maxPopupWidth
        }

        popupWindow.showAtLocation(anchorView, 0, popupX, popupY)
        popupWindow.isOutsideTouchable = true
        popupWindow.isTouchable = true

        val spinnerCategory = popupView.findViewById<Spinner>(R.id.spinnerCategory)
        val spinnerCondition = popupView.findViewById<Spinner>(R.id.spinnerCondition)

        val categories = listOf("Select Category", "Electronics", "Clothes", "Food", "Accessories", "Stationery/Arts & Crafts", "Merchandise", "Beauty", "Books", "Others")
        val conditions = listOf("Select Condition", "New", "Used", "Others")

        val categoryAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, categories)
        val conditionAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, conditions)

        spinnerCategory.adapter = categoryAdapter
        spinnerCondition.adapter = conditionAdapter

        popupView.findViewById<Button>(R.id.btnApply).setOnClickListener {
            val selectedCategory = spinnerCategory.selectedItem.toString()
            val selectedCondition = spinnerCondition.selectedItem.toString()

            popupWindow.dismiss()

            // Apply the filter API call
            fetchFilteredProducts(getLoggedInUsername(), selectedCategory.takeIf { it != "Select Category" }, selectedCondition.takeIf { it != "Select Condition" })
        }

        popupView.findViewById<Button>(R.id.btnClear).setOnClickListener {
            popupWindow.dismiss()
            fetchProducts(getLoggedInUsername()) // Call your original method to show all products
        }
    }
}