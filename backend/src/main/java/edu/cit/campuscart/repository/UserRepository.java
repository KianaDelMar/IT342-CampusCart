package edu.cit.campuscart.repository;

import edu.cit.campuscart.entity.UserEntity;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
	boolean existsByEmail(String email);

	Optional<UserEntity> findByUsername(String username);
	UserEntity findByEmail(String email);
	boolean existsByUsername(String username);
}
