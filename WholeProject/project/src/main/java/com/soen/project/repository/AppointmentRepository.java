package com.soen.project.repository;

import com.soen.project.entities.appointment.AppointmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<AppointmentEntity, Long> {
    List<AppointmentEntity> findByMedicalWorkerEmail(String email);
    AppointmentEntity findByPatientEmail(String email);
    void deleteAllByPatientEmail(String email);
}
