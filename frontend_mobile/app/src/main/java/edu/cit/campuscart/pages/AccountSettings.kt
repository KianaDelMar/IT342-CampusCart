package edu.cit.campuscart.pages

import android.content.Intent
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.util.Log
import android.view.Gravity
import android.widget.Button
import android.widget.ImageButton
import android.widget.TextView
import android.widget.Toast
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout
import com.bumptech.glide.Glide
import com.google.android.material.imageview.ShapeableImageView
import edu.cit.campuscart.BaseActivity
import edu.cit.campuscart.MainActivity
import edu.cit.campuscart.R
import edu.cit.campuscart.forms.ChangePassword
import edu.cit.campuscart.forms.EditUserDetails
import edu.cit.campuscart.models.Seller
import edu.cit.campuscart.models.UploadResponse
import edu.cit.campuscart.utils.Constants
import edu.cit.campuscart.utils.RetrofitClient
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileOutputStream

class AccountSettings : BaseActivity() {

    companion object {
        private const val REQUEST_IMAGE_PICK = 1001
    }
    private var selectedImageFile: File? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.account_settings)

        val swipeRefreshLayout = findViewById<SwipeRefreshLayout>(R.id.swipeRefreshLayout)
        val btnUpload = findViewById<Button>(R.id.btnUpload)
        val btnSave = findViewById<Button>(R.id.btnSave)
        val profilepic = findViewById<ShapeableImageView>(R.id.profilepic)
        val btnEditProfile = findViewById<Button>(R.id.btnEditProfile)
        val btnChangePassword = findViewById<Button>(R.id.btnChangePassword)
        val btnDelete = findViewById<Button>(R.id.btnDelete)

        val textUsername = findViewById<TextView>(R.id.textUsername)
        val textFName = findViewById<TextView>(R.id.textFName)
        val textLName = findViewById<TextView>(R.id.textLName)
        val textAddress = findViewById<TextView>(R.id.textAddress)
        val textEmail = findViewById<TextView>(R.id.textEmail)
        val textContact = findViewById<TextView>(R.id.textContact)

        fetchSellerData(textUsername, textFName, textLName, textAddress, textEmail, textContact)

        btnUpload.setOnClickListener {
            // Open gallery to pick an image
            val pickImageIntent = Intent(Intent.ACTION_PICK, MediaStore.Images.Media.EXTERNAL_CONTENT_URI)
            startActivityForResult(pickImageIntent, REQUEST_IMAGE_PICK)
        }

        btnSave.setOnClickListener {
            selectedImageFile?.let { imageFile ->
                val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
                val loggedInUsername = sharedPref.getString("loggedInUsername", "") ?: ""
                uploadProfilePhoto(loggedInUsername, imageFile)
            } ?: run {
                Log.e("Save", "No image selected!")
            }
        }

        val profileButton = findViewById<ImageButton>(R.id.btnProfile)
        profileButton.setOnClickListener {
            startActivity(Intent(this@AccountSettings, ProfilePage::class.java))
        }

        val browseButton = findViewById<ImageButton>(R.id.btnBrowse)
        browseButton.setOnClickListener {
            startActivity(Intent(this@AccountSettings, BrowsePage::class.java))
        }

        val notifButton = findViewById<ImageButton>(R.id.btnNotifs)
        notifButton.setOnClickListener {
            startActivity(Intent(this@AccountSettings, NotificationPage::class.java))
        }

        val homeButton = findViewById<ImageButton>(R.id.btnHome)
        homeButton.setOnClickListener {
            startActivity(Intent(this@AccountSettings, HomePage::class.java))
        }
        /*
        val messageButton = findViewById<ImageButton>(R.id.btnMessage)
        messageButton.setOnClickListener {
            startActivity(Intent(this@ProfilePage, MessagePage::class.java))
        }*/

        val likeButton = findViewById<ImageButton>(R.id.btnLikes)
        likeButton.setOnClickListener {
            startActivity(Intent(this@AccountSettings, LikePage::class.java))
        }

        btnEditProfile.setOnClickListener {
            val editUserDialog = EditUserDetails()
            editUserDialog.show(supportFragmentManager, "EditUserDetails")
        }

        btnChangePassword.setOnClickListener {
            val changePassword = ChangePassword()
            changePassword.show(supportFragmentManager, "ChangePassword")
        }

        btnDelete.setOnClickListener {
            showDeleteAccountConfirmation()
        }

        swipeRefreshLayout.setOnRefreshListener {
            fetchSellerData(textUsername, textFName, textLName, textAddress, textEmail, textContact)
            swipeRefreshLayout.isRefreshing = false
        }

    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        val profilepic = findViewById<ShapeableImageView>(R.id.profilepic)

        if (requestCode == REQUEST_IMAGE_PICK && resultCode == RESULT_OK && data != null) {
            val imageUri: Uri = data.data!!

            val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
            val loggedInUsername = sharedPref.getString("loggedInUsername", "") ?: ""
            selectedImageFile = prepareImageFile(imageUri, loggedInUsername)

            val bitmap = BitmapFactory.decodeFile(selectedImageFile?.absolutePath)
            profilepic.setImageBitmap(bitmap)  // Setting the selected image
        }
    }

    private fun uploadProfilePhoto(username: String, imageFile: File) {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val token = "Bearer ${sharedPref.getString("authToken", "")}"

        val requestFile = imageFile.asRequestBody("image/*".toMediaTypeOrNull())
        val multipartBody = MultipartBody.Part.createFormData("file", imageFile.name, requestFile)

        val call = RetrofitClient.instance
        call.uploadProfilePhoto(token, username, multipartBody)
            .enqueue(object : Callback<UploadResponse> {
                override fun onResponse(call: Call<UploadResponse>, response: Response<UploadResponse>) {
                    if (response.isSuccessful) {
                        Log.d("Upload", "Success: ${response.body()?.message}")
                        showSuccessToast()
                    } else {
                        showFailToast()
                        Log.e("Upload", "Error: ${response.errorBody()?.string()}")
                    }
                }
                override fun onFailure(call: Call<UploadResponse>, t: Throwable) {
                    Log.e("Upload", "Failed: ${t.localizedMessage}")
                    showFailToast()
                }
            })
    }

    private fun prepareImageFile(uri: Uri, username: String): File {
        val directory = File(applicationContext.cacheDir, "profile_images")
        if (!directory.exists()) {
            directory.mkdir() // Ensure directory exists
        }
        val file = File(directory, "profile_${username}.jpg")
        val inputStream = contentResolver.openInputStream(uri)
        val outputStream = FileOutputStream(file)
        inputStream?.copyTo(outputStream)
        inputStream?.close()
        outputStream.close()
        return file
    }

    private fun fetchSellerData(
        textUsername: TextView,
        textFName: TextView,
        textLName: TextView,
        textAddress: TextView,
        textEmail: TextView,
        textContact: TextView
    ) {
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val token = "Bearer ${sharedPref.getString("authToken", "")}"
        val loggedInUsername = sharedPref.getString("loggedInUsername", "") ?: ""
        val profilepic = findViewById<ShapeableImageView>(R.id.profilepic)

        showLoadingOverlay()

        RetrofitClient.instance.getUserByUsername(token, loggedInUsername)
            .enqueue(object : Callback<Seller> {
                override fun onResponse(call: Call<Seller>, response: Response<Seller>) {
                    hideLoadingOverlay()
                    if (response.isSuccessful) {
                        val sellerData = response.body()
                        sellerData?.let {
                            textUsername.text = it.username
                            textFName.text = it.firstName
                            textLName.text = it.lastName
                            textAddress.text = it.address
                            textEmail.text = it.email
                            textContact.text = it.contactNo

                            if (sellerData.profilePhoto.isNotEmpty()) {
                                Glide.with(this@AccountSettings)
                                    .load("${Constants.BASE_URL}uploads/${sellerData.profilePhoto}")
                                    .placeholder(R.drawable.defaultphoto)
                                    .error(R.drawable.defaultphoto)
                                    .into(profilepic)
                            } else {
                                profilepic.setImageResource(R.drawable.defaultphoto)
                            }
                        }
                    } else {
                        Log.e("SellerData", "Error: ${response.errorBody()?.string()}")
                    }
                }

                override fun onFailure(call: Call<Seller>, t: Throwable) {
                    hideLoadingOverlay()
                    Log.e("SellerData", "Failed: ${t.localizedMessage}")
                }
            })
    }

    private fun deleteUserAccount() {
        val sharedPreferences = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val username = sharedPreferences.getString("loggedInUsername", null)
        val token = "Bearer ${sharedPreferences.getString("authToken", "")}"

        if (username.isNullOrEmpty() || token.isEmpty()) {
            Toast.makeText(this, "Username or token not found", Toast.LENGTH_SHORT).show()
            return
        }

        RetrofitClient.instance.deleteUser(token, username)
            .enqueue(object : Callback<ResponseBody> {
                override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                    if (response.isSuccessful) {
                        Toast.makeText(this@AccountSettings, "Account deleted successfully", Toast.LENGTH_SHORT).show()

                        // Clear shared preferences
                        val editor = sharedPreferences.edit()
                        editor.clear()
                        editor.apply()

                        // Navigate back to MainActivity
                        val intent = Intent(this@AccountSettings, MainActivity::class.java)
                        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                        startActivity(intent)
                        finish()
                    } else {
                        Toast.makeText(this@AccountSettings, "Failed to delete account", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                    Toast.makeText(this@AccountSettings, "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    private fun showDeleteAccountConfirmation() {
        val dialogView = layoutInflater.inflate(R.layout.dialog_confirm_delete_account, null)
        val dialog = android.app.AlertDialog.Builder(this)
            .setView(dialogView)
            .setCancelable(false)
            .create()

        val btnConfirm = dialogView.findViewById<Button>(R.id.btnConfirm)
        val btnCancel = dialogView.findViewById<Button>(R.id.btnCancel)

        btnConfirm.setOnClickListener {
            dialog.dismiss()
            deleteUserAccount()
        }
        btnCancel.setOnClickListener {
            dialog.dismiss()
        }
        dialog.show()
    }

    private fun showSuccessToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_upload_success, null)
        val toast = Toast(this)
        toast.view = toastView
        toast.duration = Toast.LENGTH_SHORT
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
        toast.show()
    }

    private fun showFailToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_upload_fail, null)
        val toast = Toast(this)
        toast.view = toastView
        toast.duration = Toast.LENGTH_SHORT
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
        toast.show()
    }
}