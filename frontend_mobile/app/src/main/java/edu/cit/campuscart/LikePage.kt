package edu.cit.campuscart
import android.content.Intent
import android.os.Bundle
import android.widget.ImageButton
import android.widget.Toast
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import edu.cit.campuscart.adapters.ProductAdapters
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.PreferenceUtils
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
class LikePage : BaseActivity() {

    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: ProductAdapters

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_likepage)

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

        /*val messageButton = findViewById<ImageButton>(R.id.btnMessage)
        messageButton.setOnClickListener {
            startActivity(Intent(this@LikePage, MessagePage::class.java))
        }*/

        val recyclerView = findViewById<RecyclerView>(R.id.recyclerViewLikes)
        val adapter = ProductAdapters(mutableListOf(), ::onProductClicked)
        recyclerView.layoutManager = GridLayoutManager(this, 2)
        recyclerView.adapter = adapter

        val likedNames = PreferenceUtils.getLikedProducts(this)

        RetrofitClient.instance.getAllProducts(getLoggedInUsername()).enqueue(object :
            Callback<List<Products>> {
            override fun onResponse(
                call: Call<List<Products>>,
                response: Response<List<Products>>
            ) {
                if (response.isSuccessful) {
                    val likedProducts =
                        response.body()?.filter { likedNames.contains(it.name) } ?: emptyList()
                    adapter.updateData(likedProducts)
                }
            }

            override fun onFailure(call: Call<List<Products>>, t: Throwable) {
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