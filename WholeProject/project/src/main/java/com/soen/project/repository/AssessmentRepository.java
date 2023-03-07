package com.soen.project.repository;

import com.soen.project.entities.assessment.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, Long> {
    Assessment findById(long id);
    void deleteAllByPatientId(long id);
}
