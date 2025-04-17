package edu.cit.campuscart.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import javax.naming.NameNotFoundException;

import edu.cit.campuscart.dto.ChangePassword;
import edu.cit.campuscart.dto.Login;
import edu.cit.campuscart.entity.AdminEntity;
import edu.cit.campuscart.entity.ProductEntity;
import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.service.AdminService;
import edu.cit.campuscart.util.JwtUtil;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/admin")
public class AdminController {
	@Autowired
	private AdminService adminService;
	@Autowired
	private JwtUtil jwtUtil;
	
	private static final String UPLOAD_DIR = "C:/Users/Lloyd/Downloads/uploads";
	
	@GetMapping("/getAdminRecord/{username}") 
	public AdminEntity getAdminByUsername(@PathVariable String username) throws NameNotFoundException {
		return adminService.getAdminByUsername(username);
	}
    
    @PutMapping("/putAdminRecord/{username}")
	public AdminEntity putAdminRecord(@PathVariable String username, @RequestBody AdminEntity newAdminDetails) throws NameNotFoundException {
		return adminService.putAdminDetails(username, newAdminDetails);
	}
    
  	@DeleteMapping("/deleteAdminRecord/{username}")
  	public String deleteAdmin(@PathVariable String username) {
  		return adminService.deleteAdmin(username);
  	}
	
	@PostMapping("login")
	public ResponseEntity<Map<String, String>> login(@RequestBody Login loginRequest) {
		String username = loginRequest.getUsername();
		String password = loginRequest.getPassword();
			
		AdminEntity admin = adminService.authenticateAdmin(username, password);
		if(admin != null) {
			String token = jwtUtil.generateToken(username);
			Map<String, String> response = new HashMap<>();
			response.put("token", token);
			response.put("message", "Login Successful");
			response.put("username", admin.getUsername());
			response.put("firstName", admin.getFirstName());
			response.put("lastName", admin.getLastName());
			response.put("contactNo", admin.getContactNo());
			response.put("email", admin.getEmail());
			return ResponseEntity.ok(response); 
			} else 
				return ResponseEntity.status(401).body(null);
	}
	
	@PostMapping("/addAdmin")
    public ResponseEntity<Map<String, String>> addAdmin(@RequestBody AdminEntity adminEntity) {
        try {
            AdminEntity savedAdmin = adminService.addAdmin(adminEntity);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Admin added successfully");
            response.put("adminId", String.valueOf(savedAdmin.getId())); // assuming AdminEntity has an ID field
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add admin: " + e.getMessage()));
        }
    }
	
	@PostMapping("/uploadProfilePhoto/{username}")
	public ResponseEntity<Map<String,String>> uploadProfilePhoto(@PathVariable String username, @RequestParam("file") MultipartFile file) throws NameNotFoundException {
		try {
			if(file.isEmpty()) 
				return ResponseEntity.badRequest().body(Map.of("message", "No file selected"));
			
			//Getting the filename
			String fileName = StringUtils.cleanPath(file.getOriginalFilename());
			//Save image to target location
			Path targetLocation = Paths.get(UPLOAD_DIR, fileName);
	        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
			
	        //Save only the filename to the database
			AdminEntity admin = adminService.getAdminByUsername(username);
			admin.setProfilePhoto(fileName); //stores the filename only
			adminService.putAdminDetails(username, admin);
			
			Map<String, String> response = new HashMap<>();
			response.put("message", "Profile photo uploaded successfully");
			response.put("fileName", fileName);
			return ResponseEntity.ok(response);
		} catch(IOException e) {
			return ResponseEntity.status(500).body(Map.of("message", "Failed to upload the file"));
		}
	}
	
	@GetMapping("/getAllAdmins")
    public List<AdminEntity> getAllAdmins() {
        return adminService.getAllAdmins();
    }
  	
  	@GetMapping("/products")
    public List<ProductEntity> viewAllProducts() {
        return adminService.viewAllProducts();
    }

  	@GetMapping("/products/{code}")
    public ProductEntity getProductByCode(@PathVariable int code) {
        return adminService.getProductByCode(code);
    }
  	
  	@PutMapping("/editproducts/{code}")
    public ProductEntity updateProduct(@PathVariable int code, @RequestBody ProductEntity updatedProduct) {
        return adminService.updateProduct(code, updatedProduct);
    }

    @DeleteMapping("/deleteproducts/{code}")
    public String deleteProduct(@PathVariable int code) {
        return adminService.deleteProduct(code);
    }
    
    @DeleteMapping("/delete-products")
    public ResponseEntity<?> deleteProducts(@RequestBody List<Integer> productCodes) {
        try {
            int deletedCount = adminService.deleteProductsByCodes(productCodes);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Products deleted successfully.");
            response.put("deletedCount", deletedCount);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // User Management Endpoints

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserEntity> users = adminService.getAllUsers();
            return new ResponseEntity<>(users, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/users/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        try {
        	UserEntity user = adminService.getUserByUsername(username);
            return new ResponseEntity<>(user, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    
    @PutMapping("/users/{username}")
    public ResponseEntity<?> updateUser(@PathVariable String username, @RequestBody UserEntity updatedDetails) {
        try {
        	UserEntity updatedUser = adminService.updateUserDetails(username, updatedDetails);
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    
    @DeleteMapping("/users/{username}")
    public ResponseEntity<String> deleteUser(@PathVariable String username) {
        try {
            String message = adminService.deleteUser(username);
            return new ResponseEntity<>(message, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping("/products-with-users")
    public ResponseEntity<List<Map<String, Object>>> getProductsWithUsers() {
        return ResponseEntity.ok(adminService.getAllProductsWithUsers());
    }
    
    @PutMapping("/updateUserDetails/{role}/{username}")
    public ResponseEntity<?> updateUserDetails(
            @PathVariable String role,
            @PathVariable String username,
            @RequestBody Map<String, String> userDetails) {
        try {
            if ("admin".equalsIgnoreCase(role)) {
                AdminEntity admin = adminService.getAdminByUsername(username);

                // Update fields
                admin.setFirstName(userDetails.get("firstName"));
                admin.setLastName(userDetails.get("lastName"));
                admin.setEmail(userDetails.get("email"));
                admin.setContactNo(userDetails.get("contactNo"));

                // Save updated admin
                AdminEntity updatedAdmin = adminService.putAdminDetails(username, admin);
                return new ResponseEntity<>(updatedAdmin, HttpStatus.OK);
            } else if ("user".equalsIgnoreCase(role)) {
                UserEntity user = adminService.getUserByUsername(username);

                // Update fields
                user.setFirstName(userDetails.get("firstName"));
                user.setLastName(userDetails.get("lastName"));
                user.setEmail(userDetails.get("email"));
                user.setContactNo(userDetails.get("contactNo"));

                // Save updated user
                UserEntity updatedUser = adminService.updateUserDetails(username, user);
                return new ResponseEntity<>(updatedUser, HttpStatus.OK);
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Invalid role. Use 'admin' or 'user'."));
            }
        } catch (NameNotFoundException | NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }
    
    @DeleteMapping("/deleteUser/{role}/{username}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable String role, 
            @PathVariable String username) {
        try {
            String message = adminService.deleteUser(role, username);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (NameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }
    
    @PutMapping("/changePassword/{username}")
	public AdminEntity updatePassword(@PathVariable String username, @RequestBody ChangePassword passwordRequest) throws NameNotFoundException {
		return adminService.updatePassword(username, passwordRequest);
	}
}
