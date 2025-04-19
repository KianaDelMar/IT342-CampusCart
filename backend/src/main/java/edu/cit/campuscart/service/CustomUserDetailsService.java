package edu.cit.campuscart.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import edu.cit.campuscart.entity.UserEntity;
import edu.cit.campuscart.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Loading user details for username: " + username);
        
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.err.println("User not found with username: " + username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

        System.out.println("User found: " + user.getUsername());
        
        // Use a non-null default password for users without a password (e.g., OAuth users)
        String password = user.getPassword();
        if (password == null || password.trim().isEmpty()) {
            password = "{noop}dummy_password_for_oauth_users";
        }
        
        UserDetails userDetails = User.builder()
                .username(user.getUsername())
                .password(password)
                .roles("USER")
                .build();
                
        System.out.println("User details built successfully");
        return userDetails;
    }
}