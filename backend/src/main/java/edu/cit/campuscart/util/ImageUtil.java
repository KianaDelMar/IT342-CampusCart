package edu.cit.campuscart.util;

import org.springframework.web.multipart.MultipartFile;
import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Base64;

public class ImageUtil {
    private static final int MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
    private static final int MAX_DIMENSION = 800;

    public static String processAndConvertToBase64(MultipartFile file) throws IOException {
        // Validate file
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }

        // Validate file size
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("File size must be less than 2MB");
        }

        // Compress and resize image
        byte[] compressedImage = compressImage(file.getBytes());
        
        // Convert to base64
        return Base64.getEncoder().encodeToString(compressedImage);
    }

    private static byte[] compressImage(byte[] imageData) throws IOException {
        BufferedImage originalImage = ImageIO.read(new ByteArrayInputStream(imageData));
        
        // Calculate new dimensions
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        int newWidth = originalWidth;
        int newHeight = originalHeight;
        
        if (originalWidth > MAX_DIMENSION || originalHeight > MAX_DIMENSION) {
            if (originalWidth > originalHeight) {
                newWidth = MAX_DIMENSION;
                newHeight = (int) ((double) originalHeight / originalWidth * MAX_DIMENSION);
            } else {
                newHeight = MAX_DIMENSION;
                newWidth = (int) ((double) originalWidth / originalHeight * MAX_DIMENSION);
            }
        }
        
        // Create new image with calculated dimensions
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, originalImage.getType());
        Graphics2D g = resizedImage.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g.dispose();
        
        // Convert back to byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "JPEG", outputStream);
        return outputStream.toByteArray();
    }
}