package edu.cit.campuscart.forms

import android.app.Dialog
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.os.Bundle
import android.view.Gravity
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.fragment.app.DialogFragment
import edu.cit.campuscart.R
import edu.cit.campuscart.utils.RetrofitClient
import edu.cit.campuscart.models.ChangePasswordRequest
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class ChangePassword : DialogFragment() {

    private lateinit var currentPassword: EditText
    private lateinit var newPassword: EditText
    private lateinit var confirmPassword: EditText
    private lateinit var btnSaveUserDetails: Button
    private lateinit var btnBack: Button

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        val view = inflater.inflate(R.layout.dialog_change_password_form, container, false)

        currentPassword = view.findViewById(R.id.currentPassword)
        newPassword = view.findViewById(R.id.newPassword)
        confirmPassword = view.findViewById(R.id.confirmPassword)
        btnSaveUserDetails = view.findViewById(R.id.btnSaveUserDetails)
        btnBack = view.findViewById(R.id.btnBack)

        btnSaveUserDetails.setOnClickListener {
            savePassword()
        }

        btnBack.setOnClickListener {
            dismiss()
        }

        return view
    }

    private fun savePassword() {
        val currentPwd = currentPassword.text.toString().trim()
        val newPwd = newPassword.text.toString().trim()
        val confirmPwd = confirmPassword.text.toString().trim()

        if (newPwd != confirmPwd) {
            Toast.makeText(requireContext(), "New passwords do not match!", Toast.LENGTH_SHORT).show()
            return
        }

        val sharedPreferences = requireActivity().getSharedPreferences("CampusCartPrefs", 0)
        val username = sharedPreferences.getString("loggedInUsername", null)
        val token = "Bearer ${sharedPreferences.getString("authToken", "")}"

        if (username.isNullOrEmpty() || token.isEmpty()) {
            Toast.makeText(requireContext(), "Username or token not found", Toast.LENGTH_SHORT).show()
            return
        }

        val changePasswordRequest = ChangePasswordRequest(
            currentPassword = currentPwd,
            newPassword = newPwd
        )

        RetrofitClient.instance.changePassword(token, username, changePasswordRequest)
            .enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        showSuccessToast()
                        dismiss()
                    } else {
                        showFailToast()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(requireContext(), "Error: ${t.message}", Toast.LENGTH_SHORT).show()
                }
            })
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

    private fun showSuccessToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_password_success, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }

    private fun showFailToast() {
        val toastView = layoutInflater.inflate(R.layout.dialog_password_fail, null)
        Toast(requireContext()).apply {
            view = toastView
            duration = Toast.LENGTH_SHORT
            setGravity(Gravity.TOP or Gravity.CENTER_HORIZONTAL, 0, 80)
            show()
        }
    }
}
