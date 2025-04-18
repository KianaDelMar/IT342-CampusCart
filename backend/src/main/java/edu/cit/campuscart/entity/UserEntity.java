package edu.cit.campuscart.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class UserEntity {
    @Id
    private String username;
    private String firstName;
    private String lastName;
    private String contactNo;
    @Column(unique = true)
    private String email;
    private String address;
    private String password;
    private String profilePhoto;

    @Column(name = "fcm_token")
    private String fcmToken;  // Ensure this is a String

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true) // ensures that when a seller is deleted, all associated products will also be deleted
    @JsonManagedReference
    private List<ProductEntity> products;

    public UserEntity() {
        super();
    }

    public UserEntity(String username, String firstName, String lastName, String contactNo, String email, String address, String password, String profilePhoto) {
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.contactNo = contactNo;
        this.email = email;
        this.address = address;
        this.password = password;
        this.profilePhoto = profilePhoto;
    }

    // Getters and setters
    public String getFcmToken() {
        return fcmToken;
    }

    public void setFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getContactNo() {
        return contactNo;
    }

    public void setContactNo(String contactNo) {
        this.contactNo = contactNo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProfilePhoto() {
        return profilePhoto;
    }

    public void setProfilePhoto(String profilePhoto) {
        this.profilePhoto = profilePhoto;
    }

    
    public List<ProductEntity> getProducts() {
        return products;
    }

    public void setProducts(List<ProductEntity> products) {
        this.products = products;
    }

}
