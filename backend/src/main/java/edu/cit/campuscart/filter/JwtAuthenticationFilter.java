package edu.cit.campuscart.filter;

import edu.cit.campuscart.service.CustomUserDetailsService;
import edu.cit.campuscart.service.CustomAdminDetailsService;
import edu.cit.campuscart.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private CustomAdminDetailsService adminDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");
        System.out.println("Request URI: " + request.getRequestURI());
        System.out.println("Authorization Header: " + authorizationHeader);

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwt);
                System.out.println("Extracted username from token: " + username);
            } catch (Exception e) {
                System.err.println("Error extracting username from token: " + e.getMessage());
                chain.doFilter(request, response);
                return;
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = null;
            
            // Try to load as admin first
            try {
                userDetails = this.adminDetailsService.loadUserByUsername(username);
                System.out.println("User found as admin: " + username);
            } catch (UsernameNotFoundException e) {
                // If not found as admin, try as user
                try {
                    userDetails = this.userDetailsService.loadUserByUsername(username);
                    System.out.println("User found as regular user: " + username);
                } catch (UsernameNotFoundException ex) {
                    // User not found in either service
                    System.err.println("User not found in either service: " + username);
                    chain.doFilter(request, response);
                    return;
                }
            }

            try {
                if (jwtUtil.validateToken(jwt, username)) {
                    System.out.println("Token validated successfully for user: " + username);
                    UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    usernamePasswordAuthenticationToken
                            .setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
                } else {
                    System.err.println("Token validation failed for user: " + username);
                }
            } catch (Exception e) {
                System.err.println("Error during token validation: " + e.getMessage());
            }
        }
        chain.doFilter(request, response);
    }
}