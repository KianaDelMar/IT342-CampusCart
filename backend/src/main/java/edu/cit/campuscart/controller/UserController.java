package edu.cit.campuscart.controller;

import java.util.List;
import java.util.Map;

import javax.naming.NameAlreadyBoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.service.UserService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")  // Allow CORS from React app
public class UserController {
	@Autowired
	private UserService userService;
	
	//CREATE
	@PostMapping("/postUserRecord")
	public ResponseEntity<?> postSellerRecord(@RequestBody UserEntity user) throws NameAlreadyBoundException {
		if (user.getUsername().isEmpty() || user.getPassword().isEmpty() || user.getFirstName().isEmpty() || user.getLastName().isEmpty() || user.getAddress().isEmpty() || user.getContactNo().isEmpty() || user.getEmail().isEmpty()) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "All fields are required"));
		} else if (user.getPassword().length() < 8) {
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Password must be at least 8 characters long"));
		}
			
		try 
		{
			UserEntity savedUser = userService.postUserRecord(user);
		    return ResponseEntity.ok(savedUser);
		} 
		catch (NameAlreadyBoundException e) 
		{
			return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
		}
	}
	
	//DISPLAY RECORD
	@GetMapping("/getUserRecords")
	public List<UserEntity> getAllUsers() {
		return userService.getAllUsers();
	}
}
