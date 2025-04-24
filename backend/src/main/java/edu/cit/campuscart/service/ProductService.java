package edu.cit.campuscart.service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import javax.naming.NameNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import edu.cit.campuscart.specifications.ProductSpecifications;

import edu.cit.campuscart.entity.ProductEntity;
import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.repository.ProductRepository;
import edu.cit.campuscart.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
@Transactional
public class ProductService {
	@Autowired
	private ProductRepository prepo;
	
	@Autowired
	private UserRepository userRepo;

	@Autowired
	private NotificationService notificationService;
	
	public ProductService() {
		super();
	}
	
	// get products by logged in user
	public List<ProductEntity> getProductsByUser(String userUsername) {
		return prepo.findByUserUsername(userUsername);
	}
	
	// fetches only the products where the seller's username does not match the
	// logged-in seller's username
	public List<ProductEntity> getAllProducts(String username) {
		List<ProductEntity> products = prepo.findByUserUsernameNot(username);
		return products;
	}
	
	public List<ProductEntity> getProducts(String username) {
		List<ProductEntity> products = prepo.findByUserUsername(username);
		return products;
	}
	
	// Create a new product and associate it with a seller
	public void postProduct(String name, String pdtDescription, int qtyInStock, float buyPrice, String imagePath, String category, String status, String conditionType, String userUsername) throws NoSuchElementException {
		// Find the seller by username
		Optional<UserEntity> userOpt = userRepo.findById(userUsername);
		if (userOpt.isEmpty()) {
			throw new NoSuchElementException("User with username " + userUsername + " not found");
		}

		// Create a new product and associate it with the seller
		ProductEntity productentity = new ProductEntity();
		productentity.setName(name);
		productentity.setPdtDescription(pdtDescription);
		productentity.setQtyInStock(qtyInStock);
		productentity.setBuyPrice(buyPrice);
		productentity.setImagePath(imagePath);
		productentity.setCategory(category);
		productentity.setStatus(status);
		productentity.setConditionType(conditionType);
		productentity.setUser(userOpt.get()); // Associate with seller

		prepo.save(productentity);
	}
	
	public ProductEntity getProductByCode(int code) {
		Optional<ProductEntity> product = prepo.findById(code);
		return product.orElse(null);
	}
	public List<ProductEntity> getFilteredProducts(String username, String category, String status, String conditionType) {
		Specification<ProductEntity> spec = Specification.where(ProductSpecifications.hasStatus("Approved")) // force approved only
            .and(ProductSpecifications.hasCategory(category))
            .and(ProductSpecifications.hasConditionType(conditionType))
            .and(ProductSpecifications.userNot(username)); // exclude product of the passed user
	
		return prepo.findAll(spec);
	}
	
	// Update of CRUD
	@SuppressWarnings("finally")
	public ProductEntity putProductDetails(int code, ProductEntity newProductEntity) {
		ProductEntity productentity = new ProductEntity();
		try {
			productentity = prepo.findByCode(code).get();

			productentity.setName(newProductEntity.getName());
			productentity.setPdtDescription(newProductEntity.getPdtDescription());
			productentity.setQtyInStock(newProductEntity.getQtyInStock());
			productentity.setBuyPrice(newProductEntity.getBuyPrice());
			productentity.setCategory(newProductEntity.getCategory());
			productentity.setStatus(newProductEntity.getStatus());
			productentity.setConditionType(newProductEntity.getConditionType());

		} catch (NoSuchElementException ex) {
			throw new NameNotFoundException("Product " + code + " not found!");
		} finally {
			return prepo.save(productentity);
		}
	}

	// Delete of CRUD
	public String deleteProduct(int code) {
		String msg = "";
		if (prepo.findByCode(code) != null) {
			prepo.deleteByCode(code);
			msg = "Product has been successfully deleted";
		} else {
			msg = code + "NOT found!";
		}
		return msg;
	}
	
	public List<ProductEntity> getApprovedProducts() {
        return prepo.findByStatus("Approved");
    }
	
	// Approve product
	public void approveProduct(int code) throws Exception {
		Optional<ProductEntity> productOpt = prepo.findById(code);
	
		if (productOpt.isPresent()) {
			ProductEntity product = productOpt.get();
			
			// Check if the status is currently "Pending" before approving
			if ("Pending".equals(product.getStatus())) {
				product.setStatus("Approved");
				prepo.save(product);  // Save the product with the new status
	
				// Send a notification to the product owner about the approval
				String message = "Your product '" + product.getName() + "' has been approved!";
				String type = "info";  // You can customize this based on your notification types
				String username = product.getUser().getUsername();   // Assuming there is an owner associated with the product
	
				// Create a notification for the product owner
				notificationService.createNotification(message, type, username);
			} else {
				throw new IllegalStateException("Product is not in Pending status and cannot be approved.");
			}
	
		} else {
			throw new NoSuchElementException("Product not found for approval.");
		}
	}
    
	// Reject product
    @Transactional
    public void rejectProduct(String productCode, String feedback) {
        ProductEntity product = prepo.findByCode(Integer.parseInt(productCode))
            .orElseThrow(() -> new RuntimeException("Product not found"));
        
        product.setStatus("Rejected");
        product.setFeedback(feedback);
        prepo.save(product);
        
        // Create rejection notification
        String message = "Your product " + product.getName() + " has been rejected. Feedback: " + feedback;
        String type = "rejection";
        String username = product.getUser().getUsername();
        notificationService.createNotification(message, type, username);
    }
}
