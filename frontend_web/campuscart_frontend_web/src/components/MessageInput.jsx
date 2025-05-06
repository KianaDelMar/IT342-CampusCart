import React, { useState } from 'react';
import { useMessage } from '../contexts/MessageContext';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const MessageInput = ({ receiverId }) => {
    const [message, setMessage] = useState('');
    const { sendMessage } = useMessage();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            await sendMessage(receiverId, message.trim());
            setMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                display: 'flex',
                gap: 1,
                alignItems: 'center'
            }}
        >
            <TextField
                fullWidth
                size="small"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                variant="outlined"
            />
            <IconButton
                type="submit"
                color="primary"
                disabled={!message.trim()}
                sx={{ ml: 1 }}
            >
                <SendIcon />
            </IconButton>
        </Box>
    );
};

export default MessageInput; 