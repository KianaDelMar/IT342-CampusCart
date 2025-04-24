package edu.cit.campuscart.controller;

import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.service.UserService;
import edu.cit.campuscart.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class GoogleAuthController {
	@Autowired
    private UserService userService;
	
	@Autowired
    private JwtUtil jwtUtil;
	
	private String cleanUsername(String input) {
        // Remove accents and special characters
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String cleaned = pattern.matcher(normalized).replaceAll("");
        
        // Replace spaces with underscores and remove other special characters
        cleaned = cleaned.replaceAll(" ", "_").replaceAll("[^a-zA-Z0-9_]", "");
        
        // Convert to lowercase for consistency
        return cleaned.toLowerCase();
    }
    
    private String generateUniqueUsername(String baseUsername) {
        String username = cleanUsername(baseUsername);
        String finalUsername = username;
        int counter = 1;
        
        // Keep checking and incrementing counter until we find a unique username
        while (userService.existsByUsername(finalUsername)) {
            finalUsername = username + counter;
            counter++;
        }
        
        return finalUsername;
    }
    
    private String extractFirstNames(String fullName) {
        String[] nameParts = fullName.trim().split("\\s+");
        
        // Handle special case for names like "Karen Lean Kay Cabarrubias"
        // where we want to capture all parts before the last word as first names
        if (nameParts.length > 2) {
            StringBuilder firstNames = new StringBuilder();
            // Combine all parts except the last one
            for (int i = 0; i < nameParts.length - 1; i++) {
                firstNames.append(nameParts[i]);
                if (i < nameParts.length - 2) {
                    firstNames.append(" ");
                }
            }
            return firstNames.toString();
        }
        
        // For names with 2 parts or less, use the first part
        // Example: "John Smith" -> "John"
        return nameParts[0];
    }

    private String extractLastName(String fullName) {
        String[] nameParts = fullName.trim().split("\\s+");
        
        // Return the last part as the last name
        return nameParts[nameParts.length - 1];
    }
	
	@PostMapping("/google")
    public ResponseEntity<?> googleAuth(@RequestBody Map<String, String> payload) {
        try {
            String email = payload.get("email");
            String fullName = payload.get("name");
            String profilePhoto = payload.get("profilePhoto");
            String googleId = payload.get("googleId");

            // Extract first names and last name
            String firstNames = extractFirstNames(fullName);
            String lastName = extractLastName(fullName);
            
            // Generate a unique username based on first names
            String uniqueUsername = generateUniqueUsername(firstNames);

            // Check if user exists
            UserEntity existingUser = userService.findByEmail(email);
            UserEntity newUser = null;
            
            if (existingUser == null) {
                // Create new user
                newUser = new UserEntity();
                newUser.setEmail(email);
                newUser.setUsername(uniqueUsername);
                newUser.setFirstName(firstNames);
                newUser.setLastName(lastName);
                newUser.setProfilePhoto(profilePhoto);
                newUser.setGoogleId(googleId);
                newUser = userService.save(newUser);
            }

            // Generate JWT token
            String token = jwtUtil.generateToken(existingUser != null ? existingUser.getUsername() : newUser.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", existingUser != null ? existingUser.getUsername() : uniqueUsername);
            response.put("email", email);
            response.put("firstName", existingUser != null ? existingUser.getFirstName() : firstNames);
            response.put("lastName", existingUser != null ? existingUser.getLastName() : lastName);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Authentication failed: " + e.getMessage());
        }
    }
}
 