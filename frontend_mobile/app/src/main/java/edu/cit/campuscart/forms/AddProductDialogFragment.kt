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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody
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

        // Image picker button (moved outside of submit logic)
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
                Toast.makeText(
                    requireContext(),
                    "Please fill all fields and select an image.",
                    Toast.LENGTH_SHORT
                ).show()
                return@setOnClickListener
            }

            lifecycleScope.launch {
                try {
                    val namePart = name.toPlainTextRequestBody()
                    val descriptionPart = description.toPlainTextRequestBody()
                    val quantityPart = quantity.toPlainTextRequestBody()
                    val pricePart = price.toPlainTextRequestBody()
                    val categoryPart = category.toPlainTextRequestBody()
                    val statusPart = status.toPlainTextRequestBody()
                    val conditionPart = condition.toPlainTextRequestBody()
                    val usernamePart = sellerUsername.toPlainTextRequestBody()

                    val imageFile = prepareImageFile(selectedImageUri!!)
                    val imagePart = MultipartBody.Part.createFormData(
                        "image",
                        imageFile.name,
                        imageFile.asRequestBody("image/*".toMediaType())
                    )

                    RetrofitClient.instance.postProduct(
                        namePart,
                        descriptionPart,
                        quantityPart,
                        pricePart,
                        imagePart,
                        categoryPart,
                        statusPart,
                        conditionPart,
                        usernamePart
                    ).enqueue(object : Callback<String> {
                        override fun onResponse(call: Call<String>, response: Response<String>) {
                            Log.d("AddProduct", "Response code: ${response.code()}")
                            if (response.isSuccessful) {
                                showSuccessToast()
                                dismiss()
                            } else {
                                val errorBody = response.errorBody()?.string()
                                Log.e("AddProduct", "Error: $errorBody")
                                showFailToast()
                            }
                        }

                        override fun onFailure(call: Call<String>, t: Throwable) {
                            Toast.makeText(
                                requireContext(),
                                "Error: ${t.message}",
                                Toast.LENGTH_LONG
                            ).show()
                            Log.e("AddProduct", "Network failure", t)
                        }
                    })

                } catch (e: Exception) {
                    Log.e("AddProduct", "Exception during submission", e)
                    Toast.makeText(requireContext(), "Exception: ${e.message}", Toast.LENGTH_LONG)
                        .show()
                }
            }
        }
    }

    private fun String.toPlainTextRequestBody(): RequestBody =
        RequestBody.create("text/plain".toMediaType(), this)

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

    private suspend fun prepareImageFile(uri: Uri): File = withContext(Dispatchers.IO) {
        val inputStream = requireContext().contentResolver.openInputStream(uri)
        val file = File(requireContext().cacheDir, "upload_image.jpg")
        val outputStream = FileOutputStream(file)
        inputStream?.copyTo(outputStream)
        inputStream?.close()
        outputStream.close()
        return@withContext file
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