package edu.cit.campuscart.service;

import edu.cit.campuscart.entity.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;

public class UserService {
    @Autowired
    private UserEntity userEntity;

    public UserService() {
        super();
    }
}
