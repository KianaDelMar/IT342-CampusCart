<Box>
      {/* Close Button */}
      <IconButton
        onClick={() => onUpdateSuccess()}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          color: '#89343b',
          '&:hover': {
            bgcolor: 'rgba(137, 52, 59, 0.08)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>

      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold', 
            color: '#89343b',
            mb: 1,
            background: 'linear-gradient(45deg, #89343b 30%, #ffd700 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Update Product
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Update your product details
        </Typography>
      </Box>

      <Box 
        component="form" 
        onSubmit={handleSubmit}
        sx={{
          '& .MuiTextField-root, & .MuiFormControl-root': {
            mb: 2,
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: '#89343b',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#89343b',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#89343b',
            },
          },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Product Name"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            type="number"
            label="Price"
            value={editData.buyPrice}
            onChange={(e) => setEditData({ ...editData, buyPrice: e.target.value })}
            error={!!errors.buyPrice}
            helperText={errors.buyPrice}
          />
        </Box>

        <TextField
          margin="normal"
          required
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={editData.pdtDescription}
          onChange={(e) => setEditData({ ...editData, pdtDescription: e.target.value })}
          error={!!errors.pdtDescription}
          helperText={errors.pdtDescription}          
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <FormControl fullWidth margin="normal" required error={!!errors.category}>
            <InputLabel shrink>Category</InputLabel>
            <Select
              value={editData.category}
              label="Category"
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              sx={{ 
                color: category ? 'inherit' : '#A9A9A9',
                '& .MuiSelect-icon': {
                  color: '#89343b',
                },
              }}
            >
              <MenuItem value="Food">Food</MenuItem>
              <MenuItem value="Clothes">Clothes</MenuItem>
              <MenuItem value="Accessories">Accessories</MenuItem>
              <MenuItem value="Stationery or Arts and Crafts">Stationery / Arts and Crafts</MenuItem>
              <MenuItem value="Merchandise">Merchandise</MenuItem>
              <MenuItem value="Supplies">Supplies</MenuItem>
              <MenuItem value="Electronics">Electronics</MenuItem>
              <MenuItem value="Beauty">Beauty</MenuItem>
              <MenuItem value="Books">Books</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal"  required error={!!errors.conditionType}>
            <InputLabel shrink>Condition</InputLabel>
            <Select
              value={editData.conditionType}
              label="Condition"
              onChange={(e) => setEditData({ ...editData, conditionType: e.target.value })}
              sx={{ 
                color: editData.conditionType ? 'inherit' : '#A9A9A9',
                '& .MuiSelect-icon': {
                  color: '#89343b',
                },
              }}
            >
              <MenuItem value="Brand New">Brand New</MenuItem>
              <MenuItem value="Pre-Loved">Pre-Loved</MenuItem>
              <MenuItem value="None">None</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            type="number"
            label="Quantity in Stock"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: "1" }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel shrink>Status</InputLabel>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              displayEmpty
              sx={{ 
                color: status ? 'inherit' : '#A9A9A9',
                '& .MuiSelect-icon': {
                  color: '#89343b',
                },
              }}
            >
              <MenuItem value="" disabled>Select status</MenuItem>
              {product.status === "Approved" ? [
                <MenuItem key="approved" value="Approved" disabled>Approved</MenuItem>,
                <MenuItem key="sold" value="Sold">Sold</MenuItem>
              ] : (
                <MenuItem value="Pending" disabled>Pending</MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        <FormControl fullWidth margin="normal" error={imageError}>
          <InputLabel shrink htmlFor="image-upload">Product Image</InputLabel>
          <Box
            sx={{
              mt: 1,
              p: 3,
              border: '2px dashed',
              borderColor: imageError ? 'error.main' : '#89343b',
              borderRadius: 2,
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: '#ffd700',
                bgcolor: 'rgba(137, 52, 59, 0.05)',
              },
              minHeight: '200px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            {imagePreview && imageFile ? (
              <Box sx={{ width: '100%', textAlign: 'center', position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageFile(null);
                    setImagePreview(null);
                    setImageError(true);
                  }}
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    color: '#89343b',
                    bgcolor: 'rgba(255, 255, 255, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                  }}
                >
                  <CloseIcon />
                </IconButton>
                <Typography variant="body2" sx={{ mb: 1, color: '#89343b' }}>
                  Selected: {imageFile.name}
                </Typography>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{
                    maxWidth: '200px',
                    maxHeight: '200px',
                    objectFit: 'contain',
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: 1,
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ mb: 1, color: '#89343b' }}>
                  Click to upload image
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  (Max size: 5MB)
                </Typography>
              </Box>
            )}
          </Box>
          {imageError && (
            <Typography color="error" variant="caption" sx={{ mt: 1 }}>
              Please select an image
            </Typography>
          )}
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ 
            mt: 3, 
            mb: 2,
            py: 1.5,
            bgcolor: '#89343b',
            '&:hover': { 
              bgcolor: '#6d2a2f',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Update Product
        </Button>
      </Box>
    </Box>






























