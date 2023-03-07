package com.soen.project.repository;

import com.soen.project.entities.user.Counselor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CounselorRepository extends JpaRepository<Counselor, Long> {
    Counselor findByEmail(String email);
}
