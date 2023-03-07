package com.soen.project.utils;

import com.soen.project.entities.user.Patient;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import static com.soen.project.entities.user.UserTypes.*;
import static com.soen.project.utils.Constants.USER;
import static com.soen.project.utils.Constants.USER_TYPE;

public class HttpSession {
    public static javax.servlet.http.HttpSession getHttpSession() {
        ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
        return attr.getRequest().getSession(true);
    }

    public static void updatePatientInSession(Patient patient) {
        if(getHttpSession().getAttribute(USER_TYPE) == PATIENT) {
            getHttpSession().setAttribute(USER, patient);
        }
    }

    public static boolean userIsPatient() {
        return getHttpSession().getAttribute(USER_TYPE) == PATIENT;
    }

    public static boolean userIsManager() {
        return getHttpSession().getAttribute(USER_TYPE) == MANAGER;
    }

    public static boolean userIsCounselor() {
        return getHttpSession().getAttribute(USER_TYPE) == COUNSELOR;
    }

    public static boolean userIsCounselorOrDoctor() {
        return getHttpSession().getAttribute(USER_TYPE) == COUNSELOR || getHttpSession().getAttribute(USER_TYPE) == DOCTOR;
    }
}
