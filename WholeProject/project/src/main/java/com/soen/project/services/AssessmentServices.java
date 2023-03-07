package com.soen.project.services;

import com.soen.project.entities.appointment.AppointmentEntity;
import com.soen.project.entities.assessment.Assessment;
import com.soen.project.entities.user.Patient;
import com.soen.project.entities.user.User;
import com.soen.project.entities.user.UserTypes;
import com.soen.project.repository.AppointmentRepository;
import com.soen.project.repository.AssessmentRepository;
import com.soen.project.repository.PatientRepository;
import com.soen.project.services.exception.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import javax.transaction.Transactional;
import java.time.LocalDate;
import java.util.Optional;

import static com.soen.project.utils.Constants.USER;
import static com.soen.project.utils.Constants.USER_TYPE;
import static com.soen.project.utils.HttpSession.getHttpSession;
import static com.soen.project.utils.HttpSession.updatePatientInSession;

@Service
public class AssessmentServices implements AssessmentServicesInterface {

    @Autowired
    AssessmentRepository assessmentRepository;
    @Autowired
    PatientRepository patientRepository;
    @Autowired
    AppointmentRepository appointmentRepository;
    @Autowired
    AppointmentServices appointmentServices;

    @Override
    public ResponseEntity saveAssessment(String body) {
        try {
            Assessment assessment = new Assessment();
            long patientId = getPatientIDFromSession();
            assessment.setJsonResponses(body);
            assessment.setPatientId(patientId);
            assessment.setDate(LocalDate.now());
            Assessment saved = assessmentRepository.save(assessment);
            updatePatientAssessment(patientId, saved);
            appointmentServices.createInitialAppointment();
            return new ResponseEntity("assessment saved", HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.PRECONDITION_FAILED);
        }
    }

    private void updatePatientAssessment(long patientId, Assessment saved) {
        Patient newPatient;
        Patient patient = patientRepository
                .findById(patientId)
                .get();
        patient.setAssessment_id(saved.getId());
        newPatient = patientRepository.save(patient);
        updatePatientInSession(newPatient);
    }

    private long getPatientIDFromSession() {
        HttpSession session = getHttpSession();
        long userId;
        UserTypes userType = (UserTypes) session.getAttribute(USER_TYPE);
        User user = (User) session.getAttribute("user");

        if (!UserTypes.PATIENT.equals(userType)) {
            throw new IllegalArgumentException("Only patient can perform self assessment");
        }
        userId = user.getId();
        return userId;
    }

    @Override
    public ResponseEntity getAssessment() {
        return getAssessmentFromPatient(tryToFindPatientFromSession());
    }

    public Optional<Patient> tryToFindPatientFromSession(){
        HttpSession session = getHttpSession();
        Patient patient;
        try {
            patient = (Patient)session.getAttribute("user");
            patient = patientRepository.findByEmail(patient.getEmail());
            return Optional.of(patient);
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private ResponseEntity getAssessmentFromPatient(Optional<Patient> optionalPatient) {
        Patient patient;
        Long assessmentId;
        Optional<Assessment> assessment;
        if(optionalPatient.isEmpty()){
            return new ResponseEntity("patient is not signed in", HttpStatus.UNAUTHORIZED);
        }
        patient = optionalPatient.get();

        if((assessmentId = patient.getAssessment_id()) == null){
            return new ResponseEntity("no assessments found", HttpStatus.NOT_FOUND);
        }
        assessment = assessmentRepository.findById(assessmentId);

        if(assessment.isEmpty()) {
            return new ResponseEntity("no assessments found", HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity(assessment.get().getJsonResponses(), HttpStatus.OK);
        }
    }

    @Override
    public ResponseEntity getAssessment(long patientId){
        Optional<Patient> optionalPatient;
        optionalPatient = patientRepository.findById(patientId);
        return getAssessmentFromPatient(optionalPatient);
    }

    @Override
    public ResponseEntity getAssessment(String patientEmail) {
        Optional<Patient> optionalPatient;
        optionalPatient = Optional.ofNullable(patientRepository.findByEmail(patientEmail));
        return getAssessmentFromPatient(optionalPatient);
    }

    @Override
    public ResponseEntity canRedoAssessment() {
        try {
            Patient patient = (Patient)getHttpSession().getAttribute(USER);
            AppointmentEntity appointment = appointmentRepository.findById(patient.getAppointmentId()).get();
            if(appointment.getStatus().equals("pending review")){
                return ResponseEntity.status(HttpStatus.OK).body(true);
            }
            return ResponseEntity.status(HttpStatus.OK).body(false);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.OK).body(false);
        }
    }

    @Override
    @Transactional
    public ResponseEntity deleteAssessment() {
        try {
            verifyCanRedoAssessment();
            handleDeleteAssessment();
            return ResponseEntity.ok().build();
        } catch (ServiceException e){
            return e.getResponse();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void verifyCanRedoAssessment() throws ServiceException {
        if (canRedoAssessment().getBody().equals(false)) {
            throw new ServiceException(ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).build());
        }
    }

    private void handleDeleteAssessment() {
        Patient patient = (Patient)getHttpSession().getAttribute(USER);
        patient = patientRepository.findById(patient.getId()).get();
        assessmentRepository.deleteAllByPatientId(patient.getId());
        appointmentRepository.deleteAllByPatientEmail(patient.getEmail());
        patient.setAppointmentId(null);
        patient.setAssessment_id(null);
        updatePatientInSession(patient);
        patientRepository.save(patient);
    }
}
