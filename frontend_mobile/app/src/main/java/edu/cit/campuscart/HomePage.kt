package edu.cit.campuscart

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageButton
import android.widget.PopupWindow
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContentProviderCompat.requireContext

class HomePage : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_homepage) // Make sure this layout exists!

        val btnShowFilters = findViewById<ImageButton>(R.id.btnShowFilters)

        btnShowFilters.setOnClickListener {
            showFilterPopup(it)
        }
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