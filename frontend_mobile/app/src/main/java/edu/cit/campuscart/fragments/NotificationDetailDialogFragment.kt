package edu.cit.campuscart.fragments

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import edu.cit.campuscart.R
import edu.cit.campuscart.models.Notification

class NotificationDialogFragment(
    private val notification: Notification,
    private val onDelete: () -> Unit
) : DialogFragment() {

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val view = LayoutInflater.from(context).inflate(R.layout.dialog_notification_detail, null)

        view.findViewById<TextView>(R.id.messageText).text = notification.message
        view.findViewById<TextView>(R.id.dateText).text = notification.timestamp


        view.findViewById<Button>(R.id.btnDeleteNotif).setOnClickListener {
            dismiss()
            onDelete()
        }

        return AlertDialog.Builder(requireContext())
            .setView(view)
            .create()
    }
}