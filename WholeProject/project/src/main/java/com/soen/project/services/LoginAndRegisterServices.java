package com.soen.project.services;

import com.soen.project.entities.LoginBean;
import com.soen.project.entities.user.*;
import com.soen.project.repository.DoctorRepository;
import com.soen.project.repository.ManagerRepository;
import com.soen.project.repository.CounselorRepository;
import com.soen.project.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.validation.Errors;
import org.springframework.validation.FieldError;

import javax.servlet.http.HttpSession;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static com.soen.project.utils.Constants.USER;
import static com.soen.project.utils.Constants.USER_TYPE;
import static com.soen.project.utils.HttpSession.getHttpSession;
import static com.soen.project.utils.HttpSession.updatePatientInSession;

@Service
public class LoginAndRegisterServices implements LoginAndRegisterServicesInterface {

    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private CounselorRepository counselorRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private ManagerRepository managerRepository;
    @Autowired
    private MessageDigest digest;

    @Override
    public ResponseEntity login(LoginBean loginBean) {
        HttpSession session = getHttpSession();
        String email = loginBean.getEmail();
        String password = loginBean.getPassword();

        if (patientFound(session, email, password) || (counselorFound(session, email, password)) ||
                (doctorFound(session, email, password))) {
            return new ResponseEntity<>("user login successful", HttpStatus.OK);
        }
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("login unsuccessful");
    }

    @Override
    public ResponseEntity loginManger(LoginBean loginBean) {
        HttpSession session = getHttpSession();
        String email = loginBean.getEmail();
        String password = loginBean.getPassword();
        if(managerFound(session, email, password)) {
            return new ResponseEntity<>("user login successful", HttpStatus.OK);
        }
        return new ResponseEntity<>("login unsucessful", HttpStatus.UNAUTHORIZED);
    }

    private boolean patientFound(HttpSession session, String email, String password) {
        Patient patient;
        if ((patient = patientRepository.findByEmail(email)) != null && passwordChecker(patient, password)) {
            session.setAttribute(USER_TYPE, UserTypes.PATIENT);
            session.setAttribute(USER, patient);
            return true;
        }
        return false;
    }

    private boolean counselorFound(HttpSession session, String email, String password) {
        Counselor counselor;
        if ((counselor = counselorRepository.findByEmail(email)) != null && counselor.isActivated() && passwordChecker(counselor, password)) {
            session.setAttribute(USER_TYPE, UserTypes.COUNSELOR);
            session.setAttribute(USER, counselor);
            return true;
        }
        return false;
    }

    private boolean doctorFound(HttpSession session, String email, String password) {
        Doctor doctor;
        if ((doctor = doctorRepository.findByEmail(email)) != null && doctor.isActivated() &&  passwordChecker(doctor, password)) {
            session.setAttribute(USER_TYPE, UserTypes.DOCTOR);
            session.setAttribute(USER, doctor);
            return true;
        }
        return false;
    }

    private boolean managerFound(HttpSession session, String email, String password) {
        Manager manager;
        if((manager = managerRepository.findByEmail(email)) != null && manager.getPassword().equals(password)){
            session.setAttribute(USER_TYPE, UserTypes.MANAGER);
            session.setAttribute(USER, manager);
            return true;
        }
        return false;
    }

    @Override
    public ResponseEntity registerPatient(Patient patient, Errors errors) {
        if(errors.hasErrors()) {
            return handleFieldErrors(errors);
        }
        if(!emailIsUnique(patient.getEmail())){
            return handleNotUniqueEmail();
        }
        if(!validBirthDay(patient)){
            return handleInvalidBirthday();
        }
        setCreatedDate(patient);
        hashPassword(patient);
        try {
            patient.setAssessment_id(null);
            updatePatientInSession(patientRepository.save(patient));
            return new ResponseEntity<>(patient, HttpStatus.CREATED);
        } catch (Exception e) {
            return handleNotUniqueEmail();
        }
    }

    @Override
    public ResponseEntity registerCounselor(Counselor counselor, Errors errors) {
        if(errors.hasErrors()) {
            return handleFieldErrors(errors);
        }
        if(!emailIsUnique(counselor.getEmail())){
            return handleNotUniqueEmail();
        }
        if(!validBirthDay(counselor)){
            return handleInvalidBirthday();
        }
        setCreatedDate(counselor);
        hashPassword(counselor);
        if(counselor.isActivated() == null) {
            counselor.setActivated(false);
        }
        try {
            counselorRepository.save(counselor);
            return new ResponseEntity<>(counselor, HttpStatus.CREATED);
        } catch (Exception e) {
            return handleNotUniqueEmail();
        }
    }

    @Override
    public ResponseEntity registerDoctor(Doctor doctor, Errors errors) {
        if(errors.hasErrors()) {
            return handleFieldErrors(errors);
        }
        if(!emailIsUnique(doctor.getEmail())){
            return handleNotUniqueEmail();
        }
        if(!validBirthDay(doctor)){
            return handleInvalidBirthday();
        }
        setCreatedDate(doctor);
        hashPassword(doctor);
        if(doctor.isActivated() == null) {
            doctor.setActivated(false);
        }
        try {
            doctorRepository.save(doctor);
            return new ResponseEntity<>(doctor, HttpStatus.CREATED);
        } catch (Exception e) {
            return handleNotUniqueEmail();
        }
    }

    private boolean validBirthDay(User user){
        try {
            SimpleDateFormat format = new SimpleDateFormat("MMMMM dd yyyy");
            format.setLenient(false);
            format.parse(String.format("%s %s %s", user.getMonthOfBirth(), user.getDayOfBirth(), user.getYearOfBirth()));
        } catch (ParseException e){
            return false;
        }
        return true;
    }

    private ResponseEntity handleInvalidBirthday(){
        return ResponseEntity
                .status(HttpStatus.PRECONDITION_FAILED)
                .body(Map.of("errorFields", List.of("dayOfBirth", "monthOfBirth", "yearOfBirth")));
    }

    private boolean emailIsUnique(String email) {
        return patientRepository.findByEmail(email) == null &&
                counselorRepository.findByEmail(email) == null &&
                doctorRepository.findByEmail(email) == null;
    }

    private ResponseEntity handleNotUniqueEmail() {
        return ResponseEntity
                .status(HttpStatus.PRECONDITION_FAILED)
                .body(Map.of("errorFields", List.of("email")));
    }

    private boolean passwordChecker(User user, String password) {
        String hashed = new String(digest.digest(password.getBytes(StandardCharsets.UTF_8)));
        return user.getPassword().equals(hashed);
    }

    private void hashPassword(User user) {
        String oldPass = user.getPassword();
        String hashed = new String(digest.digest(oldPass.getBytes(StandardCharsets.UTF_8)));
        user.setPassword(hashed);
    }

    private void setCreatedDate(User user) {
        if(user.getDateCreated() == null) {
            user.setDateCreated(LocalDate.now());
        }
    }

    private ResponseEntity handleFieldErrors(Errors errors) {
        List<String> errorFields = errors
                .getFieldErrors()
                .stream()
                .map(FieldError::getField)
                .collect(Collectors.toList());
        Map<String, List<String>> map = Map.of("errorFields", errorFields);
        return new ResponseEntity<>(map, HttpStatus.PRECONDITION_FAILED);
    }
}
