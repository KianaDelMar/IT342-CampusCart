package edu.cit.campuscart

import edu.cit.campuscart.models.Seller
import edu.cit.campuscart.utils.RetrofitClient
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : BaseActivity() {
    private lateinit var username: EditText
    private lateinit var firstname: EditText
    private lateinit var lastname: EditText
    private lateinit var address: EditText
    private lateinit var contactno: EditText
    private lateinit var email: EditText
    private lateinit var password: EditText
    private lateinit var registerBtn: Button
    private lateinit var registerTxt: TextView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Initialize UI Elements
        username = findViewById(R.id.username)
        firstname = findViewById(R.id.firstname)
        lastname = findViewById(R.id.lastname)
        address = findViewById(R.id.address)
        contactno = findViewById(R.id.contactno)
        email = findViewById(R.id.email)
        password = findViewById(R.id.password)
        registerBtn = findViewById(R.id.registerBtn)
        registerTxt = findViewById(R.id.loginText2)

        // Handle register button click
        registerBtn.setOnClickListener {
            registerSeller()
        }

        // Navigate to Login (MainActivity)
        registerTxt.setOnClickListener {
            startActivity(Intent(this, MainActivity::class.java))
        }
    }
    private var selectedPhoto: String? = null

    private fun registerSeller() {
        val usernameInput = username.text.toString().trim()
        val firstNameInput = firstname.text.toString().trim()
        val lastNameInput = lastname.text.toString().trim()
        val addressInput = address.text.toString().trim()
        val contactNoInput = contactno.text.toString().trim()
        val emailInput = email.text.toString().trim()
        val passwordInput = password.text.toString().trim()

        // Validation: Contact number must be exactly 11 digits
        if (contactNoInput.length != 11 || !contactNoInput.all { it.isDigit() }) {
            Toast.makeText(this, "Contact Number must be exactly 11 digits", Toast.LENGTH_LONG).show()
            return
        }

        // Validation: Password must be at least 8 characters
        if (passwordInput.length < 8) {
            Toast.makeText(this, "Password must be at least 8 characters long", Toast.LENGTH_LONG).show()
            return
        }

        val profilePhoto = selectedPhoto ?: "defaultphoto.jpg"

        val seller = Seller(
            username = usernameInput,
            firstName = firstNameInput,
            lastName = lastNameInput,
            address = addressInput,
            contactNo = contactNoInput,
            email = emailInput,
            password = passwordInput,
            profilePhoto = profilePhoto
        )

        showLoadingOverlay()
        RetrofitClient.instance.registerSeller(seller)
            .enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    hideLoadingOverlay()
                    if (response.isSuccessful) {
                        Toast.makeText(applicationContext, "Registration Successful!", Toast.LENGTH_LONG).show()
                        startActivity(Intent(this@RegisterActivity, MainActivity::class.java))
                    } else {
                        Toast.makeText(applicationContext, "Registration Failed!", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    hideLoadingOverlay()
                    Toast.makeText(applicationContext, "Error: ${t.message}", Toast.LENGTH_LONG).show()
                }
            })
    }
}
