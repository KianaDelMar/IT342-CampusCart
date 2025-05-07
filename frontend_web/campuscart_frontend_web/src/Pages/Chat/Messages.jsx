import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Badge,
    Divider,
    TextField,
    IconButton,
    Grid,
    Card,
    CardMedia,
    CardContent
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import api from '../../config/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { styled } from '@mui/material/styles';


function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// Custom styles
const SidebarItem = styled(ListItem)(({ theme, selected }) => ({
    backgroundColor: selected ? '#FFD70022' : 'transparent',
    borderLeft: selected ? `6px solid #89343B` : '6px solid transparent',
    transition: 'background 0.2s, border 0.2s',
    '&:hover': {
        backgroundColor: '#FFD70033',
        cursor: 'pointer',
    },
    alignItems: 'flex-start',
    paddingTop: 16,
    paddingBottom: 16,
}));

const MessageBubble = styled(Paper)(({ theme, isSender }) => ({
    padding: theme.spacing(1.5, 2),
    maxWidth: '70%',
    borderRadius: 16,
    backgroundColor: isSender ? '#89343B' : '#f5f5f5',
    color: isSender ? '#fff' : '#222',
    boxShadow: '0 2px 8px rgba(137,52,59,0.08)',
    marginBottom: 2,
    wordBreak: 'break-word',
    borderTopRightRadius: isSender ? 4 : 16,
    borderTopLeftRadius: isSender ? 16 : 4,
}));

const Timestamp = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: '#aaa',
    marginTop: 4,
    textAlign: 'right',
}));

const InputContainer = styled(Box)(({ theme }) => ({
    borderTop: '1px solid #eee',
    background: '#fff',
    padding: theme.spacing(2, 2, 2, 2),
    boxShadow: '0 -2px 8px rgba(137,52,59,0.04)',
}));

const SendButton = styled(IconButton)(({ theme }) => ({
    backgroundColor: '#FFD700',
    color: '#89343B',
    '&:hover': {
        backgroundColor: '#FFD700cc',
    },
    borderRadius: 8,
    padding: 10,
}));

const Messages = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [unreadCounts, setUnreadCounts] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const currentUser = sessionStorage.getItem('username');

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        fetchConversations();
        fetchUnreadCounts();

        // Auto-select conversation if product and seller are in URL
        const productCode = query.get('product');
        const seller = query.get('seller');
        if (productCode && seller) {
            fetchConversation(currentUser, seller, productCode);
        }
    }, [currentUser, location.search]);

    const fetchConversations = async () => {
        try {
            const response = await api.get(`/messages/conversations/${currentUser}`);
            setConversations(response.data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchUnreadCounts = async () => {
        try {
            const response = await api.get(`/messages/unread/count/${currentUser}`);
            setUnreadCounts(response.data);
        } catch (error) {
            console.error('Error fetching unread counts:', error);
        }
    };

    const markMessagesAsRead = async (msgs) => {
        const unread = msgs.filter(
            (msg) => msg.receiverId === currentUser && !msg.read
        );
        await Promise.all(
            unread.map((msg) => api.put(`/messages/${msg.id}/read`))
        );
        // Refresh conversations to update unread counts
        fetchConversations();
    };

    const fetchConversation = async (username1, username2, productCode = null) => {
        try {
            console.log('Fetching conversation:', username1, username2, productCode);
            const endpoint = productCode 
                ? `/messages/conversation/${username1}/${username2}/product/${productCode}`
                : `/messages/conversation/${username1}/${username2}`;
            const response = await api.get(endpoint);
            console.log('Fetched messages:', response.data);
            setMessages(response.data);
            setSelectedConversation({ username1, username2, productCode });
            // Mark as read
            markMessagesAsRead(response.data);
        } catch (error) {
            console.error('Error fetching conversation:', error);
            toast.error('Failed to load conversation');
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        try {
            const messageData = {
                senderId: currentUser,
                receiverId: selectedConversation.username1 === currentUser 
                    ? selectedConversation.username2 
                    : selectedConversation.username1,
                content: newMessage.trim(),
                productCode: selectedConversation.productCode
            };

            const response = await api.post('/messages', messageData);
            console.log("Sending message");
            setMessages(prev => [...prev, response.data]);
            setNewMessage('');
            fetchUnreadCounts();
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Container maxWidth="xl" sx={{ height: 'calc(100vh - 64px)', mt: 2 }}>
            <Paper sx={{ display: 'flex', height: '85vh', borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 24px rgba(137,52,59,0.08)', maxWidth: 1400, mx: 'auto' }}>
                {/* Conversations List */}
                <Box sx={{ width: 400, borderRight: 1, borderColor: 'divider', overflow: 'auto', bgcolor: '#fff8f6' }}>
                    <Typography variant="h6" sx={{ p: 3, borderBottom: 1, borderColor: 'divider', color: '#89343B', fontWeight: 700, letterSpacing: 1 }}>
                        Conversations
                    </Typography>
                    <List sx={{ p: 0 }}>
                        {conversations.map((conv, idx) => (
                            <SidebarItem
                                key={conv.otherUsername + '-' + (conv.productCode || 'all')}
                                selected={
                                    selectedConversation &&
                                    selectedConversation.username1 === currentUser &&
                                    selectedConversation.username2 === conv.otherUsername &&
                                    selectedConversation.productCode === conv.productCode
                                }
                                onClick={() => {
                                    fetchConversation(currentUser, conv.otherUsername, conv.productCode);
                                }}
                                alignItems="flex-start"
                            >
                                <ListItemAvatar>
                                    <Badge
                                        badgeContent={conv.unreadCount || 0}
                                        color="error"
                                        sx={{ mr: 1 }}
                                    >
                                        <Avatar src={conv.productImage || undefined} sx={{ bgcolor: '#89343B' }}>
                                            {conv.otherUsername[0]?.toUpperCase()}
                                        </Avatar>
                                    </Badge>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<>
                                        <span style={{ fontWeight: 600, color: '#89343B' }}>{conv.otherUsername}</span>
                                    </>}
                                    secondary={<span style={{ color: '#555', fontSize: '0.95em' }}>{conv.lastMessage}</span>}
                                />
                                <Box sx={{ minWidth: 60, textAlign: 'right', color: '#aaa', fontSize: '0.8em', pt: 0.5 }}>
                                    {/* Optionally add last message time here if available */}
                                </Box>
                            </SidebarItem>
                        ))}
                    </List>
                </Box>

                {/* Chat Area */}
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: '#fff' }}>
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider', bgcolor: '#fff8f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                {/* Left: Avatar and Username */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ bgcolor: '#89343B', width: 56, height: 56, fontWeight: 700, fontSize: 28 }}>
                                        {selectedConversation.username1 === currentUser
                                            ? selectedConversation.username2[0]?.toUpperCase()
                                            : selectedConversation.username1[0]?.toUpperCase()}
                                    </Avatar>
                                    <Typography variant="h6" sx={{ color: '#89343B', fontWeight: 700 }}>
                                        {selectedConversation.username1 === currentUser
                                            ? selectedConversation.username2
                                            : selectedConversation.username1}
                                    </Typography>
                                </Box>
                                {/* Right: Product image and name */}
                                {selectedConversation.productCode && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                borderRadius: 3,
                                                bgcolor: '#eee',
                                                boxShadow: '0 2px 12px rgba(137,52,59,0.10)',
                                                border: '2px solid #FFD700',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden',
                                            }}
                                        >
                                            {messages[0]?.productImage ? (
                                                <img
                                                    src={messages[0]?.productImage}
                                                    alt={messages[0]?.productName}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            ) : (
                                                <span role="img" aria-label="product" style={{ fontSize: 48, color: '#FFD700' }}>📦</span>
                                            )}
                                        </Box>
                                        <Typography variant="h5" sx={{ color: '#FFD700', fontWeight: 700 }}>
                                            {messages[0]?.productName}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>

                            {/* Messages */}
                            <Box sx={{ flex: 1, overflowY: 'auto', p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {messages.length === 0 ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No messages yet.
                                    </Typography>
                                ) : (
                                    messages.map((message) => (
                                        <Box
                                            key={message.id}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: message.senderId === currentUser ? 'flex-end' : 'flex-start',
                                                alignItems: 'flex-end',
                                            }}
                                        >
                                            <MessageBubble elevation={0} isSender={message.senderId === currentUser}>
                                                <Typography variant="body1" sx={{ fontSize: '1.08em', fontWeight: 500 }}>
                                                    {message.content}
                                                </Typography>
                                                <Timestamp>
                                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                </Timestamp>
                                            </MessageBubble>
                                        </Box>
                                    ))
                                )}
                            </Box>

                            {/* Message Input */}
                            <InputContainer sx={{ px: 3, py: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        maxRows={6}
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage();
                                            }
                                        }}
                                        placeholder="Type a message..."
                                        variant="outlined"
                                        size="medium"
                                        InputProps={{
                                            style: {
                                                fontSize: 20,
                                                padding: '18px 16px',
                                            },
                                        }}
                                        sx={{
                                            background: '#fff',
                                            borderRadius: 2,
                                            fontSize: 20,
                                            mr: 2,
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': {
                                                    borderColor: '#FFD700',
                                                },
                                                '&:hover fieldset': {
                                                    borderColor: '#89343B',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: '#89343B',
                                                },
                                            },
                                        }}
                                    />
                                    <SendButton
                                        color="primary"
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        sx={{ width: 56, height: 56 }}
                                    >
                                        <SendIcon sx={{ fontSize: 32 }} />
                                    </SendButton>
                                </Box>
                            </InputContainer>
                        </>
                    ) : (
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '100%',
                            bgcolor: '#fff8f6',
                        }}>
                            <Typography variant="h6" color="#89343B" fontWeight={600}>
                                Select a conversation to start messaging
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Messages; 