package edu.cit.campuscart.specifications;

import org.springframework.data.jpa.domain.Specification;

import edu.cit.campuscart.entity.ProductEntity;

public class ProductSpecifications {
	public static Specification<ProductEntity> hasCategory(String category) {
        return (root, query, criteriaBuilder) -> 
            category == null || category.isEmpty() ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("category"), category);
    }

    public static Specification<ProductEntity> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> 
            status == null || status.isEmpty() ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<ProductEntity> hasConditionType(String conditionType) {
        return (root, query, criteriaBuilder) -> 
            conditionType == null || conditionType.isEmpty() ? criteriaBuilder.conjunction() : criteriaBuilder.equal(root.get("conditionType"), conditionType);
    }

    public static Specification<ProductEntity> userNot(String username) {
        return (root, query, cb) -> {
            if (username == null || username.isEmpty()) {
                return cb.conjunction(); // no filtering if null
            }
            return cb.notEqual(root.get("user").get("username"), username);
        };
    }    
}
