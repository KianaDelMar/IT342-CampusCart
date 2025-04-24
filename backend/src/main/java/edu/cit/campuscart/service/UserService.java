package edu.cit.campuscart.service;

import java.util.NoSuchElementException;
import java.util.Optional;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import edu.cit.campuscart.dto.ChangePassword;
import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserService() {
        super();
    }
    
  //CREATE
  	public UserEntity postUserRecord(UserEntity user) throws NameAlreadyBoundException {
  		if(userRepo.existsById(user.getUsername())) {
  			throw new NameAlreadyBoundException("Username " + user.getUsername() + " is already taken. Input another username.");
  		}
  		// Hash the password before saving
  		user.setPassword(passwordEncoder.encode(user.getPassword()));
  		return userRepo.save(user);
  	}
  	
  	public boolean isEmailExists(String email) {
        return userRepo.existsByEmail(email);
    }

    public boolean existsByUsername(String username) {
        return userRepo.existsByUsername(username);
    }

	/*
  	public List<UserEntity> getAllUsers() {
		return userRepo.findAll();
	} 
	*/
	
	public UserEntity authenticateUser(String username, String password) {
		System.out.println("Attempting to authenticate user: " + username);
		UserEntity user = userRepo.findById(username).get(); //search user by username
		
		if (user == null) {
	        System.out.println("Seller not found. Please register.");
	        throw new NoSuchElementException("Seller not found. Please register.");
	    }
		
		System.out.println("Retrieved seller: " + user.getUsername());
		
		// Check if the password matches using password encoder
		if (passwordEncoder.matches(password, user.getPassword())) {
	        return user; // Authentication successful
	    } else {
	        System.out.println("Password does not match.");
	        throw new RuntimeException("Invalid password");
	    }
	}
	
	public UserEntity getUserByUsername(String username) throws NameNotFoundException {
		return userRepo.findById(username).orElseThrow(() -> new NameNotFoundException("User with username: " + username + " not found."));
	}
	
	//UPDATE
	public UserEntity putUserDetails(String username, UserEntity newUserDetails) throws NameNotFoundException {
	    UserEntity user = userRepo.findById(username)
	        .orElseThrow(() -> new NameNotFoundException("User with username: " + username + " does not exist"));

	    if (newUserDetails.getProfilePhoto() != null) {
	        System.out.println("Updated Profile Photo: " + newUserDetails.getProfilePhoto()); // Add a log here
	    }
	    
	    user.setFirstName(newUserDetails.getFirstName());
	    user.setLastName(newUserDetails.getLastName());
	    user.setAddress(newUserDetails.getAddress());
	    user.setContactNo(newUserDetails.getContactNo());
	    user.setEmail(newUserDetails.getEmail());

	    return userRepo.save(user);
	}
	
	public UserEntity updatePassword(String username, ChangePassword passwordRequest) throws NameNotFoundException{
		UserEntity user = userRepo.findById(username)
		        .orElseThrow(() -> new NameNotFoundException("User with username: " + username + " does not exist"));
		
		// Verify current password
		if (!passwordEncoder.matches(passwordRequest.getCurrentPassword(), user.getPassword())) {
			throw new RuntimeException("Current password is incorrect.");
		}
		
		// Hash and set the new password
		user.setPassword(passwordEncoder.encode(passwordRequest.getNewPassword()));
		return userRepo.save(user);
	}
	
	public String deleteUser(String username) {
		String msg = "";
		if(userRepo.findById(username) != null) {
			userRepo.deleteById(username);
			msg = "User " + username + " successfully deleted";
		} else {
			msg = "User with username: " + username + " is not found";
		}
		
		return msg;
	}
	
	public UserEntity save(UserEntity user) {
	    return userRepo.save(user);
	}
	
	public UserEntity findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

}
