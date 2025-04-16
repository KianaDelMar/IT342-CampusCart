package edu.cit.campuscart.forms

import android.app.Activity
import android.app.Dialog
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Toast
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.lifecycleScope
import edu.cit.campuscart.R
import edu.cit.campuscart.databinding.DialogAddProductBinding
import edu.cit.campuscart.utils.RetrofitClient
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import java.io.File
import java.io.FileOutputStream
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.ResponseBody
import retrofit2.Response
import retrofit2.Call
import retrofit2.Callback

class AddProductDialogFragment : DialogFragment() {

    private lateinit var imagePickerLauncher: ActivityResultLauncher<Intent>
    private var selectedImageUri: Uri? = null
    private var _binding: DialogAddProductBinding? = null
    private val binding get() = _binding!!

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        imagePickerLauncher = registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            if (result.resultCode == Activity.RESULT_OK && result.data != null) {
                selectedImageUri = result.data?.data
                binding.imagePreview.setImageURI(selectedImageUri)
            }
        }
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = DialogAddProductBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onStart() {
        super.onStart()
        dialog?.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.99).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        // Set dropdown options
        val categories = listOf(
            "Select Category", "Electronics", "Clothes", "Food", "Accessories",
            "Stationery/Arts & Crafts", "Merchandise", "Beauty", "Books", "Others"
        )
        val conditions = listOf("Select Condition", "New", "Used", "Others")

        binding.dropCategory.adapter = ArrayAdapter(
            requireContext(), android.R.layout.simple_spinner_dropdown_item, categories
        )
        binding.dropCondition.adapter = ArrayAdapter(
            requireContext(), android.R.layout.simple_spinner_dropdown_item, conditions
        )

        // Image picker button
        binding.btnSelectImage.setOnClickListener {
            val intent = Intent(Intent.ACTION_GET_CONTENT).apply { type = "image/*" }
            imagePickerLauncher.launch(intent)
        }

        // Back button
        binding.btnBack.setOnClickListener { dismiss() }

        binding.btnSubmit.setOnClickListener {
            val name = binding.inputProductName.text.toString().trim()
            val description = binding.inputDescription.text.toString().trim()
            val quantity = binding.inputQuantity.text.toString().trim()
            val price = binding.inputPrice.text.toString().trim()
            val category = binding.dropCategory.selectedItem.toString()
            val condition = binding.dropCondition.selectedItem.toString()
            val status = "Pending"

            val sellerUsername = requireContext()
                .getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
                .getString("loggedInUsername", "") ?: ""

            if (name.isBlank() || description.isBlank() || quantity.isBlank() || price.isBlank()
                || category == "Select Category" || condition == "Select Condition" || selectedImageUri == null
            ) {
                Toast.makeText(requireContext(), "Please fill all fields and select an image.", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    // Prepare form data as RequestBody
                    val namePart = name.toRequestBody("text/plain".toMediaType())
                    val descriptionPart = description.toRequestBody("text/plain".toMediaType())
                    val quantityPart = quantity.toRequestBody("text/plain".toMediaType())
                    val pricePart = price.toRequestBody("text/plain".toMediaType())
                    val categoryPart = category.toRequestBody("text/plain".toMediaType())
                    val statusPart = status.toRequestBody("text/plain".toMediaType())
                    val conditionPart = condition.toRequestBody("text/plain".toMediaType())
                    val usernamePart = sellerUsername.toRequestBody("text/plain".toMediaType())

                    // Prepare the image as MultipartBody.Part
                    val imageFile = prepareImageFile(selectedImageUri!!)  // Assuming this is how you prepare the file
                    val imagePart = MultipartBody.Part.createFormData(
                        "image",  // The name that the backend expects for the image field
                        imageFile.name,  // This uses the file's name, e.g., candies.jpg
                        imageFile.asRequestBody("image/*".toMediaType())  // Media type of the file
                    )

                    // Retrieve the token from SharedPreferences
                    val token = requireContext()
                        .getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
                        .getString("authToken", "") ?: ""

                    val bearerToken = "Bearer $token"
                    Log.d("AddProduct", "Token: $bearerToken")
                    // Make the API request to post the product
                    RetrofitClient.instance.postProduct(
                          // Adding the Authorization token in the header
                        bearerToken, namePart, descriptionPart, quantityPart, pricePart, categoryPart,
                        statusPart, conditionPart, usernamePart, imagePart
                    ).enqueue(object : Callback<ResponseBody> {
                        override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                            Log.d("AddProduct", "Response code: ${response.code()}")
                            if (response.isSuccessful) {
                                showSuccessToast()
                                dismiss()
                            } else {
                                val errorBody = response.errorBody()?.string()
                                Log.e("AddProduct", "Error: $errorBody")
                                Log.e("AddProduct", "Error: ${response.errorBody()?.string()}")
                                showFailToast()
                            }
                        }

                        override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                            Toast.makeText(requireContext(), "Error: ${t.message}", Toast.LENGTH_LONG).show()
                            Log.e("AddProduct", "Network failure", t)
                        }
                    })

                } catch (e: Exception) {
                    Log.e("AddProduct", "Exception during submission", e)
                    Toast.makeText(requireContext(), "Exception: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun showSuccessToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_add_success, null)
        val toast = Toast(requireContext())
        toast.view = toastView
        toast.duration = Toast.LENGTH_SHORT
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
        toast.show()
    }

    private fun showFailToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_add_fail, null)
        val toast = Toast(requireContext())
        toast.view = toastView
        toast.duration = Toast.LENGTH_SHORT
        toast.setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
        toast.show()
    }

    private fun prepareImageFile(uri: Uri): File {
        // Get the file from the URI (your method might vary based on how you handle images)
        val file = File(requireContext().cacheDir, "upload_${System.currentTimeMillis()}.jpg")
       // val file = File(requireContext().cacheDir, "upload_${name}.jpg")
        val inputStream = requireContext().contentResolver.openInputStream(uri)
        val outputStream = FileOutputStream(file)
        inputStream?.copyTo(outputStream)
        inputStream?.close()
        outputStream.close()
        return file
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = super.onCreateDialog(savedInstanceState)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        return dialog
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}