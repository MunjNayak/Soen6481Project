package com.soen.project.entities.user;

import java.time.LocalDate;

public interface User {

    long getId();
    void setId(long id);
    String getFirstName();
    void setFirstName(String firstName);
    String getLastName();
    void setLastName(String lastName);
    String getEmail();
    void setEmail(String email);
    String getPhoneNumber();
    void setPhoneNumber(String phoneNumber);
    String getDayOfBirth();
    void setDayOfBirth(String dayOfBirth);
    String getMonthOfBirth();
    void setMonthOfBirth(String monthOfBirth);
    String getYearOfBirth();
    void setYearOfBirth(String yearOfBirth);
    String getAddress();
    void setAddress(String address);
    String getPostalCode();
    void setPostalCode(String postalCode);
    String getCity();
    void setCity(String city);
    String getProvince();
    void setProvince(String province);
    String getPassword();
    void setPassword(String password);
    LocalDate getDateCreated();
    void setDateCreated(LocalDate dateCreated);
}
