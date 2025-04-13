package edu.cit.campuscart.notifdialogs

import android.app.Dialog
import android.os.Bundle
import android.view.LayoutInflater
import android.widget.Button
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.DialogFragment
import edu.cit.campuscart.R

class DeleteConfirmationDialog(
    private val onConfirm: () -> Unit
) : DialogFragment() {

    override fun onCreateDialog(savedInstanceState: Bundle?): Dialog {
        val view = LayoutInflater.from(context).inflate(R.layout.dialog_delete_window, null)

        val builder = AlertDialog.Builder(requireContext())
            .setView(view)

        val dialog = builder.create()

        view.findViewById<Button>(R.id.btnCancel).setOnClickListener {
            dialog.dismiss()
        }

        view.findViewById<Button>(R.id.btnConfirm).setOnClickListener {
            onConfirm()
            dialog.dismiss()
        }

        return dialog
    }
}

/*Usage

val dialog = DeleteConfirmationDialog {
    // Handle delete logic here
    deleteProduct(productId)
}
dialog.show(parentFragmentManager, "DeleteConfirmationDialog")

*/

