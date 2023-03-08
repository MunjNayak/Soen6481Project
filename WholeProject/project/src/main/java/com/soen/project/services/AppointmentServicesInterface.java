package com.soen.project.services;

import com.soen.project.entities.appointment.AppointmentEntity;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;

public interface AppointmentServicesInterface {
    ResponseEntity createInitialAppointment();
    ResponseEntity createAppointment(AppointmentEntity appointment);
    ResponseEntity getAppointment(long patientId);
    ResponseEntity getAppointment();
    ResponseEntity getAppointments();
    ResponseEntity getAppointments(String workerEmail, LocalDate date);
}
