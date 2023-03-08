package com.soen.project.entities.assessment;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "assessment")
public class Assessment {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private long id;

    @Column(name = "json_reponses",length=5000, nullable = false)
    private String jsonResponses;

    @Column(name = "patient_id", nullable = false)
    private long patientId;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    public long getId() {
        return this.id;
    }

    public String getJsonResponses() {
        return jsonResponses;
    }

    public void setJsonResponses(String jsonResponses) {
        this.jsonResponses = jsonResponses;
    }

    public long getPatientId() {
        return patientId;
    }

    public void setPatientId(long patientId) {
        this.patientId = patientId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }
}
