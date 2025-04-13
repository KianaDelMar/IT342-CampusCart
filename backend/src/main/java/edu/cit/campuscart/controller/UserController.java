package edu.cit.campuscart.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.naming.NameAlreadyBoundException;
import javax.naming.NameNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import edu.cit.campuscart.dto.ChangePassword;
import edu.cit.campuscart.dto.Login;
import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.service.UserService;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:3000")  // Allow CORS from React app
public class UserController {
	@Autowired
	private UserService userService;
	
	private static final String UPLOAD_DIR = "C:/Users/Lloyd/Downloads/uploads";
	
	//CREATE
	@PostMapping("/postUserRecord")
	public ResponseEntity<?> postUserRecord(@RequestBody UserEntity user) throws NameAlreadyBoundException {
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
	
	@PostMapping("login")
	public ResponseEntity<Map<String, String>> login(@RequestBody Login loginRequest) {
		String username = loginRequest.getUsername();
		String password = loginRequest.getPassword();
			
		UserEntity user = userService.authenticateUser(username, password);
		if(user != null) {
			Map<String, String> response = new HashMap<>();
			response.put("message", "Login Successful");
			response.put("username", user.getUsername());
			response.put("password", user.getPassword());
			response.put("firstName", user.getFirstName());
			response.put("lastName", user.getLastName());
			response.put("address", user.getAddress());
			response.put("contactNo", user.getContactNo());
			response.put("email", user.getEmail());
			return ResponseEntity.ok(response); 
			} else 
				return ResponseEntity.status(401).body(null);
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
			UserEntity user = userService.getUserByUsername(username);
			user.setProfilePhoto(fileName); //stores the filename only
			userService.putUserDetails(username, user);
			
			Map<String, String> response = new HashMap<>();
			response.put("message", "Profile photo uploaded successfully");
			response.put("fileName", fileName);
			return ResponseEntity.ok(response);
		} catch(IOException e) {
			return ResponseEntity.status(500).body(Map.of("message", "Failed to upload the file"));
		}
	}
	
	@GetMapping("/getUserRecord/{username}") 
	public UserEntity getUserByUsername(@PathVariable String username) throws NameNotFoundException {
		return userService.getUserByUsername(username);
	}
	
	@GetMapping("/getUsername/{username}")
    public String getUserUsername(@PathVariable String username) throws NameNotFoundException {
        UserEntity user = userService.getUserByUsername(username);
        if (user == null) {
            throw new NameNotFoundException("User with username " + username + " not found");
        }
        return user.getUsername();
    }
	
	@PutMapping("/putUserRecord/{username}")
	public UserEntity putUserRecord(@PathVariable String username, @RequestBody UserEntity newUserDetails) throws NameNotFoundException {
		return userService.putUserDetails(username, newUserDetails);
	}
	
	@PutMapping("/changePassword/{username}")
	public UserEntity updatePassword(@PathVariable String username, @RequestBody ChangePassword passwordRequest) throws NameNotFoundException {
		return userService.updatePassword(username, passwordRequest);
	}
	
	@DeleteMapping("/deleteUserRecord/{username}")
	public String deleteUser(@PathVariable String username) {
		return userService.deleteUser(username);
	}
}
