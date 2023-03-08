package com.soen.project.controllers;

import com.soen.project.entities.appointment.AppointmentEntity;
import com.soen.project.services.AppointmentServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;

@Controller
public class AppointmentController {

    @Autowired
    AppointmentServices appointmentServices;

    @PostMapping(value = "/appointment")
    public ResponseEntity createAppointment(@RequestBody AppointmentEntity appointment){
        return appointmentServices.createAppointment(appointment);
    }

    @GetMapping(value = "/appointment")
    public ResponseEntity getAppointment(){
        return appointmentServices.getAppointment();
    }

    @GetMapping(value = "/appointmentsForWorker")
    public ResponseEntity getAppointment(@RequestParam String workerEmail, @RequestParam String date){
        LocalDate actualDate = LocalDate.parse(date);
        return appointmentServices.getAppointments(workerEmail, actualDate);
    }

    @GetMapping(value = "/appointments")
    public ResponseEntity getAppointments(){
        return appointmentServices.getAppointments();
    }
}
