package com.soen.project.services;

import org.springframework.http.ResponseEntity;

public interface UserAccessServicesInterface {
    ResponseEntity getAllPatients();

    ResponseEntity getPatient(long id);

    ResponseEntity getCurrentUser();

    ResponseEntity getPatientsWhoNeedAppointment();

    ResponseEntity getWorkers();

    ResponseEntity getUser(String email);

    ResponseEntity deleteUser(String email);

    ResponseEntity activateUser(String email);

    ResponseEntity getStatistics(String date);
}
