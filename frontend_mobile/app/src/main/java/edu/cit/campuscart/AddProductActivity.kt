package edu.cit.campuscart

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import edu.cit.campuscart.utils.RetrofitClient
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File

class AddProductActivity : AppCompatActivity() {

    private lateinit var imageUri: Uri
    private var imageSelected = false
    private val PICK_IMAGE_REQUEST = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_add_product)

        val imagePreview = findViewById<ImageView>(R.id.imagePreview)
        val btnChooseImage = findViewById<Button>(R.id.btnSelectImage)
        val btnSubmit = findViewById<Button>(R.id.btnSubmit)
        val btnBack = findViewById<Button>(R.id.btnBack)

        val name = findViewById<EditText>(R.id.inputProductName)
        val description = findViewById<EditText>(R.id.inputDescription)
        val qty = findViewById<EditText>(R.id.inputQuantity)
        val price = findViewById<EditText>(R.id.inputPrice)

        val category = findViewById<Spinner>(R.id.dropCategory)
        val condition = findViewById<Spinner>(R.id.dropCondition)

        // Setup dropdowns
        val categories = listOf("Select Category", "Select Category", "Electronics", "Clothes", "Food", "Accessories", "Stationery/Arts & Crafts", "Merchandise", "Beauty", "Books", "Others")
        val conditions = listOf("Select Condition", "New", "Pre-Loved")

        category.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, categories)
        condition.adapter = ArrayAdapter(this, android.R.layout.simple_spinner_dropdown_item, conditions)

        btnChooseImage.setOnClickListener {
            val intent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(intent, PICK_IMAGE_REQUEST)
        }

        btnBack.setOnClickListener {
            finish()
        }

        btnSubmit.setOnClickListener {
            if (!imageSelected) {
                Toast.makeText(this, "Please select an image", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            val imageFile = File(getRealPathFromURI(imageUri)!!)
            val requestFile = RequestBody.create("image/*".toMediaTypeOrNull(), imageFile)
            val imagePart = MultipartBody.Part.createFormData("image", imageFile.name, requestFile)

            val requestMap = mapOf(
                "name" to RequestBody.create("text/plain".toMediaTypeOrNull(), name.text.toString()),
                "pdtDescription" to RequestBody.create("text/plain".toMediaTypeOrNull(), description.text.toString()),
                "qtyInStock" to RequestBody.create("text/plain".toMediaTypeOrNull(), qty.text.toString()),
                "buyPrice" to RequestBody.create("text/plain".toMediaTypeOrNull(), price.text.toString()),
                "category" to RequestBody.create("text/plain".toMediaTypeOrNull(), category.selectedItem.toString()),
                "status" to RequestBody.create("text/plain".toMediaTypeOrNull(), "Pending"),
                "conditionType" to RequestBody.create("text/plain".toMediaTypeOrNull(), condition.selectedItem.toString()),
                "seller_username" to RequestBody.create("text/plain".toMediaTypeOrNull(), "your_seller_username_here")
            )

            RetrofitClient.instance.postProduct(
                requestMap["name"]!!,
                requestMap["pdtDescription"]!!,
                requestMap["qtyInStock"]!!,
                requestMap["buyPrice"]!!,
                imagePart,
                requestMap["category"]!!,
                requestMap["status"]!!,
                requestMap["conditionType"]!!,
                requestMap["seller_username"]!!
            ).enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@AddProductActivity, "Product added!", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@AddProductActivity, "Failed to add product", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(this@AddProductActivity, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
        }
    }

    private fun getRealPathFromURI(uri: Uri): String? {
        val cursor = contentResolver.query(uri, null, null, null, null)
        return if (cursor != null && cursor.moveToFirst()) {
            val idx = cursor.getColumnIndex(MediaStore.Images.ImageColumns.DATA)
            val path = cursor.getString(idx)
            cursor.close()
            path
        } else {
            uri.path
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_IMAGE_REQUEST && resultCode == Activity.RESULT_OK && data != null && data.data != null) {
            imageUri = data.data!!
            findViewById<ImageView>(R.id.imagePreview).setImageURI(imageUri)
            imageSelected = true
        }
    }
}
