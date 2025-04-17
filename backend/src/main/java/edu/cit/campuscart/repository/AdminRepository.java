package edu.cit.campuscart.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.campuscart.entity.AdminEntity;

@Repository
public interface AdminRepository extends JpaRepository<AdminEntity, Long> {
	// Find admin by username (useful for authentication or queries)
    Optional<AdminEntity> findByUsername(String username);
    public void deleteByUsername(String username);

    // Check if an admin exists by username
    boolean existsByUsername(String username);
}
