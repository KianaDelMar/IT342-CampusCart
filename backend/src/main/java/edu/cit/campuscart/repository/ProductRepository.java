package edu.cit.campuscart.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.campuscart.entity.ProductEntity;
import jakarta.transaction.Transactional;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Integer> {
	public ProductEntity findByName(String name);
	public Optional<ProductEntity> findByCode(int code);
	List<ProductEntity> findByStatus(String status);
    //public void deleteByCode(int code);
	
    @Modifying
    @Transactional  
    void deleteByCode(int code);  
    
    public List<ProductEntity> findByUserUsername(String userUsername);
    public List<ProductEntity> findByUserUsernameNot(String username);
    public List<ProductEntity> findAll(Specification<ProductEntity> spec);
    
    @Query("SELECT p FROM ProductEntity p JOIN p.user s")
    List<ProductEntity> findAllProductsWithSellers();
    
    @Modifying
    @Query("DELETE FROM ProductEntity p WHERE p.code IN :codes")
    int deleteByCodeIn(@Param("codes") List<Integer> codes);
}
