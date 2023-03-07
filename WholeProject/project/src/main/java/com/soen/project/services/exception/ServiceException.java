package com.soen.project.services.exception;

import org.springframework.http.ResponseEntity;

public class ServiceException extends Exception {

    private final ResponseEntity response;

    public ServiceException(ResponseEntity response){
        this.response = response;
    }

    public ResponseEntity getResponse() {
        return response;
    }
}
