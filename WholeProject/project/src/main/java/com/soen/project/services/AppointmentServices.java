package com.soen.project.services;

import com.soen.project.entities.appointment.AppointmentEntity;
import com.soen.project.entities.user.Patient;
import com.soen.project.entities.user.User;
import com.soen.project.entities.user.UserTypes;
import com.soen.project.repository.AppointmentRepository;
import com.soen.project.repository.DoctorRepository;
import com.soen.project.repository.CounselorRepository;
import com.soen.project.repository.PatientRepository;
import com.soen.project.services.exception.ServiceException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.soen.project.entities.appointment.TimeSlots.timeslots;
import static com.soen.project.entities.user.UserTypes.*;
import static com.soen.project.utils.Constants.USER;
import static com.soen.project.utils.Constants.USER_TYPE;
import static com.soen.project.utils.HttpSession.*;

@Service
public class AppointmentServices implements AppointmentServicesInterface {

    @Autowired
    AppointmentRepository appointmentRepository;
    @Autowired
    PatientRepository patientRepository;
    @Autowired
    CounselorRepository counselorRepository;
    @Autowired
    DoctorRepository doctorRepository;


    @Override
    public ResponseEntity createInitialAppointment() {
        try {
            verifyUserIsPatient();
            Patient patient = (Patient)getHttpSession().getAttribute(USER);
            AppointmentEntity appointment = new AppointmentEntity();
            appointment.setPatientEmail(patient.getEmail());
            appointment.setAppDate(null);
            appointment.setStatus("pending review");
            appointment.setMessage("You completed a self-assessment on " + getCurrentDate() + " at " + getCurrentTime()
                            + ". Please wait for a counselor to review your self-assessment and follow-up with you.");
            appointment.setPatientName(patient.getFirstName() + " " + patient.getLastName());
            return createAppointment(appointment);
        } catch (ServiceException e){
            return e.getResponse();
        } catch (Exception e){
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void verifyUserIsPatient() throws ServiceException {
        if(!userIsPatient()){
            throw new ServiceException(new ResponseEntity(
                    "only a patient can make initial appointment", HttpStatus.UNAUTHORIZED));
        }
    }

    private String getCurrentDate() {
        LocalDateTime dateTime = LocalDateTime.now();
        return dateTime.getMonthValue() + "/" + dateTime.getDayOfMonth() + "/" + dateTime.getYear();
    }

    private String getCurrentTime() {
        LocalDateTime dateTime = LocalDateTime.now();
        String hour = Integer.toString(dateTime.getHour());
        String minute = Integer.toString(dateTime.getMinute());
        if(hour.length() == 1){
            hour = "0" + hour;
        }
        if(minute.length() == 1){
            minute = "0" + minute;
        }
        return hour + ":" + minute;
    }

    @Override
    public ResponseEntity createAppointment(AppointmentEntity appointment) {
        try {
            Patient patient;
            if(appointment.getPatientEmail() != null){
                patient = getPatientFromEmail(appointment);
            } else {
                patient = (Patient)getHttpSession().getAttribute(USER);
                patient = patientRepository.findById(patient.getId()).get();
            }

            if(appointment.getStatus().equals("pending review")){
                deleteOldPatientAppointment(patient);
                return createInitialAppointment(patient, appointment);
            }
            if (appointment.getStatus().equals("cancelled")) {
                return handleRefusedAppointment(appointment, patient);
            }
            if(appointment.getStatus().equals("scheduled")){
                return handleScheduledAppointment(appointment, patient);
            }
            if(appointment.getStatus().equals("completed")){
                return handleCompletedAppointment(appointment, patient);
            }
            if(appointment.getStatus().equals("manager cancelled")) {
                return handleManageDeletion(patient);
            }
        } catch (ServiceException e) {
            return e.getResponse();
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return new ResponseEntity("unable to create appointment", HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private void deleteOldPatientAppointment(Patient patient) {
        AppointmentEntity appointment = appointmentRepository.findByPatientEmail(patient.getEmail());
        if (appointment != null) appointmentRepository.delete(appointment);
    }

    private Patient getPatientFromEmail(AppointmentEntity appointment) throws ServiceException {
        try {
            Patient patient;
            patient = patientRepository.findByEmail(appointment.getPatientEmail());
            return patient;
        } catch (Exception e){
            throw new ServiceException(new ResponseEntity("patient not found", HttpStatus.NOT_FOUND));
        }
    }

    private ResponseEntity createInitialAppointment(Patient patient, AppointmentEntity appointment) {
        AppointmentEntity savedAppointment;
        savedAppointment = initializePendingAppointment(appointment);
        updatePatientAppointment(patient, savedAppointment);
        return new ResponseEntity(savedAppointment, HttpStatus.OK);
    }

    private AppointmentEntity initializePendingAppointment(AppointmentEntity appointment) {
        appointment.setMedicalWorkerEmail("");
        appointment.setMedicalWorkerName("");
        appointment.setWithCounselor(null);
        return appointmentRepository.save(appointment);
    }

    private void updatePatientAppointment(Patient patient, AppointmentEntity appointment) {
        patient.setAppointmentId(appointment.getId());
        updatePatientInSession(patientRepository.save(patient));
    }

    private ResponseEntity handleRefusedAppointment(AppointmentEntity appointment, Patient patient) {
        AppointmentEntity refused = getRefusedAppointment(appointment, patient);
        patient.setAssessment_id(null);
        updatePatientAppointment(patient, refused);
        return new ResponseEntity(refused, HttpStatus.OK);
    }

    private AppointmentEntity getRefusedAppointment(AppointmentEntity appointment, Patient patient) {
        AppointmentEntity refused;
        refused = setRefusedAttributes(patient, appointment);
        appointmentRepository.save(refused);
        return refused;
    }

    private AppointmentEntity setRefusedAttributes(Patient patient, AppointmentEntity appointment) {
        UserTypes type = (UserTypes)getHttpSession().getAttribute(USER_TYPE);
        if(type == UserTypes.PATIENT){
            return setAttributesForPatientRefused(patient, appointment);
        } else {
            return setAttributesForHealthcareWorkerRefused(patient, appointment, type);
        }
    }

    private AppointmentEntity setAttributesForPatientRefused(Patient patient, AppointmentEntity appointment) {
        AppointmentEntity refused;
        refused = appointmentRepository.findByPatientEmail(patient.getEmail());
        refused.setMessage("On " + getCurrentDate() + " at " + getCurrentTime() + " you cancelled your appointment. " +
                "You may redo the self-assessment in the future.");
        refused.setStatus(appointment.getStatus());
        return refused;
    }

    private AppointmentEntity setAttributesForHealthcareWorkerRefused
            (Patient patient, AppointmentEntity appointment, UserTypes type) {
        User user = (User) getHttpSession().getAttribute(USER);
        AppointmentEntity refused;
        refused = appointmentRepository.findByPatientEmail(patient.getEmail());
        if(type == COUNSELOR) refused.setWithCounselor(true);
        else if(type == DOCTOR) refused.setWithCounselor(false);
        refused.setMedicalWorkerName(user.getFirstName() + " " + user.getLastName());
        refused.setMessage("The healthcare professional indicated has reviewed your self-assessment on "
                + getCurrentDate() + " at " + getCurrentTime() + " and determined that no appointment is necessary. " +
                "You may redo the self-assessment in the future.");
        refused.setStatus(appointment.getStatus());
        return refused;
    }

    private ResponseEntity handleManageDeletion(Patient patient) {
        AppointmentEntity refused;
        refused = appointmentRepository.findByPatientEmail(patient.getEmail());
        refused.setStatus("pending review");
        refused.setTime(null);
        refused.setWithCounselor(null);
        refused.setMedicalWorkerName(null);
        refused.setMedicalWorkerEmail(null);
        refused.setAppDate(null);
        refused.setMessage("Unfortunately, your appointment has been cancelled as the healthcare professional with whom " +
                "you were scheduled is no longer available. Please wait for a counselor to review again your assessment.");
        appointmentRepository.save(refused);
        return ResponseEntity.ok().body(refused);
    }

    private ResponseEntity handleScheduledAppointment(AppointmentEntity appointment, Patient patient) throws ServiceException {
        AppointmentEntity pending = appointmentRepository.findByPatientEmail(appointment.getPatientEmail());
        User healthcareWorker = findHealthCareWorker(appointment);
        ensureNoScheduleConflict(healthcareWorker, appointment);
        setScheduleAttributes(appointment, pending, healthcareWorker);
        return new ResponseEntity(appointmentRepository.save(pending), HttpStatus.OK);
    }

    private User findHealthCareWorker(AppointmentEntity appointment) throws ServiceException {
        User healthcareWorker = counselorRepository.findByEmail(appointment.getMedicalWorkerEmail());
        if(healthcareWorker == null) {
            healthcareWorker = doctorRepository.findByEmail(appointment.getMedicalWorkerEmail());
            appointment.setWithCounselor(false);
        } else {
            appointment.setWithCounselor(true);
        }
        if(healthcareWorker == null) {
            appointment.setWithCounselor(null);
            throw new ServiceException(new ResponseEntity("worker not found", HttpStatus.NOT_FOUND));
        }
        return healthcareWorker;
    }

    private void ensureNoScheduleConflict(User healthcareWorker, AppointmentEntity appointment) throws ServiceException {
        List<AppointmentEntity> scheduled = appointmentRepository.findByMedicalWorkerEmail(healthcareWorker.getEmail());
        Optional<ServiceException> e = scheduled.stream()
                .filter(bookedAppoint -> isConflict(appointment, bookedAppoint))
                .findAny()
                .map(conflict -> new ServiceException(new ResponseEntity("conflict", HttpStatus.PRECONDITION_FAILED)));
        if(e.isPresent()){
            throw e.get();
        }
    }

    private boolean isConflict(AppointmentEntity appointment, AppointmentEntity bookedAppoint) {
        return bookedAppoint.getAppDate().equals(appointment.getAppDate()) &&
                bookedAppoint.getTimeSlot() == appointment.getTimeSlot();
    }

    private void setScheduleAttributes(AppointmentEntity appointment, AppointmentEntity pending, User healthcareWorker) {
        pending.setMedicalWorkerEmail(appointment.getMedicalWorkerEmail());
        pending.setWithCounselor(appointment.isWithCounselor());
        pending.setMedicalWorkerName(healthcareWorker.getFirstName() + " " + healthcareWorker.getLastName());
        pending.setMessage(getScheduledMessage());
        pending.setStatus(appointment.getStatus());
        pending.setAppDate(appointment.getAppDate());
        pending.setTimeSlot(appointment.getTimeSlot());
        pending.setTime(timeslots.get(appointment.getTimeSlot()));
        appointmentRepository.save(pending);
    }

    private String getScheduledMessage() {
        return "You have an appointment with the healthcare professional indicated at the scheduled time.";
    }

    private ResponseEntity handleCompletedAppointment(AppointmentEntity appointment, Patient patient) {
        AppointmentEntity completed;
        completed = appointmentRepository.findByPatientEmail(patient.getEmail());
        setCompletedAttributes(appointment, completed);
        updatePatientAndRepo(patient, completed);
        return new ResponseEntity(completed, HttpStatus.OK);
    }

    private void updatePatientAndRepo(Patient patient, AppointmentEntity completed) {
        patient.setAssessment_id(null);
        updatePatientAppointment(patient, completed);
        appointmentRepository.save(completed);
    }

    private void setCompletedAttributes(AppointmentEntity appointment, AppointmentEntity completed) {
        completed.setAppDate(LocalDate.now());
        completed.setMessage(appointment.getMessage());
        completed.setStatus(appointment.getStatus());
    }

    @Override
    public ResponseEntity getAppointment() {
        try {
            Patient patient = findPatient();
            AppointmentEntity appointment = findAppointment(patient);
            return new ResponseEntity(appointment, HttpStatus.OK);
        } catch (ServiceException e) {
            return e.getResponse();
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private Patient findPatient() throws ServiceException {
        try {
            Patient patient = (Patient) getHttpSession().getAttribute(USER);
            patient = patientRepository.getById(patient.getId());
            return patient;
        } catch (Exception e) {
            throw new ServiceException(new ResponseEntity("patient not found", HttpStatus.NOT_FOUND));
        }
    }

    private AppointmentEntity findAppointment(Patient patient) throws ServiceException {
        try {
            return appointmentRepository.getById(patient.getAppointmentId());
        } catch (Exception e) {
            throw new ServiceException(new ResponseEntity("appointment not found", HttpStatus.NOT_FOUND));
        }
    }

    @Override
    public ResponseEntity getAppointment(long patientId) {
        return null;
    }

    @Override
    public ResponseEntity getAppointments(String workerEmail, LocalDate date) {
        try {
            User user;
            List<Integer> usedSlots;
            verifyUserIsCounselorOrDoctor();
            user = getUserFromEmail(workerEmail);
            usedSlots = getSlots(findAppointments(user), date);
            return new ResponseEntity(Map.of("timeslots", timeslots, "appointments", usedSlots), HttpStatus.OK);
        } catch (ServiceException e) {
            return e.getResponse();
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private User getUserFromEmail(String workerEmail) throws ServiceException {
        User user = doctorRepository.findByEmail(workerEmail);
        if (user == null) {
            user = counselorRepository.findByEmail(workerEmail);
        }
        if (user == null) {
            throw new ServiceException(new ResponseEntity("unable to find worker", HttpStatus.NOT_FOUND));
        }
        return user;
    }

    @Override
    public ResponseEntity getAppointments() {
        try {
            User user;
            List<AppointmentEntity> appointments;
            user = findUser();
            verifyUserIsCounselorOrDoctor();
            appointments = findAppointments(user);
            return new ResponseEntity(appointments, HttpStatus.OK);
        } catch (ServiceException e) {
            return e.getResponse();
        } catch (Exception e) {
            return new ResponseEntity(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private User findUser() throws ServiceException {
        try {
            return (User) getHttpSession().getAttribute(USER);
        } catch (Exception e) {
            throw new ServiceException(new ResponseEntity("not logged in", HttpStatus.UNAUTHORIZED));
        }
    }

    private void verifyUserIsCounselorOrDoctor() throws ServiceException {
        try {
            UserTypes type = (UserTypes) getHttpSession().getAttribute(USER_TYPE);
            if (type.equals(COUNSELOR) || type.equals(DOCTOR)) {
                return;
            }
            throw new ServiceException(
                    new ResponseEntity("only counselor or doctor can get appointments", HttpStatus.UNAUTHORIZED));
        } catch (ServiceException e) {
            throw e;
        } catch (Exception e) {
            throw new ServiceException(new ResponseEntity("logged in user not found", HttpStatus.UNAUTHORIZED));
        }
    }

    private List<AppointmentEntity> findAppointments(User user) throws ServiceException {
        try {
            return appointmentRepository.findByMedicalWorkerEmail(user.getEmail())
                    .stream()
                    .filter(appointment -> appointment.getStatus().equals("scheduled"))
                    .sorted((app1, app2) -> {
                      if(app1.getAppDate().compareTo(app2.getAppDate()) == 0) {
                          return Integer.compare(app1.getTimeSlot(), app2.getTimeSlot());
                      }
                      return app1.getAppDate().compareTo(app2.getAppDate());
                    })
                    .collect(Collectors.toList());
        } catch (Exception e){
            throw new ServiceException(new ResponseEntity("appointments not found", HttpStatus.NOT_FOUND));
        }
    }

    private List<Integer> getSlots(List<AppointmentEntity> appointments, LocalDate date) {
        return appointments.stream()
                .filter(scheduled -> scheduled.getAppDate().equals(date))
                .map(AppointmentEntity::getTimeSlot)
                .collect(Collectors.toList());
    }
}
