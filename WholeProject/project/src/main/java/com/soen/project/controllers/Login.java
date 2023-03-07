package com.soen.project.controllers;

import com.soen.project.entities.LoginBean;
import com.soen.project.entities.user.UserTypes;
import com.soen.project.repository.DoctorRepository;
import com.soen.project.repository.CounselorRepository;
import com.soen.project.repository.PatientRepository;
import com.soen.project.services.LoginAndRegisterServices;
import com.soen.project.services.UserCreation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import javax.servlet.http.HttpSession;

import static com.soen.project.utils.Constants.USER_TYPE;
import static com.soen.project.utils.HttpSession.getHttpSession;

@Controller
public class Login {

    @Autowired
    PatientRepository patientRepository;
    @Autowired
    CounselorRepository counselorRepository;
    @Autowired
    DoctorRepository doctorRepository;
    @Autowired
    LoginAndRegisterServices loginAndRegisterServices;
    @Autowired
    UserCreation userCreation;

    @GetMapping(value = "/")
    public String index() {
        HttpSession session = getHttpSession();
        if (session.getAttribute(USER_TYPE) == null) {
            return "login";
        } else if (session.getAttribute(USER_TYPE) == UserTypes.PATIENT) {
            return "patient_dashboard";
        } else if (session.getAttribute(USER_TYPE) == UserTypes.DOCTOR) {
            return "doctorPage";
        } else if (session.getAttribute(USER_TYPE) == UserTypes.COUNSELOR) {
            return "counselorPage2";
        } else if (session.getAttribute(USER_TYPE) == UserTypes.MANAGER) {
            return "managerPage";
        } else {
            throw new IllegalArgumentException("invalid user type");
        }
    }

    @GetMapping(value = "patient_dashboard")
    public String getPatientDashboard(){
        return "patient_dashboard";
    }

    @PostMapping(value = "/login")
    public ResponseEntity login(@RequestBody LoginBean loginBean) {
        return loginAndRegisterServices.login(loginBean);
    }

    @GetMapping(value = "/manage")
    public String loginManager() {
        return "loginManager";
    }

    @PostMapping(value = "/managerLogin")
    public ResponseEntity loginManager(@RequestBody LoginBean loginBean) {
        return loginAndRegisterServices.loginManger(loginBean);
    }

    @GetMapping(value = "/logout")
    public ResponseEntity logout() {
        HttpSession session = getHttpSession();
        session.invalidate();
        return new ResponseEntity("logged out", HttpStatus.OK);
    }

    @GetMapping(value ="/initializeUsers")
    public ResponseEntity initializeUsers() {
        return userCreation.createUsers();
    }
}
