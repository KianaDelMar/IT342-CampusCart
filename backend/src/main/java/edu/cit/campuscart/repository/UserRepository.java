package edu.cit.campuscart.repository;

import edu.cit.campuscart.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
	boolean existsByEmail(String email);
}
