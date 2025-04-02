package edu.cit.campuscart.repository;

import edu.cit.campuscart.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserEntity, String> {

}
