package edu.cit.campuscart.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import edu.cit.campuscart.entity.NotificationEntity;
import edu.cit.campuscart.entity.UserEntity;

public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserOrderByTimestampDesc(UserEntity user);

}

