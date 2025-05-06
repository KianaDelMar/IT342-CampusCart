import React, { useEffect } from 'react';
import { useMessage } from '../contexts/MessageContext';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { Box, Typography, Paper } from '@mui/material';

const MessageList = ({ selectedUserId }) => {
    const { messages, fetchConversation, markAsRead } = useMessage();
    const { user } = useAuth();

    useEffect(() => {
        if (selectedUserId && user) {
            fetchConversation(user.id, selectedUserId);
        }
    }, [selectedUserId, user]);

    useEffect(() => {
        messages.forEach(message => {
            if (!message.isRead && message.receiverId === user?.id) {
                markAsRead(message.id);
            }
        });
    }, [messages]);

    return (
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.map(message => (
                <Box
                    key={message.id}
                    sx={{
                        display: 'flex',
                        justifyContent: message.senderId === user?.id ? 'flex-end' : 'flex-start',
                        width: '100%'
                    }}
                >
                    <Paper
                        elevation={1}
                        sx={{
                            maxWidth: '70%',
                            p: 2,
                            bgcolor: message.senderId === user?.id ? 'primary.light' : 'grey.100',
                            color: message.senderId === user?.id ? 'white' : 'text.primary'
                        }}
                    >
                        <Typography variant="body1">{message.content}</Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                mt: 1,
                                color: message.senderId === user?.id ? 'white' : 'text.secondary'
                            }}
                        >
                            {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                        </Typography>
                    </Paper>
                </Box>
            ))}
        </Box>
    );
};

export default MessageList; 