package com.soen.project.services;

import com.soen.project.entities.appointment.AppointmentEntity;
import com.soen.project.entities.assessment.Assessment;
import com.soen.project.entities.user.*;
import com.soen.project.repository.*;
import com.soen.project.services.exception.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

import static com.soen.project.entities.user.UserTypes.DOCTOR;
import static com.soen.project.entities.user.UserTypes.COUNSELOR;
import static com.soen.project.utils.Constants.USER;
import static com.soen.project.utils.HttpSession.*;

@Service
public class UserAccessServices implements UserAccessServicesInterface {

    @Autowired
    AppointmentServices appointmentServices;
    @Autowired
    PatientRepository patientRepository;
    @Autowired
    CounselorRepository counselorRepository;
    @Autowired
    DoctorRepository doctorRepository;
    @Autowired
    AppointmentRepository appointmentRepository;
    @Autowired
    AssessmentRepository assessmentRepository;

    @Override
    public ResponseEntity getAllPatients() {
        if(!userIsCounselor() && !userIsManager()) {
            return new ResponseEntity("Only a counselor or manager can get all patients", HttpStatus.UNAUTHORIZED);
        }
        List<Patient> patientList = getAllPatientsFromRepo();
        return new ResponseEntity(patientList, HttpStatus.OK);
    }

    @Override
    public ResponseEntity getPatient(long id) {
        Optional<Patient> optionalPatient;
        Patient patient;

        if(!userIsCounselorOrDoctor()) {
            return new ResponseEntity("Only a counselor/doctor can get a patient", HttpStatus.UNAUTHORIZED);
        }
        optionalPatient = patientRepository.findById(id);

        if(optionalPatient.isEmpty()){
            return new ResponseEntity("Patient not found", HttpStatus.NOT_FOUND);
        }
        patient = optionalPatient.get();
        patient.setPassword(null);

        return new ResponseEntity(patient, HttpStatus.OK);
    }

    @Override
    public ResponseEntity getCurrentUser() {
        User user;
        try {
            user = (User) getHttpSession().getAttribute(USER);
        } catch (Exception e) {
            return new ResponseEntity("user not logged in", HttpStatus.UNAUTHORIZED);
        }
        user.setPassword(null);
        return new ResponseEntity(user, HttpStatus.OK);
    }

    @Override
    public ResponseEntity getPatientsWhoNeedAppointment() {
        try {
            verifyUserIsCounselorOrManager();
            List<Patient> patientList = getAllPatientsFromRepo();
            Set<String> emailsOfPatientsDontNeedAppointment = getEmailsOfPatientsDontNeedAppointment();
            patientList = getPatientsListWhoNeedAppointment(patientList, emailsOfPatientsDontNeedAppointment);
            return new ResponseEntity(patientList, HttpStatus.OK);
        } catch (ServiceException e){
            return e.getResponse();
        } catch (Exception e) {
            return new ResponseEntity("unable to get patient list", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public void verifyUserIsCounselorOrManager() throws ServiceException {
        if(!userIsCounselor() && !userIsManager()) {
            throw new ServiceException(new ResponseEntity("Only a counselor or manager can get all patients", HttpStatus.UNAUTHORIZED));
        }
    }

    private List<Patient> getAllPatientsFromRepo() {
        List<Patient> patientList = patientRepository.findAll()
                .stream().sorted(Comparator.comparing(Patient::getLastName)).collect(Collectors.toList());
        patientList.forEach(patient -> patient.setPassword(null));
        return patientList;
    }

    private Set<String> getEmailsOfPatientsDontNeedAppointment() {
        return appointmentRepository
                .findAll()
                .stream()
                .filter(this::appointmentStatusDoesNotNeedAppointment)
                .map(AppointmentEntity::getPatientEmail)
                .collect(Collectors.toSet());
    }

    private boolean appointmentStatusDoesNotNeedAppointment(AppointmentEntity appointment) {
        return appointment.getStatus().equals("scheduled");
    }

    private List<Patient> getPatientsListWhoNeedAppointment(List<Patient> patientList, Set<String> patEmailsWhoDontNeedAppointment) {
        patientList = patientList
                .stream()
                .filter(patient -> !patEmailsWhoDontNeedAppointment.contains(patient.getEmail()))
                .collect(Collectors.toList());

        return sortListWithNeedsAppointmentInFront(patientList);
    }

    private List<Patient> sortListWithNeedsAppointmentInFront(List<Patient> patientList) {
        List<Patient> needsApp = new ArrayList<>();
        List<Patient> notNeedsApp = new ArrayList<>();

        for(Patient patient : patientList) {
            Long appointmentId = patient.getAppointmentId();
            if(appointmentId != null && appointmentRepository.getById(appointmentId).getStatus().equals("pending review")) {
                needsApp.add(patient);
            } else {
                notNeedsApp.add(patient);
            }
        }

        needsApp = needsApp
                .stream()
                .sorted(Comparator.comparing(Patient::getLastName))
                .collect(Collectors.toList());
        notNeedsApp = notNeedsApp
                .stream()
                .sorted(Comparator.comparing(Patient::getLastName))
                .collect(Collectors.toList());

        needsApp.addAll(notNeedsApp);

        return needsApp;
    }

    @Override
    public ResponseEntity getWorkers() {
        try {
            verifyUserIsCounselorOrManager();
            Map<String, List<User>> workersMap;
            List<User> counselors = getCounselorsFromRepo();
            List<User> doctors = getDoctorsFromRepo();
            workersMap = Map.of("counselors", counselors, "doctors", doctors);
            return ResponseEntity.status(HttpStatus.OK).body(workersMap);
        } catch (ServiceException e){
            return e.getResponse();
        } catch(Exception e){
            return new ResponseEntity("unable to get worker list", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public ResponseEntity getUser(String email) {
        User user;

        if(!userIsCounselorOrDoctor() && !userIsManager()) {
            return new ResponseEntity("Only a counselor/doctor/manager can get a user", HttpStatus.UNAUTHORIZED);
        }

        if((user = patientRepository.findByEmail(email)) != null) {
            user.setPassword(null);
            return new ResponseEntity(user, HttpStatus.OK);
        }

        if((user = counselorRepository.findByEmail(email)) != null) {
            user.setPassword(null);
            return new ResponseEntity(user, HttpStatus.OK);
        }

        if((user = doctorRepository.findByEmail(email)) != null) {
            user.setPassword(null);
            return new ResponseEntity(user, HttpStatus.OK);
        }

        return new ResponseEntity("User not found", HttpStatus.NOT_FOUND);
    }

    @Override
    @Transactional
    public ResponseEntity deleteUser(String email) {
        User user;

        if((user = patientRepository.findByEmail(email)) != null) {
            return handleDeletePatient(email, user);
        }

        if((user = counselorRepository.findByEmail(email)) != null) {
            return handleDeleteWorker(user, COUNSELOR);
        }

        if((user = doctorRepository.findByEmail(email)) != null) {
            return handleDeleteWorker(user, DOCTOR);
        }

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .build();
    }

    private ResponseEntity handleDeletePatient(String email, User user) {

        if(!userIsCounselorOrDoctor() && !userIsManager()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        patientRepository.deleteById(user.getId());
        appointmentRepository.deleteAllByPatientEmail(email);
        assessmentRepository.deleteAllByPatientId(user.getId());

        return ResponseEntity
                .ok()
                .build();
    }

    private ResponseEntity handleDeleteWorker(User user, UserTypes type) {
        if(!userIsManager()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Only a manager can delete a counselor/doctor");
        }

        List<AppointmentEntity> appToCancel = appointmentRepository.findByMedicalWorkerEmail(user.getEmail());
        appToCancel.forEach(appointment -> {
            appointment.setStatus("manager cancelled");
            appointmentServices.createAppointment(appointment);
        });

        if(type == COUNSELOR) {
            counselorRepository.delete((Counselor)user);
        } else {
            doctorRepository.delete((Doctor)user);
        }

        return ResponseEntity.ok().build();
    }

    @Override
    public ResponseEntity activateUser(String email) {
        if(!userIsManager()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Only a manager can delete a counselor/doctor");
        }
        User user;
        if((user = counselorRepository.findByEmail(email)) != null) {
            ((Counselor)user).setActivated(true);
            counselorRepository.save(((Counselor)user));
            return ResponseEntity.ok().build();
        }
        if((user = doctorRepository.findByEmail(email)) != null) {
            ((Doctor)user).setActivated(true);
            doctorRepository.save(((Doctor)user));
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    private List<User> getDoctorsFromRepo() {
        return doctorRepository
                .findAll()
                .stream()
                .filter(doctor -> {
                    if(!userIsManager()) {
                        return doctor.isActivated();
                    }
                    return true;
                }).sorted((a,b) -> {
                    if(a.isActivated() && !b.isActivated()) {
                        return +1;
                    } else if (!a.isActivated() && b.isActivated()) {
                        return -1;
                    } else {
                        return 0;
                    }
                })
                .map(doctor -> {
                    ((User) doctor).setPassword(null);
                    return (User) doctor;
                })
                .collect(Collectors.toList());
    }

    private List<User> getCounselorsFromRepo() {
        return counselorRepository
                .findAll()
                .stream()
                .filter(counselor -> {
                    if(!userIsManager()) {
                        return counselor.isActivated();
                    }
                    return true;
                }).sorted((a,b) -> {
                    if(a.isActivated() && !b.isActivated()) {
                        return +1;
                    } else if (!a.isActivated() && b.isActivated()) {
                        return -1;
                    } else {
                        return 0;
                    }
                })
                .map(counselor -> {
                    ((User) counselor).setPassword(null);
                    return (User) counselor;
                })
                .collect(Collectors.toList());
    }

    @Override
    public ResponseEntity getStatistics(String date) {
        LocalDate localDate = LocalDate.parse(date);
        int weekNum = localDate.get(WeekFields.ISO.weekOfWeekBasedYear());
        List<Patient> patients = patientRepository.findAll();
        int registeredOnDay = (int)patients.stream()
                .filter(patient -> patient.getDateCreated().equals(localDate))
                .count();
        int registeredInWeek = (int)patients.stream()
                .filter(patient -> patient.getDateCreated().get(WeekFields.ISO.weekOfWeekBasedYear()) == weekNum)
                .count();
        int registeredInMonth = (int)patients.stream()
                .filter(patient -> patient.getDateCreated().getMonthValue() == localDate.getMonthValue())
                .count();

        List<Assessment> assessments = assessmentRepository.findAll();

        int assessmentsOnDay = (int)assessments.stream()
                .filter(assessment -> assessment.getDate().equals(localDate))
                .count();
        int assessmentsInWeek = (int)assessments.stream()
                .filter(assessment -> assessment.getDate().get(WeekFields.ISO.weekOfWeekBasedYear()) == weekNum)
                .count();
        int assessmentsInMonth = (int)assessments.stream()
                .filter(assessment -> assessment.getDate().getMonthValue() == localDate.getMonthValue())
                .count();

        Map<String, Integer> stats = Map.of(
                "regOnDay", registeredOnDay, "regInWeek", registeredInWeek, "regInMonth", registeredInMonth,
                "assessOnDay", assessmentsOnDay, "assessInWeek", assessmentsInWeek, "assessInMonth", assessmentsInMonth);

        return ResponseEntity.ok().body(stats);
    }
}
