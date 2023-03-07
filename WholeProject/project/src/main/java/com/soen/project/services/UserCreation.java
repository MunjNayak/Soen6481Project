package com.soen.project.services;

import com.soen.project.entities.appointment.AppointmentEntity;
import com.soen.project.entities.assessment.Assessment;
import com.soen.project.entities.user.*;
import com.soen.project.repository.AssessmentRepository;
import com.soen.project.repository.DoctorRepository;
import com.soen.project.repository.ManagerRepository;
import com.soen.project.repository.PatientRepository;
import com.soen.project.repository.CounselorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import static com.soen.project.utils.Constants.USER;
import static com.soen.project.utils.Constants.USER_TYPE;
import static com.soen.project.utils.HttpSession.getHttpSession;
import static java.time.temporal.ChronoUnit.DAYS;

@Component
public class UserCreation {

    @Autowired
    private ManagerRepository managerRepository;
    @Autowired
    private PatientRepository patientRepository;
    @Autowired
    private DoctorRepository doctorRepository;
    @Autowired
    private CounselorRepository counselorRepository;
    @Autowired
    private MessageDigest digest;
    @Autowired
    private AssessmentRepository assessmentRepository;
    @Autowired
    private AssessmentServices assessmentServices;
    @Autowired
    private AppointmentServices appointmentServices;

    private boolean initializeUsers;

    private final List<String> FIRST_NAMES = List.of(
            "David", "John", "Paul", "Mark", "James", "Andrew", "Scott", "Steven", "Robert", "Stephen", "William",
            "Craig", "Michael", "Stuart", "Christopher", "Alan", "Colin", "Brian", "Kevin", "Gary", "Richard", "Derek",
            "Martin", "Thomas", "Neil", "Barry", "Ian", "Jason", "Iain", "Gordon", "Alexander", "Graeme", "Peter",
            "Darren", "Graham", "George", "Kenneth", "Allan", "Simon", "Douglas", "Keith", "Lee", "Anthony", "Grant",
            "Karen", "Fiona", "Susan", "Claire", "Sharon", "Angela", "Gillian", "Julie", "Michelle", "Jacqueline",
            "Amanda", "Tracy", "Louise", "Jennifer", "Alison", "Sarah", "Donna", "Caroline", "Elaine", "Lynn", "Margaret",
            "Elizabeth", "Lesley", "Deborah", "Pauline", "Lorraine", "Laura", "Lisa", "Tracey", "Carol", "Linda", "Lorna",
            "Catherine", "Wendy", "Lynne", "Yvonne", "Pamela", "Kirsty", "Jane", "Emma", "Joanne", "Heather", "Suzanne",
            "Anne", "Diane", "Helen", "Victoria", "Dawn", "Mary", "Samantha", "Marie", "Kerry", "Ann", "Hazel",
            "Christine", "Gail", "Andrea", "Clare", "Sandra", "Shona", "Kathleen", "Paula", "Shirley", "Denise",
            "Melanie", "Patricia", "Audrey", "Ruth"
    );

    private final List<String> LAST_NAMES = List.of(
            "SMITH", "BROWN", "WILSON", "THOMSON", "STEWART", "ROBERTSON", "CAMPBELL", "ANDERSON", "SCOTT", "TAYLOR",
            "MACDONALD", "CLARK", "MURRAY", "REID", "MORRISON", "YOUNG", "WATSON", "WALKER", "MITCHELL", "PATERSON",
            "ROSS", "GRAHAM", "MARTIN", "MILLER", "KERR", "JOHNSTON", "DAVIDSON", "HENDERSON", "HUNTER", "MCDONALD",
            "BELL", "FRASER", "HAMILTON", "GRAY", "DUNCAN", "FERGUSON", "KELLY", "CAMERON", "MACKENZIE", "SIMPSON",
            "MACLEOD", "ALLAN", "GRANT", "MCLEAN", "BLACK", "RUSSELL", "WALLACE", "MACKAY", "WRIGHT", "GIBSON",
            "MARSHALL", "GORDON", "JONES", "WHITE", "KENNEDY", "STEVENSON", "SUTHERLAND", "BURNS", "JOHNSTONE",
            "CRAIG", "MCKENZIE", "MURPHY", "HUGHES", "SINCLAIR", "CUNNINGHAM", "WILLIAMSON", "WOOD", "MILNE",
            "DOCHERTY", "MUIR", "CRAWFORD", "WATT", "DOUGLAS", "MCMILLAN", "MILLAR", "FLEMING", "MUNRO", "KING",
            "RITCHIE", "SHAW", "WILLIAMS", "JACKSON", "THOMPSON", "DICKSON", "BOYLE", "MCINTOSH", "BRUCE", "MCLAUGHLIN",
            "MCKAY", "CHRISTIE", "MCINTYRE", "WHYTE", "ALEXANDER", "BLAIR", "MACKIE", "MACLEAN", "HAY", "JAMIESON",
            "HILL", "MOORE", "O'NEILL", "FINDLAY", "MCGREGOR", "ADAMS", "LINDSAY", "RAE", "WEIR", "CURRIE", "BOYD",
            "FORBES", "MCLEOD", "REILLY", "AITKEN", "JOHNSON", "TURNER", "DONALDSON", "DONNELLY", "NICOL", "WARD",
            "BUCHANAN", "BARR", "MCFARLANE", "RAMSAY", "MCCULLOCH", "HALL", "ROBINSON", "COOPER", "ALI", "LAWSON",
            "QUINN", "GREEN", "COLLINS", "ARMSTRONG", "DUFFY", "BEATTIE", "CAIRNS", "LOGAN", "MCCALLUM", "MCEWAN",
            "CHALMERS", "HOGG", "GALLACHER", "IRVINE", "COWAN", "FORSYTH", "HUTCHISON", "O'DONNELL", "RENNIE", "MCLAREN",
            "COOK", "ROBERTS", "WEBSTER", "MACPHERSON", "MCALLISTER", "THOMAS", "GALLAGHER", "KANE", "RICHARDSON",
            "HENDRY", "PATON", "STRACHAN", "MORGAN", "STEPHEN", "AHMED", "BAIRD", "DUNN", "TODD", "ROBB", "CLARKE",
            "WELSH", "MORRIS", "MURDOCH", "BAIN", "EVANS", "MCCANN", "BUCHAN", "HARRISON", "DAVIES", "GILMOUR",
            "ORR", "STUART", "BAXTER", "FORREST", "BENNETT", "MCPHERSON", "MOFFAT", "MORTON", "GIBB", "DRUMMOND");

    private final List<String> assessments = List.of(
            "{\"1\":2,\"2\":2,\"4\":1,\"8\":1,\"9\":2,\"10\":1,\"11\":2}",
            "{\"1\":2,\"2\":1,\"3\":1,\"8\":2,\"9\":2,\"10\":2,\"11\":2}",
            "{\"1\":1,\"9\":2,\"10\":2,\"11\":1}"
    );

    private final List<String> months =
            List.of("January","February","March","April","May","June","July","August","September","October","November","December");

    public UserCreation(@Value("${initializeUsers}") String initializeUsers){
        this.initializeUsers = Boolean.parseBoolean(initializeUsers);
    }

    public ResponseEntity createUsers() {
        if(initializeUsers) {
            createManager();
            createPatients();
            createDoctors();
            createCounselors();
            createAssessments();
        }
        return ResponseEntity.ok().build();
    }

    private void createManager(){
        Manager manager = Manager.builder()
                .firstName("OERJAM")
                .lastName("Manager")
                .email("manager@gmail.com")
                .password("manager@gmail.com")
                .build();
        managerRepository.save(manager);
    }

    private void createPatients() {
        for(int i = 1; i <= 300; i++) {

            String firstName = getFirstName();
            String lastName = getLastName();
            String email = String.format("%s.%s@gmail.com", firstName, lastName).toLowerCase();
            String password = new String(digest.digest(email.getBytes(StandardCharsets.UTF_8)));

            Patient patient = Patient.builder()
                    .address("1 Avenue")
                    .city("Montreal")
                    .dayOfBirth(Integer.toString(new Random().nextInt(27)+1))
                    .monthOfBirth(months.get(new Random().nextInt(months.size())))
                    .yearOfBirth(Integer.toString(new Random().nextInt(30)+1950))
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(password)
                    .phoneNumber("5146967156")
                    .province("Quebec")
                    .postalCode("H2H2P3")
                    .dateCreated(getRandomDate())
                    .build();
            try {
                patientRepository.save(patient);
            } catch (Exception e){

            }
        }
    }

    private void createCounselors() {
        for(int i = 1; i <= 20; i++) {

            String firstName = getFirstName();
            String lastName = getLastName();
            String email = String.format("%s.%s@gmail.com", firstName, lastName).toLowerCase();
            String password = new String(digest.digest(email.getBytes(StandardCharsets.UTF_8)));

            Counselor counselor = Counselor.builder()
                    .address("3 Avenue")
                    .city("Montreal")
                    .dayOfBirth(Integer.toString(new Random().nextInt(27)+1))
                    .monthOfBirth(months.get(new Random().nextInt(months.size())))
                    .yearOfBirth(Integer.toString(new Random().nextInt(30)+1950))
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(password)
                    .phoneNumber("5146967156")
                    .province("Quebec")
                    .postalCode("H2H2P3")
                    .registration("reg854")
                    .dateCreated(getRandomDate())
                    .activated(true)
                    .build();
            if(i > 15) {
                counselor.setActivated(false);
            }
            try {
                counselorRepository.save(counselor);
            } catch (Exception e){

            }
        }
    }

    private void createDoctors() {
        for(int i = 1; i <= 20; i++) {

            String firstName = getFirstName();
            String lastName = getLastName();
            String email = String.format("%s.%s@gmail.com", firstName, lastName).toLowerCase();
            String password = new String(digest.digest(email.getBytes(StandardCharsets.UTF_8)));

            Doctor doctor = Doctor.builder()
                    .address("2 Avenue")
                    .city("Montreal")
                    .dayOfBirth(Integer.toString(new Random().nextInt(27)+1))
                    .monthOfBirth(months.get(new Random().nextInt(months.size())))
                    .yearOfBirth(Integer.toString(new Random().nextInt(30)+1950))
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .password(password)
                    .phoneNumber("5146967156")
                    .province("Quebec")
                    .postalCode("H2H2P3")
                    .registration("reg854")
                    .dateCreated(getRandomDate())
                    .activated(true)
                    .build();
            if(i > 15) {
                doctor.setActivated(false);
            }
            try {
                doctorRepository.save(doctor);
            } catch (Exception e){

            }
        }
    }

    private String getFirstName() {
        return FIRST_NAMES.get(new Random().nextInt(FIRST_NAMES.size()));
    }

    private String getLastName() {
        String lastName = LAST_NAMES.get(new Random().nextInt(FIRST_NAMES.size()));
        lastName = lastName.toLowerCase();
        lastName = lastName.substring(0, 1).toUpperCase() + lastName.substring(1);
        return lastName;
    }

    private void createAssessments() {
        List<Patient> patientList = patientRepository.findAll();
        Collections.shuffle(patientList);
        for (int i = 0; i < 200; i++) {
            Patient patient = patientList.get(i);
            getHttpSession().setAttribute(USER, patient);
            getHttpSession().setAttribute(USER_TYPE, UserTypes.PATIENT);
            Assessment assessment = new Assessment();
            assessment.setJsonResponses(assessments.get(i % 3));
            assessment.setPatientId(patient.getId());
            assessment.setDate(getRandomDate());
            Assessment saved = assessmentRepository.save(assessment);
            patient.setAssessment_id(saved.getId());
            patientRepository.save(patient);
            appointmentServices.createInitialAppointment();

            if(i < 160) {
                createAppointment(patient, i);
            }
        }
        getHttpSession().invalidate();
    }

    private void createAppointment(Patient patient, int timeSlot) {
        int assign = timeSlot/16;
        timeSlot = timeSlot%16;

        if(assign < 5) {
            makeAppWithCounselor(patient, assign, timeSlot);
        } else {
            makeAppWithDoctor(patient, assign-5, timeSlot);
        }
    }

    private void makeAppWithCounselor(Patient patient, int assign, int timeSlot) {
        Counselor counselor = counselorRepository.findAll().get(assign);
        getHttpSession().setAttribute(USER, counselor);
        getHttpSession().setAttribute(USER_TYPE, UserTypes.COUNSELOR);
        AppointmentEntity appointmentEntity = AppointmentEntity.builder()
                .patientEmail(patient.getEmail())
                .medicalWorkerEmail(counselor.getEmail())
                .appDate(LocalDate.of(2021, 12, new Random().nextInt(5)+7))
                .timeSlot(timeSlot)
                .status("scheduled")
                .build();
        appointmentServices.createAppointment(appointmentEntity);
    }

    private void makeAppWithDoctor(Patient patient, int assign, int timeSlot) {
        Doctor doctor = doctorRepository.findAll().get(assign);
        getHttpSession().setAttribute(USER, doctor);
        getHttpSession().setAttribute(USER_TYPE, UserTypes.DOCTOR);
        AppointmentEntity appointmentEntity = AppointmentEntity.builder()
                .patientEmail(patient.getEmail())
                .medicalWorkerEmail(doctor.getEmail())
                .appDate(LocalDate.of(2021, 12, new Random().nextInt(5)+7))
                .timeSlot(timeSlot)
                .status("scheduled")
                .build();
        appointmentServices.createAppointment(appointmentEntity);
    }

    private LocalDate getRandomDate() {
        LocalDate today = LocalDate.now();
        return today.minus((int)(Math.random()*60), DAYS);
    }
}
