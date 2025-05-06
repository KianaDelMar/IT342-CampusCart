package edu.cit.campuscart

import android.app.Application
import com.sendbird.android.SendbirdChat
import com.sendbird.android.exception.SendbirdException
import com.sendbird.android.handler.InitResultHandler
import com.sendbird.android.params.InitParams
import com.sendbird.android.params.UserUpdateParams

class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()

        val app_id = "161770D1-ABAA-4CB5-8D2A-31B39251E992" // Replace with actual App ID
        val sharedPref = getSharedPreferences("CampusCartPrefs", MODE_PRIVATE)
        val username = sharedPref.getString("loggedInUsername", "") ?: ""

        val initParams = InitParams(app_id, this, true)

        SendbirdChat.init(initParams, object : InitResultHandler {
            override fun onInitSucceed() {
                connectUser(username)
            }

            override fun onInitFailed(e: SendbirdException) {
                e.printStackTrace()
            }

            override fun onMigrationStarted() {
                // Optional: Notify user or log that migration has started
                println("Sendbird: Migration started.")
            }
        })
    }

    private fun connectUser(username: String) {
        SendbirdChat.connect(username) { user, e ->
            if (e == null) {
                val params = UserUpdateParams().apply {
                    nickname = username
                }
                SendbirdChat.updateCurrentUserInfo(params) { updateError ->
                    updateError?.printStackTrace()
                }
            } else {
                e.printStackTrace()
            }
        }
    }
}
