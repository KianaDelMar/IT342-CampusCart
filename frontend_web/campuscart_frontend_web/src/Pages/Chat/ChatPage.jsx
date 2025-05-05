import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Paper, CircularProgress, Avatar } from '@mui/material';
import { connectUser, createChannel, getChannel, sendMessage, getMessages, getChannels, getChannelByUrl } from '../../config/sendbirdConfig';
import { useAuth } from '../../contexts/AuthContext';
import sb from '../../config/sendbirdConfig';

const ChatPage = () => {
    const { username } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatPartners, setChatPartners] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(username || null);
    const [selectedChannelUrl, setSelectedChannelUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [channel, setChannel] = useState(null);
    const messagesEndRef = useRef(null);

    // Connect and load channels on mount or when user/selectedPartner changes
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Prevent self-chat
        if (selectedPartner && user.username === selectedPartner) {
            setMessages([]);
            setChannel(null);
            setLoading(false);
            return;
        }

        const initializeChat = async () => {
            try {
                await connectUser(user.username, user.username);
                const channels = await getChannels(user.username);
                // Build partners list with channelUrl
                const partners = channels
                    .map(channel => {
                        const otherUser = channel.members.find(member => member.userId !== user.username);
                        if (!otherUser) return null;
                        return {
                            username: otherUser.userId,
                            lastMessage: channel.lastMessage?.message || 'No messages yet',
                            unreadCount: channel.unreadMessageCount || 0,
                            channelUrl: channel.url
                        };
                    })
                    .filter(Boolean);
                setChatPartners(partners);

                // If a partner is selected (from URL or click), load that channel/messages
                let partnerToSelect = selectedPartner;
                let channelUrlToSelect = selectedChannelUrl;
                if (!partnerToSelect && partners.length > 0) {
                    partnerToSelect = partners[0].username;
                    channelUrlToSelect = partners[0].channelUrl;
                    setSelectedPartner(partnerToSelect);
                    setSelectedChannelUrl(channelUrlToSelect);
                } else if (partnerToSelect) {
                    const found = partners.find(p => p.username === partnerToSelect);
                    if (found) {
                        channelUrlToSelect = found.channelUrl;
                        setSelectedChannelUrl(channelUrlToSelect);
                    }
                }

                if (partnerToSelect && user.username !== partnerToSelect) {
                    console.log('Attempting to create channel:', user.username, partnerToSelect);
                    let existingChannel = null;
                    if (channelUrlToSelect) {
                        existingChannel = await getChannelByUrl(channelUrlToSelect);
                    }
                    if (!existingChannel) {
                        // No channel exists, so create one
                        existingChannel = await createChannel(user.username, partnerToSelect);
                        setSelectedChannelUrl(existingChannel?.url);
                    }
                    setChannel(existingChannel);
                    const channelMessages = await getMessages(existingChannel);
                    setMessages(channelMessages);
                    if (typeof existingChannel.markAsRead === 'function') {
                        existingChannel.markAsRead();
                    }
                } else {
                    setMessages([]);
                }
                setLoading(false);
            } catch (error) {
                console.error('Error initializing chat:', error);
                setLoading(false);
            }
        };
        initializeChat();
        // eslint-disable-next-line
    }, [user, selectedPartner]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time message handler
    useEffect(() => {
        if (!user) return;
        const handler = {
            onMessageReceived: (channel, message) => {
                console.log('New message received:', message);
                setMessages(prev => [...prev, message]);
            }
        };
        sb.addChannelHandler('UNIQUE_HANDLER_ID', handler);
        return () => {
            sb.removeChannelHandler('UNIQUE_HANDLER_ID');
        };
    }, [channel]);

    // Send message
    const handleSendMessage = async () => {
        console.log('Send button clicked', { newMessage, channel });
        if (!newMessage.trim() || !channel) {
            console.log('Cannot send: message or channel missing');
            return;
        }
        try {
            const sentMsg = await sendMessage(channel, newMessage);
            setMessages(prev => [...prev, sentMsg]);
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Select a partner from the sidebar
    const handlePartnerSelect = async (partner) => {
        // Prevent self-chat
        if (user.username === partner.username) {
            setSelectedPartner(null);
            setSelectedChannelUrl(null);
            setChannel(null);
            setMessages([]);
            return;
        }
        setSelectedPartner(partner.username);
        setSelectedChannelUrl(partner.channelUrl);
        setChatPartners(prev =>
            prev.map(p =>
                p.username === partner.username
                    ? { ...p, unreadCount: 0 }
                    : p
            )
        );
        try {
            await connectUser(user.username, user.username);
            let existingChannel = null;
            if (partner.channelUrl) {
                existingChannel = await getChannelByUrl(partner.channelUrl);
            }
            if (!existingChannel) {
                existingChannel = await createChannel(user.username, partner.username);
                setSelectedChannelUrl(existingChannel.url);
            }
            setChannel(existingChannel);
            const channelMessages = await getMessages(existingChannel);
            setMessages(channelMessages);
            if (typeof existingChannel.markAsRead === 'function') {
                existingChannel.markAsRead();
            }
        } catch (error) {
            console.error('Error selecting partner/channel:', error);
            setMessages([]);
        }
    };

    useEffect(() => {
        if (!user) return;
        const interval = setInterval(async () => {
            const channels = await getChannels(user.username);
            const partners = channels
                .map(channel => {
                    const otherUser = channel.members.find(member => member.userId !== user.username);
                    if (!otherUser) return null;
                    return {
                        username: otherUser.userId,
                        lastMessage: channel.lastMessage?.message || 'No messages yet',
                        unreadCount: channel.unreadMessageCount || 0,
                        channelUrl: channel.url
                    };
                })
                .filter(Boolean);
            setChatPartners(partners);
        }, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, [user]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
            {/* Chat Partners List */}
            <Box sx={{ width: 300, borderRight: 1, borderColor: 'divider', p: 2, overflow: 'auto' }}>
                <Typography variant="h6" gutterBottom>
                    Conversations
                </Typography>
                <List>
                    {chatPartners.map((partner) => (
                        <ListItem
                            button
                            key={partner.username}
                            selected={selectedPartner === partner.username}
                            onClick={() => handlePartnerSelect(partner)}
                            sx={{
                                mb: 1,
                                borderRadius: 1,
                                '&.Mui-selected': {
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                },
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    bgcolor: 'primary.main',
                                }}
                            >
                                {partner.username.charAt(0).toUpperCase()}
                            </Avatar>
                            <ListItemText
                                primary={partner.username}
                                secondary={partner.lastMessage}
                                primaryTypographyProps={{
                                    fontWeight: selectedPartner === partner.username ? 'bold' : 'normal',
                                }}
                                secondaryTypographyProps={{
                                    color: selectedPartner === partner.username ? 'white' : 'text.secondary',
                                    noWrap: true,
                                }}
                            />
                            {partner.unreadCount > 0 && (
                                <Box
                                    sx={{
                                        bgcolor: 'error.main',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: 20,
                                        height: 20,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.75rem',
                                    }}
                                >
                                    {partner.unreadCount}
                                </Box>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Box>

            {/* Chat Area */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedPartner ? (
                    <>
                        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
                            <Avatar
                                sx={{
                                    width: 40,
                                    height: 40,
                                    mr: 2,
                                    bgcolor: 'primary.main',
                                }}
                            >
                                {selectedPartner.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography variant="h6">
                                Chat with {selectedPartner}
                            </Typography>
                        </Box>

                        {/* Messages */}
                        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                            {messages.map((message, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: message.sender.userId === user.username ? 'flex-end' : 'flex-start',
                                        mb: 2
                                    }}
                                >
                                    <Paper
                                        sx={{
                                            p: 2,
                                            maxWidth: '70%',
                                            bgcolor: message.sender.userId === user.username ? 'primary.main' : 'grey.100',
                                            color: message.sender.userId === user.username ? 'white' : 'text.primary'
                                        }}
                                    >
                                        <Typography variant="body1">{message.message}</Typography>
                                        <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                                            {new Date(message.createdAt).toLocaleString()}
                                        </Typography>
                                    </Paper>
                                </Box>
                            ))}
                            <div ref={messagesEndRef} />
                        </Box>

                        {/* Message Input */}
                        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                >
                                    Send
                                </Button>
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 3
                    }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Select a conversation to start chatting
                        </Typography>
                        <Typography variant="body1" color="text.secondary" align="center">
                            Click on a conversation from the list on the left to view and send messages
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ChatPage;
