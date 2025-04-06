package edu.cit.campuscart.service;

import java.util.List;

import javax.naming.NameAlreadyBoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepo;

    public UserService() {
        super();
    }
    
  //CREATE
  	public UserEntity postUserRecord(UserEntity user) throws NameAlreadyBoundException {
  		if(userRepo.existsById(user.getUsername())) {
  			throw new NameAlreadyBoundException("Username " + user.getUsername() + " is already taken. Input another username.");
  		}
  		
  		if (isEmailExists(user.getEmail())) {
              throw new NameAlreadyBoundException("Email already exists");
          }
  		
  		return userRepo.save(user);
  	}
  	
  	public boolean isEmailExists(String email) {
        return userRepo.existsByEmail(email);
    }

	public List<UserEntity> getAllUsers() {
		return userRepo.findAll();
	}
}
