package edu.cit.campuscart

import android.view.View
import android.widget.FrameLayout
import androidx.appcompat.app.AppCompatActivity

open class BaseActivity : AppCompatActivity() {
    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            hideSystemUI()
        }
    }

    private fun hideSystemUI() {
        window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                        or View.SYSTEM_UI_FLAG_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                        or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                        or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                        or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                )
    }

    // Show the loading overlay (with ProgressBar)
    fun showLoadingOverlay() {
        val loadingOverlay = findViewById<FrameLayout>(R.id.loadingOverlay)
        loadingOverlay?.visibility = View.VISIBLE
    }

    // Hide the loading overlay
    fun hideLoadingOverlay() {
        val loadingOverlay = findViewById<FrameLayout>(R.id.loadingOverlay)
        loadingOverlay?.visibility = View.GONE
    }
}
