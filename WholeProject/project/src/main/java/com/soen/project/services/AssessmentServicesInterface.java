package com.soen.project.services;

import org.springframework.http.ResponseEntity;

public interface AssessmentServicesInterface {
    ResponseEntity saveAssessment(String body);
    ResponseEntity getAssessment();
    ResponseEntity getAssessment(long patientId);
    ResponseEntity getAssessment(String patientEmail);
    ResponseEntity canRedoAssessment();
    ResponseEntity deleteAssessment();
}
