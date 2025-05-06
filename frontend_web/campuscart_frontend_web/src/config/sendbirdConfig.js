import SendBird from 'sendbird';

const APP_ID = process.env.REACT_APP_SENDBIRD_APP_ID;


const sb = new SendBird({
    appId: APP_ID
});

export const connectUser = async (userId, nickname) => {
    try {
        const user = await sb.connect(userId);
        console.log('Successfully connected to SendBird:', user);
        console.log('Application ID: ', APP_ID); 
        await sb.updateCurrentUserInfo(nickname, null);
        return user;
    } catch (error) {
        console.error('Error connecting to SendBird:', error);
        throw error;
    }
};

export const createChannel = async (userId, otherUserId) => {
    if (userId === otherUserId) {
        console.warn('Attempted to create a channel with the same user as both members. Aborting.');
        return null;
    }
    try {
        const sortedUserIds = [userId, otherUserId].sort();
        console.log('Creating channel with users:', sortedUserIds);
        
        // First check if a channel already exists
        const existingChannel = await getChannel(userId, otherUserId);
        if (existingChannel) {
            console.log('Channel already exists:', existingChannel.url);
            return existingChannel;
        }

        const params = new sb.GroupChannelParams();
        params.isDistinct = true;
        params.userIds = sortedUserIds;
        params.name = `Chat between ${sortedUserIds[0]} and ${sortedUserIds[1]}`;
        
        console.log('Channel parameters:', {
            isDistinct: params.isDistinct,
            userIds: params.userIds,
            name: params.name
        });

        const channel = await sb.GroupChannel.createChannel(params);
        console.log('Channel created successfully:', {
            url: channel.url,
            name: channel.name,
            memberCount: channel.memberCount,
            members: channel.members.map(m => ({ userId: m.userId, nickname: m.nickname }))
        });
        return channel;
    } catch (error) {
        console.error('Error creating channel:', {
            error,
            code: error.code,
            message: error.message,
            userId,
            otherUserId
        });
        
        // Handle specific error cases
        if (error.code === 400201) {
            console.error('Invalid user ID provided');
        } else if (error.code === 400202) {
            console.error('User not found');
        } else if (error.code === 400203) {
            console.error('User is not connected');
        } else if (error.code === 400204) {
            console.error('Channel already exists');
        }
        
        throw error;
    }
};

export const getChannel = async (userId, otherUserId) => {
    try {
        console.log('Getting channel for users:', { userId, otherUserId });
        
        const query = sb.GroupChannel.createMyGroupChannelListQuery();
        query.includeEmpty = true;
        query.limit = 100; // Increase limit to ensure we find the channel
        
        console.log('Fetching channels...');
        const channels = await query.next();
        
        console.log('Found channels:', channels.map(c => ({
            url: c.url,
            isDistinct: c.isDistinct,
            memberCount: c.memberCount,
            members: c.members.map(m => m.userId)
        })));
        
        const sortedUserIds = [userId, otherUserId].sort();
        const found = channels.find(channel => {
            if (!channel.isDistinct) return false;
            if (channel.memberCount !== 2) return false;
            const memberIds = channel.members.map(m => m.userId).sort();
            return memberIds[0] === sortedUserIds[0] && memberIds[1] === sortedUserIds[1];
        });
        
        if (found) {
            console.log('Found existing channel:', {
                url: found.url,
                name: found.name,
                members: found.members.map(m => m.userId)
            });
        } else {
            console.log('No existing channel found for these users');
        }
        
        return found || null;
    } catch (error) {
        console.error('Error getting channel:', {
            error,
            code: error.code,
            message: error.message,
            userId,
            otherUserId
        });
        throw error;
    }
};

export const getChannelByUrl = async (channelUrl) => {
    return new Promise((resolve, reject) => {
        sb.GroupChannel.getChannel(channelUrl, (channel, error) => {
            if (error) {
                reject(error);
            } else {
                resolve(channel);
            }
        });
    });
};

export const sendMessage = (channel, message) => {
    return new Promise((resolve, reject) => {
        if (!channel) {
            reject(new Error('Channel is not defined'));
            return;
        }
        channel.sendUserMessage(message, (msg, error) => {
            if (error) {
                console.error('Error sending message:', error, error.code, error.message);
                reject(error);
            } else {
                console.log('Message sent successfully:', msg);
                resolve(msg);
            }
        });
    });
};

export const getMessages = async (channel, limit = 50) => {
    try {
        const messageQuery = channel.createPreviousMessageListQuery();
        messageQuery.limit = limit;
        const messages = await messageQuery.load();
        return messages;
    } catch (error) {
        console.error('Error getting messages:', error);
        throw error;
    }
};

export const getChannels = async (userId) => {
    try {
        const query = sb.GroupChannel.createMyGroupChannelListQuery();
        query.includeEmpty = true;
        const channels = await query.next();
        return channels;
    } catch (error) {
        console.error('Error getting channels:', error);
        throw error;
    }
};

export default sb; 