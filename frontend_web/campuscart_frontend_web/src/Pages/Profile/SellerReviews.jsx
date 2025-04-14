import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider } from '@mui/material';
import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

export const mockReviews = [
  {
    id: 1,
    username: 'anadia',
    imageUrl: 'user1-image.jpg',
    productQuality: 4,
    sellerService: 5,
    feedback: 'Nindot kaayo ang calculator! Dali ra gamiton sa akong math homework. Thanks!',
    anonymous: false,
    date: '12/27/2022',
    time: '10:30 AM', 
  },
  {
    id: 2,
    username: 'Anonymous',
    imageUrl: 'user2-image.jpg',
    productQuality: 3,
    sellerService: 2,
    feedback: 'Medyo damaged ang scientific calculator pagabot. Pero okay ra man gihapon sya gamiton.',
    anonymous: true,
    date: '12/27/2022',
    time: '10:30 AM',
  },
  {
    id: 3,
    username: 'sarah_dev',
    imageUrl: 'user3-image.jpg',
    productQuality: 5,
    sellerService: 5,
    feedback: 'Super nice kaayo ang laptop sleeve! Perfect kaayo sa akong MacBook. Worth it jud!',
    anonymous: false,
    date: '12/29/2022',
    time: '3:45 PM',
  },
  {
    id: 4,
    username: 'tech_enthusiast',
    imageUrl: 'user4-image.jpg',
    productQuality: 5,
    sellerService: 4,
    feedback: 'The wireless mouse is perfect for school! Dali ra i-connect and nice kaayo ang RGB.',
    anonymous: false,
    date: '01/02/2023',
    time: '11:20 AM',
  },
  {
    id: 5,
    username: 'Anonymous',
    imageUrl: 'user5-image.jpg',
    productQuality: 2,
    sellerService: 3,
    feedback: 'Ang mechanical pencil dali ra maguba. Sayang akong kwarta uy.',
    anonymous: true,
    date: '01/05/2023',
    time: '9:15 AM',
  },
  {
    id: 6,
    username: 'code_master',
    imageUrl: 'user6-image.jpg',
    productQuality: 4,
    sellerService: 5,
    feedback: 'Fast shipping! Nindot kaayo ang quality sa USB flash drive. Perfect for my school files.',
    anonymous: false,
    date: '01/08/2023',
    time: '2:30 PM',
  }
];

const SellerReviews = () => {
  const averageRating = mockReviews.reduce((sum, review) => sum + review.productQuality, 0) / mockReviews.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = mockReviews.filter((review) => Math.floor(review.productQuality) === rating).length;
    const percentage = (count / mockReviews.length) * 100;
    console.log(`Rating ${rating}: ${count} reviews, ${percentage}%`);
    return {
      rating,
      count,
      percentage
    };
  });

  return (
    <Paper elevation={1} sx={{ padding: 3, marginTop: 2, borderRadius: '16px' }}>
      <Typography variant="h6" gutterBottom>
        All Reviews ({mockReviews.length})
      </Typography>
      
      <Box display="flex" alignItems="center" mb={4}>
        <Typography variant="h3" color="textPrimary" sx={{ marginRight: 1, marginLeft: 10, fontWeight: 'bold'}}>
          {averageRating.toFixed(1)}
        </Typography>
        <StarIcon color="warning" sx={{ fontSize: '2rem',  color: '#FFD700'}} />
      
        {/* Rating Distribution Bar */}
        <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, ml: 8 }}>
          {ratingDistribution.map((dist, index) => (
            <Box key={5 - index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" sx={{ width: 20 }}>
                {5 - index}
              </Typography>
              <Box sx={{ flex: 1, mx: 1, position: 'relative' }}>
                <Box
                  sx={{
                    width: '100%',
                    height: 6,
                    backgroundColor: '#f0f0f0',
                    borderRadius: 3,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: `${dist.percentage}%`,
                    height: 6,
                    backgroundColor: '#FFD700',
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ minWidth: 40 }}>
                {dist.percentage.toFixed(0)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Reviews List */}
      <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
        {mockReviews.map((item, index) => (
          <React.Fragment key={item.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Avatar 
                  src={item.imageUrl} 
                  sx={{ 
                    bgcolor: item.anonymous ? '#9e9e9e' : '#673ab7',
                    width: 40,
                    height: 40
                  }}
                >
                  {!item.imageUrl && item.username.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0}}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ margin: 0, padding: 0, color: 'black'}}>
                      {item.anonymous ? 'Anonymous User' : item.username}
                    </Typography>

                    <Box display="flex" sx={{ margin: 0, padding: 0, gap: 2}}>
                      <Rating
                        value={item.productQuality}
                        readOnly
                        size="small"
                        sx={{
                          color: '#FFD700',
                          '& .MuiRating-icon': { color: '#FFD700' },
                          margin: 0, 
                          padding: 0
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1, margin: 0, padding: 0 }}>
                        {item.date} - {item.time}
                      </Typography>
                    </Box>

                    <Typography variant="body1" color="text.primary" sx={{ margin: 0, padding: 0, position: 'absolute', top: 70 }}>
                      {item.feedback}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
            {index < mockReviews.length - 1 && (
              <Divider variant="inset" component="li" sx={{ my: 2 }} />
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default SellerReviews;