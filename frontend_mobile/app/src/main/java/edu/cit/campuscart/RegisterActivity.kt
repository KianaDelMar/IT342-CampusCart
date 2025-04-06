package edu.cit.campuscart

import edu.cit.campuscart.models.Seller
import edu.cit.campuscart.utils.RetrofitClient
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response

class RegisterActivity : AppCompatActivity() {
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
        // Check if the user has uploaded a profile photo
        val profilePhoto = selectedPhoto ?: "defaultphoto.jpg"  // If no photo selected, use "defaultphoto.jpg"

        val seller = Seller(
            username = username.text.toString(),
            firstName = firstname.text.toString(),
            lastName = lastname.text.toString(),
            address = address.text.toString(),
            contactNo = contactno.text.toString(),
            email = email.text.toString(),
            password = password.text.toString(),
            profilePhoto = profilePhoto // Use the determined profile photo
        )
        RetrofitClient.instance.registerSeller(seller)
            .enqueue(object : Callback<Void> {
                override fun onResponse(call: Call<Void>, response: Response<Void>) {
                    if (response.isSuccessful) {
                        Toast.makeText(applicationContext, "Registration Successful!", Toast.LENGTH_LONG).show()
                        startActivity(Intent(this@RegisterActivity, MainActivity::class.java))
                    } else {
                        Toast.makeText(applicationContext, "Registration Failed!", Toast.LENGTH_LONG).show()
                    }
                }

                override fun onFailure(call: Call<Void>, t: Throwable) {
                    Toast.makeText(applicationContext, "Error: ${t.message}", Toast.LENGTH_LONG).show()
                }
            })
    }
}
