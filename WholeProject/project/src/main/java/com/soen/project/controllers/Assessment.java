package com.soen.project.controllers;

import com.soen.project.services.AssessmentServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class Assessment {

    @Autowired
    AssessmentServices assessmentServices;

    @GetMapping(value = "/templates/patient-assessment.html")
    public String getAssessmentContent(){
        return "assessment_content";
    }

    @GetMapping(value = "/patient_assessment")
    public String patientAssessmentPage(){
        return "patient_assessment";
    }

    @GetMapping(value = "/assessment")
    public ResponseEntity getAssessment(){
        return assessmentServices.getAssessment();
    }

    @GetMapping(value = "/assessmentFromPatientWithID")
    public ResponseEntity getAssessment(@RequestParam long patientId){
        return assessmentServices.getAssessment(patientId);
    }

    @GetMapping(value = "/assessmentFromPatientWithEmail")
    public ResponseEntity getAssessment(@RequestParam String patientEmail){
        return assessmentServices.getAssessment(patientEmail);
    }

    @PostMapping(value = "/assessment")
    public ResponseEntity postAssessment(@RequestBody String body){
        return assessmentServices.saveAssessment(body);
    }

    @GetMapping(value = "/canRedoAssessment")
    public ResponseEntity checkIfPatientCanRedoAssessment(){
        return assessmentServices.canRedoAssessment();
    }

    @GetMapping(value = "/deleteAssessment")
    public ResponseEntity deleteAssessment() {
        return assessmentServices.deleteAssessment();
    }
}
