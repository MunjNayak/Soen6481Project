package com.soen.project.repository;

import com.soen.project.entities.user.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    List<Patient> findAll();
    Patient findByEmail(String email);
}