package edu.cit.campuscart.pages

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageButton
import android.widget.PopupWindow
import android.widget.Spinner
import android.widget.TextView
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.forms.AddProductDialogFragment

class HomePage : BaseActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_homepage) // Make sure this layout exists!

        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val username = sharedPref.getString("loggedInUsername", "User")
        val txtUsername = findViewById<TextView>(R.id.txtUsername)
        txtUsername.text = "Welcome, $username!"

        val btnShowFilters = findViewById<ImageButton>(R.id.btnShowFilters)
        val addButton = findViewById<ImageButton>(R.id.btnAddProduct)
        addButton.setOnClickListener {
            val dialog = AddProductDialogFragment()
            dialog.show(supportFragmentManager, "AddProductDialog")
        }

        btnShowFilters.setOnClickListener {
            showFilterPopup(it)
        }

        val homeButton = findViewById<ImageButton>(R.id.btnHome)
        homeButton.setOnClickListener {
            // If you're already on HomePage, no need to start a new instance of HomePage
            if (this::class.java != HomePage::class.java) {
                startActivity(Intent(this@HomePage, HomePage::class.java))
                finish()
            }
        }

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
    }
    private fun showFilterPopup(anchorView: View) {
        // Inflate the filter_dialog.xml layout
        val popupView = LayoutInflater.from(this).inflate(R.layout.filter_dialog, null)

        // Create PopupWindow
        val popupWindow = PopupWindow(
            popupView,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            ViewGroup.LayoutParams.WRAP_CONTENT,
            true // Focusable
        )

        // Get location of the filter button (btnShowFilters)
        val location = IntArray(2)
        anchorView.getLocationOnScreen(location)

        // Get screen width to adjust position
        val screenWidth = resources.displayMetrics.widthPixels

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

        val categories = listOf("Select Category", "Electronics", "Clothes", "Food", "Accessories", "Stationery/Arts & Crafts", "Merchandise", "Beauty", "Books", "Others")
        val conditions = listOf("Select Condition", "New", "Used", "Others")

// Set adapters
        val categoryAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, categories)
        val conditionAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, conditions)
        spinnerCategory.adapter = categoryAdapter
        spinnerCondition.adapter = conditionAdapter

    }
}