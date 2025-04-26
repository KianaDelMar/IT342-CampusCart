package edu.cit.campuscart.forms

import android.app.Dialog
import android.content.Context
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.fragment.app.DialogFragment
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Seller
import edu.cit.campuscart.utils.RetrofitClient
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class EditUserDetails : DialogFragment() {
    private lateinit var editUsername: EditText
    private lateinit var editFirstName: EditText
    private lateinit var editLastName: EditText
    private lateinit var editAddress: EditText
    private lateinit var editEmail: EditText
    private lateinit var editContactNo: EditText
    private lateinit var btnSave: Button
    private lateinit var btnBack: Button

    private var currentSeller: Seller? = null

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val view = inflater.inflate(R.layout.dialog_edit_profile_form, container, false)

        editUsername = view.findViewById(R.id.editUsername)
        editFirstName = view.findViewById(R.id.editFirstName)
        editLastName = view.findViewById(R.id.editLastName)
        editAddress = view.findViewById(R.id.editAddress)
        editEmail = view.findViewById(R.id.editEmail)
        editContactNo = view.findViewById(R.id.editContactNo)
        btnSave = view.findViewById(R.id.btnSaveUserDetails)
        btnBack = view.findViewById(R.id.btnBack)
        editUsername.isEnabled = false

        btnSave.setOnClickListener {
            saveUserDetails()
        }

        btnBack.setOnClickListener {
            dismiss()
        }

        fetchUserDetails()

        return view
    }

    private fun fetchUserDetails() {
        val sharedPref = requireActivity().getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
        val token = "Bearer ${sharedPref.getString("authToken", "")}"
        val loggedInUsername = sharedPref.getString("loggedInUsername", "") ?: ""

        RetrofitClient.instance.getUserByUsername(token, loggedInUsername)
            .enqueue(object : Callback<Seller> {
                override fun onResponse(call: Call<Seller>, response: Response<Seller>) {
                    if (response.isSuccessful) {
                        currentSeller = response.body()
                        currentSeller?.let { seller ->
                            editUsername.setText(seller.username)
                            editFirstName.setText(seller.firstName)
                            editLastName.setText(seller.lastName)
                            editAddress.setText(seller.address)
                            editEmail.setText(seller.email)
                            editContactNo.setText(seller.contactNo)
                        }
                    } else {
                        Toast.makeText(requireContext(), "Failed to load user data", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onFailure(call: Call<Seller>, t: Throwable) {
                    Toast.makeText(requireContext(), "Error: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    private fun saveUserDetails() {
        val sharedPref = requireActivity().getSharedPreferences("CampusCartPrefs", Context.MODE_PRIVATE)
        val token = "Bearer ${sharedPref.getString("authToken", "")}"
        val username = editUsername.text.toString()
        editUsername.isEnabled = false

        val updatedSeller = Seller(
            username = username,
            firstName = editFirstName.text.toString(),
            lastName = editLastName.text.toString(),
            address = editAddress.text.toString(),
            email = editEmail.text.toString(),
            contactNo = editContactNo.text.toString(),
            password = currentSeller?.password ?: "", // Keep original password
            profilePhoto = currentSeller?.profilePhoto ?: "", // Keep original profile photo
            products = null // Not editing products here
        )

        RetrofitClient.instance.updateUserDetails(token, username, updatedSeller)
            .enqueue(object : Callback<Seller> {
                override fun onResponse(call: Call<Seller>, response: Response<Seller>) {
                    if (response.isSuccessful) {
                        showSuccessToast()
                        dismiss()
                    } else {
                        showFailToast()
                    }
                }

                override fun onFailure(call: Call<Seller>, t: Throwable) {
                    Toast.makeText(requireContext(), "Error: ${t.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            })
    }

    private fun showSuccessToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_user_edit_success, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }

    private fun showFailToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_user_edit_fail, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }

    override fun onStart() {
        super.onStart()
        dialog?.window?.setLayout(
            (resources.displayMetrics.widthPixels * 0.99).toInt(),
            ViewGroup.LayoutParams.WRAP_CONTENT
        )
    }

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val dialog = super.onCreateDialog(savedInstanceState)
        dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
        return dialog
    }
}
