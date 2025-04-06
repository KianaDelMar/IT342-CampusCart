import React from 'react';
import { Snackbar, Alert } from '@mui/material';

const ToastManager = ({ toasts, handleClose }) => {
  // Only show the latest 2 toasts that are open
  const visibleToasts = toasts
    .filter(toast => toast.open)
    .slice(0, 2);

  return visibleToasts.map((toast, index) => (
    <Snackbar
      key={toast.id}
      open={toast.open}
      autoHideDuration={3000}
      onClose={() => handleClose(toast.id)}
      anchorOrigin={{ 
        vertical: 'bottom', 
        horizontal: 'right' 
      }}
      sx={{ 
        bottom: `${(index * 60) + 16}px !important`,
        zIndex: 2000 - index
      }}
    >
      <Alert 
        severity={toast.severity} 
        sx={{ 
          width: '100%',
          '& .MuiAlert-action': { display: 'none' }
        }}
      >
        {toast.message}
      </Alert>
    </Snackbar>
  ));
};

export default ToastManager;
