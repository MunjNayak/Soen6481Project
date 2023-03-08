package com.soen.project.controllers;

import com.soen.project.entities.user.Doctor;
import com.soen.project.entities.user.Counselor;
import com.soen.project.entities.user.Patient;
import com.soen.project.repository.DoctorRepository;
import com.soen.project.repository.CounselorRepository;
import com.soen.project.repository.PatientRepository;
import com.soen.project.services.LoginAndRegisterServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.validation.Errors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import javax.validation.Valid;

@Controller
public class Register {

    @Autowired
    PatientRepository patientRepository;
    @Autowired
    CounselorRepository counselorRepository;
    @Autowired
    DoctorRepository doctorRepository;
    @Autowired
    LoginAndRegisterServices loginAndRegisterServices;

    @GetMapping(value = "/register")
    public String getRegisterPage(){
        return "register";
    }

    @PostMapping(path = "/patient")
    public ResponseEntity createPatient(@RequestBody @Valid Patient patient, Errors errors) {
        return loginAndRegisterServices.registerPatient(patient, errors);
    }

    @PostMapping(path = "/counselor")
    public ResponseEntity createCounselor(@RequestBody @Valid Counselor counselor, Errors errors) {
        return loginAndRegisterServices.registerCounselor(counselor, errors);
    }

    @PostMapping(path = "/doctor")
    public ResponseEntity createDoctor(@RequestBody @Valid Doctor doctor, Errors errors) {
        return loginAndRegisterServices.registerDoctor(doctor, errors);
    }
}
