package edu.cit.campuscart.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import javax.naming.NameNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.campuscart.dto.ChangePassword;
import edu.cit.campuscart.entity.AdminEntity;
import edu.cit.campuscart.entity.ProductEntity;
import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.repository.AdminRepository;
import edu.cit.campuscart.repository.ProductRepository;
import edu.cit.campuscart.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class AdminService {
	@Autowired
	private AdminRepository adminRepo;
	
	@Autowired
	private ProductRepository productRepo;
	
	@Autowired
	private UserRepository userRepo;
	
	public AdminEntity authenticateAdmin(String username, String password) {
        try {
            System.out.println("Attempting to authenticate admin: " + username);
            
            // Attempt to find the admin by username
            AdminEntity admin = adminRepo.findByUsername(username).orElseThrow(() -> {
                System.out.println("Admin not found. Please register.");
                return new NoSuchElementException("Admin not found. Please register.");
            });
            
            System.out.println("Retrieved admin: " + admin.getUsername() + ", Password: " + admin.getPassword());
            
            // Check if the password matches
            if (admin.getPassword().equals(password)) {
                return admin; // Authentication successful
            } else {
                System.out.println("Password does not match.");
                throw new RuntimeException("Invalid password");
            }
        } catch (NoSuchElementException e) {
            System.err.println("Error: " + e.getMessage());
            throw e; // Re-throwing the exception to propagate it if necessary
        } catch (RuntimeException e) {
            System.err.println("Authentication failed: " + e.getMessage());
            throw e; // Re-throwing the exception to propagate it if necessary
        } catch (Exception e) {
            System.err.println("An unexpected error occurred: " + e.getMessage());
            throw new RuntimeException("Unexpected error during authentication");
        }
    }
	
	//UPDATE
  	public AdminEntity putAdminDetails(String username, AdminEntity newAdminDetails) throws NameNotFoundException {
  	    AdminEntity admin = adminRepo.findByUsername(username)
  	        .orElseThrow(() -> new NameNotFoundException("users with username: " + username + " does not exist"));

  	    if (newAdminDetails.getProfilePhoto() != null) {
  	        System.out.println("Updated Profile Photo: " + newAdminDetails.getProfilePhoto()); 
  	    }
  	    
  	    //users.setProfilePhoto(newDetails.getProfilePhoto());
  	    admin.setFirstName(newAdminDetails.getFirstName());
  	    admin.setLastName(newAdminDetails.getLastName());
  	    admin.setContactNo(newAdminDetails.getContactNo());
  	    admin.setEmail(newAdminDetails.getEmail());

  	    return adminRepo.save(admin);
  	}
  	
  	// ========================= Admin Management =========================

    // Get all admins
    public List<AdminEntity> getAllAdmins() {
        return adminRepo.findAll();
    }
    
    // Get admin by username
    public AdminEntity getAdminByUsername(String username) {
        return adminRepo.findByUsername(username)
                .orElseThrow(() -> new NoSuchElementException("Admin with username " + username + " not found"));
    }
    
    public AdminEntity updatePassword(String username, ChangePassword passwordRequest) throws NameNotFoundException{
		AdminEntity admin = adminRepo.findByUsername(username)
		        .orElseThrow(() -> new NameNotFoundException("Admin with username: " + username + " does not exist"));
		
		if(!admin.getPassword().equals(passwordRequest.getCurrentPassword())) {
			throw new RuntimeException("Current password is incorrect.");
		}
		
		admin.setPassword(passwordRequest.getNewPassword());
		return adminRepo.save(admin);
	}
    
    // ========================= Product Management =========================
    
    // Retrieve all products with corresponding user username
    public List<Map<String, Object>> getAllProductsWithUsers() {
        return productRepo.findAll().stream()
            .map(product -> {
                Map<String, Object> details = new HashMap<>();
                details.put("product", product);
                details.put("productName", product.getName());
                details.put("productCode", product.getCode());
                details.put("description", product.getPdtDescription());
                details.put("category", product.getCategory());
                details.put("status", product.getStatus());
                details.put("image", product.getImagePath());
                details.put("userUsername", product.getUser() != null ? product.getUser().getUsername() : "Unknown");
                return details;
            })
            .collect(Collectors.toList());
    }
    
    // handles bulk deleting
    @Transactional
    public int deleteProductsByCodes(List<Integer> productCodes) {
        return productRepo.deleteByCodeIn(productCodes);
    }
    
    // Update an existing product
    public ProductEntity updateProduct(int code, ProductEntity updatedProduct) {
        ProductEntity existingProduct = productRepo.findById(code)
                .orElseThrow(() -> new NoSuchElementException("Product with code " + code + " not found"));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setPdtDescription(updatedProduct.getPdtDescription());
        existingProduct.setBuyPrice(updatedProduct.getBuyPrice());
        existingProduct.setCategory(updatedProduct.getCategory());
        existingProduct.setConditionType(updatedProduct.getConditionType());
        
        return productRepo.save(existingProduct);
    }
    
    // Delete a product by code
    public String deleteProduct(int code) {
        if (productRepo.existsById(code)) {
            productRepo.deleteById(code);
            return "Product with code " + code + " has been successfully deleted.";
        } else {
            throw new NoSuchElementException("Product with code " + code + " not found.");
        }
    }
    
    // ========================= User Management =========================
    // Admin gets all users
    public List<UserEntity> getAllUsers() {
        return userRepo.findAll();
    }
    
    // Admin gets users by username
    public UserEntity getUserByUsername(String username) throws NameNotFoundException {
        return userRepo.findById(username)
                .orElseThrow(() -> new NameNotFoundException("User with username: " + username + " not found."));
    }
    
    // Admin updates users details
    public UserEntity updateUserDetails(String username, UserEntity newUserDetails) throws NameNotFoundException {
        UserEntity user = userRepo.findById(username)
                .orElseThrow(() -> new NameNotFoundException("User with username: " + username + " does not exist"));

        // Updating fields
        user.setFirstName(newUserDetails.getFirstName());
        user.setLastName(newUserDetails.getLastName());
        user.setAddress(newUserDetails.getAddress());
        user.setContactNo(newUserDetails.getContactNo());
        user.setEmail(newUserDetails.getEmail());

        return userRepo.save(user);
    }
    
    // Admin deletes a seller
    public String deleteSeller(String username) {
        if (userRepo.existsById(username)) {
            userRepo.deleteById(username);
            return "Seller " + username + " successfully deleted";
        } else {
            throw new NoSuchElementException("Seller with username: " + username + " is not found");
        }
    }
    
    //DELETE ADMIN ACCOUNT
  	@Transactional
  	public String deleteAdmin(String username) {
        System.out.println("Attempting to delete admin: " + username);
  		String msg = "";
  		if(adminRepo.findByUsername(username) != null) {
  			adminRepo.deleteByUsername(username);
  			msg = "Admin " + username + " successfully deleted";
  		} else {
  			msg = "Admin with username: " + username + " is not found";
  		}
  		
  		return msg;
  	}
    
    public String deleteUser(String role, String username) throws NameNotFoundException {
        System.out.println("Deleting user: " + role + " " + username);
        if ("admin".equalsIgnoreCase(role)) {
            deleteAdmin(username);
            return "Admin with username '" + username + "' has been deleted successfully.";
        } else if ("seller".equalsIgnoreCase(role)) {
            UserEntity seller = getUserByUsername(username);
            if (seller == null) {
                throw new NameNotFoundException("Seller with username '" + username + "' not found.");
            }
            deleteSeller(username);
            return "Seller with username '" + username + "' has been deleted successfully.";
        } else {
            throw new IllegalArgumentException("Invalid role. Use 'admin' or 'seller'.");
        }
    }
    
    public AdminEntity addAdmin(AdminEntity adminEntity) {
        // Perform any necessary validation or preprocessing here
        return adminRepo.save(adminEntity);
    }
}
