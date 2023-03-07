package com.soen.project.services;

import com.soen.project.entities.LoginBean;
import com.soen.project.entities.user.Doctor;
import com.soen.project.entities.user.Counselor;
import com.soen.project.entities.user.Patient;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.Errors;

public interface LoginAndRegisterServicesInterface {
    ResponseEntity login(LoginBean body);
    ResponseEntity loginManger(LoginBean loginBean);
    ResponseEntity registerPatient(Patient patient, Errors errors);
    ResponseEntity registerCounselor(Counselor counselor, Errors errors);
    ResponseEntity registerDoctor(Doctor doctor, Errors errors);
}
