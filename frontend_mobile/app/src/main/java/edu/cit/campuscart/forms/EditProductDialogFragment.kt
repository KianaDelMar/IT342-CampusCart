package edu.cit.campuscart.forms

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.net.Uri
import android.os.Bundle
import android.provider.OpenableColumns
import android.util.Log
import android.view.*
import android.widget.*
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.widget.addTextChangedListener
import androidx.fragment.app.DialogFragment
import androidx.lifecycle.MutableLiveData
import com.bumptech.glide.Glide
import com.google.gson.Gson
import edu.cit.campuscart.R
import edu.cit.campuscart.databinding.DialogEditProductBinding
import edu.cit.campuscart.models.Products
import edu.cit.campuscart.utils.RetrofitClient
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.toRequestBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.File
import java.io.FileOutputStream

class EditProductDialogFragment : DialogFragment() {

    private lateinit var selectedImageUri: Uri
    private var hasImage = false
    private lateinit var product: Products

    private val productName = MutableLiveData<String>()
    private val description = MutableLiveData<String>()
    private val quantity = MutableLiveData<String>()
    private val price = MutableLiveData<String>()
    private val category = MutableLiveData<String>()
    private val condition = MutableLiveData<String>()
    private val status = MutableLiveData<String>()

    private val imagePickerLauncher = registerForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        uri?.let {
            selectedImageUri = it
            hasImage = true
            binding.selectedImageView.setImageURI(selectedImageUri)
        }
    }

    companion object {
        private const val PRODUCT_KEY = "product_key"

        fun newInstance(product: Products): EditProductDialogFragment {
            val args = Bundle()
            args.putSerializable(PRODUCT_KEY, product)
            return EditProductDialogFragment().apply { arguments = args }
        }
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        product = arguments?.getSerializable(PRODUCT_KEY) as Products
        val dialog = super.onCreateDialog(savedInstanceState)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        return dialog
    }

    private var _binding: DialogEditProductBinding? = null
    private val binding get() = _binding!!

    override fun onStart() {
        super.onStart()
        dialog?.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.99).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
    }

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View {
        _binding = DialogEditProductBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        productName.value = product.name
        description.value = product.pdtDescription
        quantity.value = product.qtyInStock.toString()
        price.value = product.buyPrice.toString()
        category.value = product.category
        condition.value = product.conditionType
        status.value = product.status

        val categories = listOf(" ", "Electronics", "Clothes", "Food", "Accessories", "Stationery/Arts & Crafts", "Merchandise", "Beauty", "Books", "Others")
        val categoryAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, categories)
        categoryAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.dropCategory.adapter = categoryAdapter

        val conditions = listOf("New", "Used", "Others")
        val conditionAdapter = ArrayAdapter(requireContext(), android.R.layout.simple_spinner_item, conditions)
        conditionAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        binding.dropCondition.adapter = conditionAdapter

        binding.dropCategory.setSelection(getCategoryPosition(product.category))
        binding.dropCondition.setSelection(getConditionPosition(product.conditionType))

        Glide.with(this)
            .load("http://192.168.1.59:8080/" + product.imagePath) //NOTE: Local, to change when deployment
            .placeholder(R.drawable.defaultimage)
            .error(R.drawable.defaultimage)
            .into(binding.selectedImageView)

        binding.inputProductName.setText(product.name)
        binding.inputDescription.setText(product.pdtDescription)
        binding.inputQuantity.setText(product.qtyInStock.toString())
        binding.inputPrice.setText(product.buyPrice.toString())
        binding.inputStatus.setText(product.status)

        binding.inputProductName.addTextChangedListener { productName.value = it.toString() }
        binding.inputDescription.addTextChangedListener { description.value = it.toString() }
        binding.inputQuantity.addTextChangedListener { quantity.value = it.toString() }
        binding.inputPrice.addTextChangedListener { price.value = it.toString() }
        binding.inputStatus.addTextChangedListener { status.value = it.toString() }

        binding.dropCategory.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                category.value = parent.getItemAtPosition(position).toString()
            }

            override fun onNothingSelected(parent: AdapterView<*>) {}
        }

        binding.dropCondition.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                condition.value = parent.getItemAtPosition(position).toString()
            }

            override fun onNothingSelected(parent: AdapterView<*>) {}
        }

        binding.btnSelectImage.setOnClickListener {
            imagePickerLauncher.launch("image/*")
        }

        binding.btnBack.setOnClickListener { dismiss() }

        binding.btnSubmit.setOnClickListener {
            updateProduct()
        }
    }

    private fun updateProduct() {
        val loggedInUsername = requireContext()
            .getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
            .getString("loggedInUsername", "") ?: ""

        if (product.userUsername != loggedInUsername) {
            Toast.makeText(context, "You are not the creator of this product.", Toast.LENGTH_SHORT).show()
            return
        }

        val token = requireContext()
            .getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
            .getString("authToken", "") ?: ""

        if (token.isEmpty()) {
            Toast.makeText(context, "User not authenticated. Please log in again.", Toast.LENGTH_SHORT).show()
            return
        }

        val updatedProduct = Products(
            code = product.code,
            name = productName.value ?: "",
            pdtDescription = description.value ?: "",
            qtyInStock = quantity.value?.toIntOrNull() ?: 0,
            buyPrice = price.value?.toDoubleOrNull() ?: 0.0,
            category = category.value ?: "",
            conditionType = condition.value ?: "",
            status = status.value ?: "",
            userUsername = product.userUsername,
            imagePath = product.imagePath,
            userProfileImagePath = product.userProfileImagePath
        )

        val gson = Gson()
        val productJson = gson.toJson(updatedProduct)
        val productBody = productJson.toRequestBody("application/json".toMediaTypeOrNull())

        val imagePart = if (hasImage) {
            val file = createFileFromUri(selectedImageUri)
            val requestFile = file.readBytes().toRequestBody("image/*".toMediaTypeOrNull())
            MultipartBody.Part.createFormData("imagePath", file.name, requestFile)
        } else null

        val bearerToken = "Bearer $token"

        RetrofitClient.instance.putProductDetails(
            bearerToken, product.code, productBody, imagePart
        ).enqueue(object : Callback<Products> {
            override fun onResponse(call: Call<Products>, response: Response<Products>) {
                if (response.isSuccessful) {
                    showSuccessToast()
                    dismiss()
                } else {
                    Log.e("EditProduct", "Response Code: ${response.code()}")
                    Log.e("EditProduct", "Error Body: ${response.errorBody()?.string()}")
                    showFailToast()
                }
            }

            override fun onFailure(call: Call<Products>, t: Throwable) {
                Toast.makeText(context, "Network error: ${t.message}", Toast.LENGTH_SHORT).show()
            }
        })
    }

    private fun createFileFromUri(uri: Uri): File {
        val context = requireContext()
        val fileName = getFileName(uri)
        val file = File(context.cacheDir, fileName)
        context.contentResolver.openInputStream(uri)?.use { input ->
            FileOutputStream(file).use { output -> input.copyTo(output) }
        }
        return file
    }

    private fun getFileName(uri: Uri): String {
        var name = "file"
        val cursor = requireContext().contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                name = it.getString(it.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME))
            }
        }
        return name
    }

    private fun showSuccessToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_edit_success, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }

    private fun showFailToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_edit_fail, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }

    private fun getCategoryPosition(category: String?): Int {
        val categories = listOf(" ","Electronics", "Clothes", "Food", "Accessories", "Stationery/Arts & Crafts", "Merchandise", "Beauty", "Books", "Others")

        return categories.indexOf(category ?: "").takeIf { it >= 0 } ?: 0
    }

    private fun getConditionPosition(condition: String?): Int {
        val conditions = listOf("New", "Used", "Others")
        return conditions.indexOf(condition ?: "").takeIf { it >= 0 } ?: 0
    }
}