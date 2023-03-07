package com.soen.project.controllers;

import com.soen.project.services.UserAccessServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserAccess {

    @Autowired
    UserAccessServices userAccessServices;

    @GetMapping("/user")
    public ResponseEntity getCurrentUser(){
        return userAccessServices.getCurrentUser();
    }

    @GetMapping("/patients")
    public ResponseEntity getAllPatients(){
        return userAccessServices.getAllPatients();
    }

    @GetMapping("/patientsNeedAppointment")
    public ResponseEntity getPatientsNeedingAppointment(){
        return userAccessServices.getPatientsWhoNeedAppointment();
    }

    @GetMapping("/patient")
    public ResponseEntity getPatient(@RequestParam long id){
        return userAccessServices.getPatient(id);
    }

    @GetMapping("/userWithEmail")
    public ResponseEntity getUser(@RequestParam String email){
        return userAccessServices.getUser(email);
    }

    @GetMapping("/deleteUser")
    public ResponseEntity deleteUser(@RequestParam String email) {
        return userAccessServices.deleteUser(email);
    }

    @GetMapping("/workers")
    public ResponseEntity getWorkers(){
        return userAccessServices.getWorkers();
    }

    @GetMapping("/activate")
    public ResponseEntity getWorkers(@RequestParam String email){
        return userAccessServices.activateUser(email);
    }

    @GetMapping("/statistics")
    public ResponseEntity getStatistics(@RequestParam String date){
        return userAccessServices.getStatistics(date);
    }
}
