import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import api from '../config/axiosConfig';

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();

    const fetchConversation = async (userId1, userId2) => {
        try {
            const response = await api.get(`/messages/conversation/${userId1}/${userId2}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching conversation:', error);
        }
    };

    const sendMessage = async (receiverId, content) => {
        try {
            const messageData = {
                senderId: user.id,
                receiverId,
                content
            };
            const response = await api.post(`/messages`, messageData);
            setMessages(prev => [...prev, response.data]);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    };

    const markAsRead = async (messageId) => {
        try {
            await api.put(`/messages/${messageId}/read`);
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === messageId ? { ...msg, isRead: true } : msg
                )
            );
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    };

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const response = await api.get(`/messages/unread/count/${user.id}`);
            setUnreadCount(response.data);
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const value = {
        messages,
        unreadCount,
        sendMessage,
        fetchConversation,
        markAsRead,
        fetchUnreadCount
    };

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
}; 