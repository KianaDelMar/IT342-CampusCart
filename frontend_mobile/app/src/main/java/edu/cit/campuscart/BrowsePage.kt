package edu.cit.campuscart

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.PopupWindow
import android.widget.Spinner
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.forms.AddProductDialogFragment
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class BrowsePage : AppCompatActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var productAdapter: ProductAdapters
    private var productList = mutableListOf<Products>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_browsepage)

        // Initialize RecyclerView
        recyclerView = findViewById(R.id.recyclerViewProducts)
        recyclerView.layoutManager = GridLayoutManager(this, 2)

        // Fetch products
        val username = getLoggedInUsername()
        fetchProducts(username)

        //Show Form
        val addButton = findViewById<ImageButton>(R.id.btnAddProduct)
        addButton.setOnClickListener {
            val dialog = AddProductDialogFragment()
            dialog.show(supportFragmentManager, "AddProductDialog")
        }

        val btnShowFilters = findViewById<ImageButton>(R.id.btnShowFilters)
        btnShowFilters.setOnClickListener {
            showFilterPopup(it)
        }

        // Bottom nav buttons
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
                if (response.isSuccessful) {
                    val products = response.body()
                    if (products != null) {
                        val approvedProducts = products.filter {
                            it.status.equals("approved", ignoreCase = true)
                        }
                        productList.clear()
                        productList.addAll(approvedProducts)
                        productAdapter = ProductAdapters(productList)
                        recyclerView.adapter = productAdapter
                    } else {
                        Log.e("BrowsePage", "Products list is empty or null")
                    }
                } else {
                    Log.e("BrowsePage", "Failed to load products: ${response.message()}")
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
                Log.e("BrowsePage", "Error: ${t.message}")
                Toast.makeText(this@BrowsePage, "Failed to load products", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun showFilterPopup(anchorView: View) {
        // Inflate the filter_dialog.xml layout
        val popupView = LayoutInflater.from(this).inflate(R.layout.filter_dialog, null)

        // Create PopupWindow
        val popupWindow = PopupWindow(
            popupView,
            ViewGroup.LayoutParams.WRAP_CONTENT,  // Corrected reference
            ViewGroup.LayoutParams.WRAP_CONTENT,
            true // Focusable
        )

        // Get location of the filter button (btnShowFilters)
        val location = IntArray(2)
        anchorView.getLocationOnScreen(location)

        // Get screen width to adjust position
        val screenWidth = resources.displayMetrics.widthPixels

        // Calculate X position to align to the right of the button
        val popupX = location[0] + anchorView.width // Start from the right edge of the button
        val popupY = location[1] + anchorView.height // Position below the button

        // Ensure popup does not go off-screen
        val maxPopupWidth = screenWidth - popupX
        if (maxPopupWidth < popupView.measuredWidth) {
            popupWindow.width = maxPopupWidth
        }

        // Show the popup aligned to the right of the button
        popupWindow.showAtLocation(anchorView, 0, popupX, popupY)

        // Dismiss when clicking outside
        popupWindow.setOutsideTouchable(true)
        popupWindow.setTouchable(true)

        val spinnerCategory = popupView.findViewById<Spinner>(R.id.spinnerCategory)
        val spinnerCondition = popupView.findViewById<Spinner>(R.id.spinnerCondition)

// Define the dropdown items
        val categories = listOf("Select Category", "Electronics", "Clothes", "Food", "Accessories", "Stationery/Arts & Crafts", "Merchandise", "Beauty", "Books", "Others")
        val conditions = listOf("Select Condition", "New", "Used", "Others")

// Set adapters
        val categoryAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, categories)
        val conditionAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, conditions)
        spinnerCategory.adapter = categoryAdapter
        spinnerCondition.adapter = conditionAdapter

    }
}

