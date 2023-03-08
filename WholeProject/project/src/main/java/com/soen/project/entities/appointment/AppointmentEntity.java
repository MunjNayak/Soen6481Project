package com.soen.project.entities.appointment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "appointment")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(name = "patient_name", nullable = false)
    private String patientName;

    @Column(name = "patient_email", nullable = false)
    private String patientEmail;

    @Column(name = "worker_email", nullable = true)
    private String medicalWorkerEmail;

    @Column(name = "worker_name", nullable = true)
    private String medicalWorkerName;

    @Column(name = "with_counselor", nullable = true)
    private Boolean isWithCounselor;

    @Column(name = "date", nullable = true)
    private LocalDate appDate;

    @Column(name = "time", nullable = true)
    private String time;

    @Column(name = "timeSlot", nullable = true)
    private int timeSlot;       //e.g. slot 0 = 8:00, slot 1 = 8:15...

    @Column(name = "status", nullable = false)
    private String status;                          //pending review, scheduled, cancelled, completed

    @Column(name = "message", nullable = true)
    private String message;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public String getMedicalWorkerEmail() {
        return medicalWorkerEmail;
    }

    public void setMedicalWorkerEmail(String medicalWorkerEmail) {
        this.medicalWorkerEmail = medicalWorkerEmail;
    }

    public LocalDate getAppDate() {
            return appDate;
    }

    public void setAppDate(LocalDate appDate) {
        this.appDate = appDate;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public int getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(int timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getMedicalWorkerName() {
        return medicalWorkerName;
    }

    public void setMedicalWorkerName(String medicalWorkerName) {
        this.medicalWorkerName = medicalWorkerName;
    }

    public Boolean isWithCounselor() {
        return isWithCounselor;
    }

    public void setWithCounselor(Boolean withCounselor) {
        isWithCounselor = withCounselor;
    }
}


