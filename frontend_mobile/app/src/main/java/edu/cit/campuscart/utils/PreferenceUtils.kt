package edu.cit.campuscart.utils

import android.content.Context

object PreferenceUtils {
    private const val PREFS_NAME = "CampusCartPrefs"
    private const val KEY_LIKED_PRODUCTS = "liked_products"

    fun getLikedProducts(context: Context): MutableSet<String> {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        return prefs.getStringSet(KEY_LIKED_PRODUCTS, mutableSetOf()) ?: mutableSetOf()
    }

    fun toggleLikedProduct(context: Context, productName: String): Boolean {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val likedSet = getLikedProducts(context).toMutableSet()

        val isLiked = if (likedSet.contains(productName)) {
            likedSet.remove(productName)
            false
        } else {
            likedSet.add(productName)
            true
        }

        prefs.edit().putStringSet(KEY_LIKED_PRODUCTS, likedSet).apply()
        return isLiked
    }

    fun isProductLiked(context: Context, productName: String): Boolean {
        return getLikedProducts(context).contains(productName)
    }
}
