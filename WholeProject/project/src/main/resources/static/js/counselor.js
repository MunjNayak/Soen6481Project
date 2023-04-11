const baseURL = window.location.origin;
let currPage = -1;
let numPages = -1;
const maxPerPage = 10;
let patientList;

document.addEventListener("DOMContentLoaded", () => {
    let welcomeDiv = document.querySelector(".username");
    getRequest("/user").then(response => {
        console.log(response);
        return response.json();
    }).then(user => {
        const name = user['firstName'] + " " + user['lastName'];
        welcomeDiv.innerText = "Counselor Dashboard - Welcome " + name;
    })
});

function showPatients() {
    const patients = document.getElementById("patients");
    const patLink = document.querySelector(".patLink");
    const appointments = document.getElementById("appointments");
    const appLink = document.querySelector(".appLink");
    const userInfoDiv = document.getElementById("userInfoDiv");

    patients.classList.remove("hidden");
    patLink.classList.add("underline");
    patLink.classList.add("text-blue-600");
    populatePatientTable();

    appointments.classList.add("hidden");
    appLink.classList.remove("underline");
    appLink.classList.remove("text-blue-600");

    userInfoDiv.classList.add("hidden");
}

function showAppointments() {

    const patients = document.getElementById("patients");
    const patLink = document.querySelector(".patLink");
    const appointments = document.getElementById("appointments");
    const appLink = document.querySelector(".appLink");
    const userInfoDiv = document.getElementById("userInfoDiv");

    patients.classList.add("hidden");
    patLink.classList.remove("underline");
    patLink.classList.remove("text-blue-600");

    appointments.classList.remove("hidden");
    appLink.classList.add("underline");
    appLink.classList.add("text-blue-600");

    userInfoDiv.classList.add("hidden");

    populateAppointmentsTable();
}


function populatePatientTable() {
    const patientsJSON = getRequest(baseURL+"/patientsNeedAppointment").then(response => {
        console.log(response);
        return response.json();
    }).then(data => {
        console.log(data);
        setUpPatientListPagination(data, 1);
        patientList = data;
        document.getElementById("searchBar").addEventListener("keydown", searchListener);
    });
}

function searchListener() {
    let searchBar = document.getElementById("searchBar");
    let searchResults = [];
    const searchValue = searchBar.value;
    patientList.forEach(patient => {
        if(patient['firstName'].includes(searchValue)
            || patient['lastName'].includes(searchValue)
            || patient['email'].includes(searchValue)) {
            searchResults.push(patient);
        }
    });
    setUpPatientListPagination(searchResults, 1);
}

function setUpPatientListPagination(data, pageNum) {
    const start = (pageNum-1)*maxPerPage;
    const end = start + maxPerPage;
    currPage = 1;
    setUpPatientPaginationListeners(data);
    populatePatientTableFromResponse(data.slice(start, end));
}

function setUpPatientPaginationListeners(data) {
    numPages = Math.ceil(data.length/maxPerPage);
    document.querySelector(".numUsers").textContent = data.length;
    document.querySelector(".usersOrAppointmentsSpan").textContent = "patient(s)";

    addPatientNavButtons(data);
    addPatientPageSelect(data);
    addPatientArrowEventListeners(data);
}

function addPatientNavButtons(data) {
    let pageCount = 0;
    let navBar = document.querySelector(".navBarBottom");
    let navBarButton = navBar.querySelector("button");

    removeOldNavButtons(navBar);

    while (pageCount < 5 && currPage + pageCount <= numPages) {
        let newNavBarButton = navBarButton.cloneNode(true);
        let listItemPrev = navBarButton.parentNode;
        let listItem = document.createElement("li");
        newNavBarButton.innerText = currPage + pageCount;
        listItem.append(newNavBarButton);
        listItemPrev.parentNode.insertBefore(listItem, listItemPrev.nextSibling);
        navBarButton = newNavBarButton;
        addPatientNavButtonEventListener(newNavBarButton,currPage + pageCount, data, data.slice((currPage + pageCount - 1)*maxPerPage,
            (currPage + pageCount - 1)*maxPerPage + maxPerPage));
        pageCount++;
    }

    if(navBar.children.length > 4) {
        let active = navBar.children[2].children[0];
        active.classList.add("bg-blue-100");
    }
}

function removeOldNavButtons(navBar) {
    while (navBar.children.length > 4) {
        navBar.removeChild(navBar.children[2]);
    }
}

function addPatientArrowEventListeners(data) {
    let lArrow = document.querySelector(".lArrow");
    let rArrow = document.querySelector(".rArrow");
    let newLArrow = lArrow.cloneNode(true);
    let newRArrow = rArrow.cloneNode(true);

    lArrow.parentNode.replaceChild(newLArrow, lArrow);
    rArrow.parentNode.replaceChild(newRArrow, rArrow);

    newLArrow.addEventListener("click", () => {
        if(currPage !== 1) {
            currPage--;
            const dataSlice = data.slice((currPage-1)*maxPerPage, (currPage-1)*maxPerPage + maxPerPage);
            populatePatientTableFromResponse(dataSlice);
            addPatientNavButtons(data);
        }
    });

    newRArrow.addEventListener("click", () => {
        if(currPage !== numPages) {
            currPage++;
            const dataSlice = data.slice((currPage-1)*maxPerPage, (currPage-1)*maxPerPage + maxPerPage);
            populatePatientTableFromResponse(dataSlice);
            addPatientNavButtons(data);
        }
    });
}

function addPatientNavButtonEventListener(newNavBarButton, page, data, dataSlice) {
    newNavBarButton.addEventListener("click", () => {
        currPage = page;
        populatePatientTableFromResponse(dataSlice);
        addPatientNavButtons(data);
    });
}

function addPatientPageSelect(data) {
    let select = document.querySelector(".selectPage");
    select.innerHTML = "";
    for(let i = 1; i <= numPages; i++) {
        let option = document.createElement("option");
        option.text = i.toString();
        select.appendChild(option);
    }
    select.addEventListener("change", () => {
        const page = select.value;
        const dataSlice = data.slice((page-1)*maxPerPage, (page-1)*maxPerPage + maxPerPage);
        currPage = parseInt(page);
        populatePatientTableFromResponse(dataSlice);
        addPatientNavButtons(data);
    })
}

function populatePatientTableFromResponse(data) {
    const patientMap = Object.entries(data);
    let html = '';
    for (const patient of patientMap) {
        const patInfo = patient[1];
        const patientId = patInfo['id'];
        const name = patInfo['firstName'] + " " + patInfo['lastName'];
        const email = patInfo['email'];
        const birthday = patInfo['monthOfBirth'] + " " + patInfo['dayOfBirth'] + ", " + patInfo['yearOfBirth'];
        const assessmentId = patInfo['assessment_id'];
        html = setTableEntryForPatientList(html, name, email, birthday, assessmentId, patientId);
    }
    document.getElementById("tableBody").innerHTML = html;
}

function setTableEntryForPatientList(html, name, email, birthday, assessmentId, patientId) {
    html +=
        `<tr class="whitespace-nowrap border-b">
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                <a href="#" onclick="loadUserData('${email}', 'patients')" class="text-blue-400 underline">${name}</a>
                </div></td><td class="px-6 py-4"> <div class="text-sm text-gray-500 text-center">
                ${email}
                </div></td><td class="px-6 py-4"><div class="text-sm text-gray-500 text-center ">
                ${birthday}
                </div> </td><td class="text-sm text-blue-400 text-center underline">`
    if (assessmentId != null) {
        html += `<a href="#" onclick="viewAssessmentForPatientList(${patientId}, '${email}')" >
                click to view</a>`
    }
    html +=
        `</td>
            <td class="px-6 py-4"> <div class="text-sm text-gray-500 text-center">
                <button onclick="confirmDelete('${email}')" class="w-16 shadow-md text-sm text-white bg-red-500"> Delete</button>
                </div></td>
         </tr>`
    return html;
}

function loadUserData(email, prevDiv){
    let previousDiv = document.getElementById(prevDiv);
    let userInfoDiv = document.getElementById("userInfoDiv");
    previousDiv.classList.add("hidden");
    userInfoDiv.classList.remove("hidden");

    populateUserInfo(email);
    addCloseUserInfoListener(previousDiv);
    addDeleteButtonListener(email);
}

function populateUserInfo(email) {
    getRequest(`/userWithEmail?email=${email}`).then(response => {
        console.log(response);
        return response.json();
    }).then(user => {
        console.log(user);
        populateUserInfoWithData(user);
    })
}

function populateUserInfoWithData(user) {
    document.querySelector(".userInfoName").innerHTML = user['firstName'] + " " + user['lastName'];
    let address = document.getElementById("address");
    let city = document.getElementById("city");
    let postalCode = document.getElementById("postalCode");
    let province = document.getElementById("province");
    let dayOfBirth = document.getElementById("dayOfBirth");
    let monthOfBirth = document.getElementById("monthOfBirth");
    let yearOfBirth = document.getElementById("yearOfBirth");
    let phoneNumber = document.getElementById("phoneNumber");
    let email = document.getElementById("email");
    let userDiv = document.getElementById("user");

    address.value = user['address'];
    city.value = user['city'];
    postalCode.value = user['postalCode'];
    province.value = user['province'];
    dayOfBirth.value = user['dayOfBirth'];
    monthOfBirth.value = user['monthOfBirth'];
    yearOfBirth.value = user['yearOfBirth'];
    phoneNumber.value = user['phoneNumber'];
    email.value = user['email'];
    userDiv.value = 'Patient';
}

function addCloseUserInfoListener(previousDiv) {
    let closeBtn = document.querySelector(".closeUserInfoBtn");
    let newButton = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newButton, closeBtn);
    newButton.addEventListener("click", ()=> {
        document.getElementById("userInfoDiv").classList.add("hidden");
        previousDiv.classList.remove("hidden");
    });
}

function addDeleteButtonListener(email) {
    let deleteUserBtn = document.getElementById("deleteUserBtn");
    let newButton = deleteUserBtn.cloneNode(true);
    deleteUserBtn.parentNode.replaceChild(newButton, deleteUserBtn);
    newButton.addEventListener("click", () => {
        confirmDelete(email);
    });
}

function confirmDelete(email) {
    cuteAlert({
        type: "question",
        title: "User Deletion",
        message: "Are you sure you want to delete this user? This step is IRREVERSIBLE.",
        confirmText: "Delete User",
        cancelText: "Cancel"
    }).then((e)=>{
        if ( e === ("confirm")){
            getRequest(baseURL+`/deleteUser?email=${email}`).then(response => {
                console.log(response);
                if (response.status === 200) {
                    cuteAlert({
                        type: "success",
                        title: "Deletion Status",
                        message: "User deleted",
                        buttonText: "Okay"
                    }).then(() => location.reload());
                }
            })
        }
    });
}

function viewAssessmentForPatientList(patientId, email) {
    getPatientAssessmentFromID(patientId).then(assessment => {
        console.log(assessment);
        let patientContainer = document.getElementById('patientsTopDiv');
        const oldContents = patientContainer.innerHTML;
        modifyAssessmentPageForPatientList(patientContainer, oldContents, assessment, email);
    });
}

function getPatientAssessmentFromID(patientId) {
    return getRequest(baseURL + `/assessmentFromPatientWithID?patientId=${patientId}`).then(response => {
        console.log(response);
        return response.json();
    });
}

function modifyAssessmentPageForPatientList(patientContainer, oldContents, assessment, email) {
    fetch('../templates/assessment_content.html')
        .then(data => data.text())
        .then(html => {
            patientContainer.innerHTML = html;
            document.querySelector(".assessment-content").classList.remove("hidden");
            // document.querySelector(".other-questions").classList.remove("hidden");
            modifyAssessmentCloseButton(patientContainer, oldContents);
            unhideAssessmentDivs(assessment);
            modifyButtonsAtBottomForPatientList(email);
        });
}

function modifyAssessmentCloseButton(container, oldContents) {
    let closeButton = document.querySelector(".close");
    closeButton.classList.remove("hidden");
    closeButton.addEventListener("click", () => {
        container.innerHTML = oldContents;
        document.getElementById("searchBar").addEventListener("keydown", searchListener);
    });
}

const unhideAssessmentDivs = (assessment) => {
    const assessmentMap = Object.entries(assessment);
    // const questionDivs = document.querySelectorAll("[data-ques]");

    assessmentMap.forEach((val, key) => {
        const questNum = String(val[0]);
        const activeButtonNum = val[1];
        console.log(questNum, activeButtonNum);
        const questionDivs = document.querySelectorAll("[data-options]");
        for (const question of questionDivs) {
            if(question.getAttribute("data-options") === questNum+" "+activeButtonNum){
                // question.classList.remove("hidden");
                question.style.backgroundColor="blue";
                // const response = question.querySelector("button:nth-of-type("+ activeButtonNum +")").innerHTML;
                // appendPara(response, question);
                // hideButtons(question);
            }
        }
    })
}

function appendPara(response, question) {
    let para = document.createElement("p");
    para.classList.add("text-center");
    para.innerHTML = "Answer: ".bold() + response;
    question.append(para);
}

function hideButtons(question) {
    for (let i = 1; i <= 3; i++) {
        let q = question.querySelector("button:nth-of-type(" + i + ")");
        if (q != null) {
            q.classList.add('hidden');
        }
    }
}

function modifyButtonsAtBottomForPatientList(patientEmail) {
    let arrAppointmentBtn = document.createElement('button');
    arrAppointmentBtn.className = "block w-48 mx-auto shadow-md text-sm py-3 text-white bg-blue-500";
    arrAppointmentBtn.innerHTML = "Arrange Appointment"
    arrAppointmentBtn.onclick = () => addScheduleAppointmentButtonListener(patientEmail);

    let refuseBtn = document.createElement('button');
    refuseBtn.id = "refuseBtn";
    refuseBtn.className = "block w-48 mx-auto shadow-md text-sm py-3 mt-3 text-white bg-yellow-500";
    refuseBtn.innerHTML = "Reject Appointment"
    refuseBtn.onclick = () => addRefuseButtonListener(patientEmail);

    document.querySelector(".lowerBtns").classList.add("pt-10")
    document.querySelector(".lowerBtns").appendChild(arrAppointmentBtn);
    document.querySelector(".lowerBtns").appendChild(refuseBtn);

    hideSubmitButton();
}

function hideSubmitButton() {
    let submitButton = document.querySelector(".submit-btn");
    submitButton.parentNode.removeChild(submitButton);
}

function addRefuseButtonListener(email) {
    const confirmRefuse = "Are you sure you want to refuse appointment? This will delete the self-assessment. " +
        "The patient will be notified.";

    cuteAlert({
        type: "question",
        title: "Refuse Appointment",
        message: confirmRefuse,
        confirmText: "Refuse",
        cancelText: "Cancel"
    }).then((e)=> {
        if (e === ("confirm")) {
            const appointment = new Map([
                ['message', 'A counselor has reviewed your self-assessment at the date and time indicated and determined ' +
                'that no appointment is necessary. You may redo the self-assessment in the future.'],
                ['status', 'cancelled'],
                ['patientEmail', email],
                ['withCounselor', true],
            ]);
            postData(baseURL + "/appointment", Object.fromEntries(appointment)).then(response => {
                console.log(response);
                if (response.status === 200) {
                    cuteAlert({
                        type: "success",
                        title: "Appointment Status",
                        message: "Appointment refused and self-assessment deleted.",
                        buttonText: "Okay"
                    }).then(()=> location.reload());
                } else {
                    cuteAlert({
                        type: "error",
                        title: "Appointment Status",
                        message: "Unable to refuse appointment, try again later.",
                        buttonText: "Okay"
                    });
                }
            });
        }
    });
}

function addScheduleAppointmentButtonListener(patientEmail) {
    let patientContainer = document.querySelector('.lowerBtns');
    patientContainer.innerHTML = document.querySelector(".overlayDiv").innerHTML;

    return getRequest("/workers").then(response => {
        console.log(response);
        return response.json();
    }).then(workers => {
        console.log(workers);
        populateAppointmentsChooser(workers, patientEmail);
    });
}

function populateAppointmentsChooser(workers, patientEmail) {
    let counselorOrDocSelect = document.getElementById("assignee-type-selector");
    addArrangeAppointmentEventListener(patientEmail);
    addCounselorOrDocSelectEventListener(counselorOrDocSelect, workers);
    addTimePickerEventListener();
    addCounselorOrDocNameSelectEventListener();
}

function addArrangeAppointmentEventListener(patientEmail) {
    let createAppButton = document.querySelector(".createAppointment");
    const patLink = document.querySelector(".patLink");
    const closeButton = document.querySelector(".close");

    createAppButton.addEventListener("click", ()=> {
        const appointmentJson = buildAppointmentJson(patientEmail);
        postData(baseURL + "/appointment", appointmentJson).then(response =>{
            console.log(response);
            if(response.status === 200){
                cuteAlert({
                    type: "success",
                    title: "Appointment Status",
                    message: "Appointment created successfully.",
                    buttonText: "Okay"
                }).then(()=> {
                    patLink.click();
                    closeButton.click();
                });
            } else {
                cuteAlert({
                    type: "error",
                    title: "Appointment Status",
                    message: "Unable to create appointment. Probable conflict." + response.statusText,
                    buttonText: "Okay"
                });
            }
            return response.json();
        }).then(confirmation => {
            console.log(confirmation);
        });
    });
}

function buildAppointmentJson(patientEmail) {
    let timeSlotSelector = document.getElementById("time-slot-selector");
    let datePicker = document.getElementById("appointment-date");
    let counselorDocNameSelect = document.getElementById("assignee-name");

    return {
        'status': 'scheduled',
        'medicalWorkerEmail': counselorDocNameSelect.value,
        'appDate': datePicker.value,
        'timeSlot': timeSlotSelector.value,
        'patientEmail': patientEmail
    }
}

function addCounselorOrDocSelectEventListener(counselorOrDocSelect, workers) {
    counselorOrDocSelect.addEventListener("change", () => {
        document.getElementById("assignee-name").innerHTML = "";
        tryToPopulateAvailableAppointments();
        if (counselorOrDocSelect.value === 'counselor') {
            populateCounselorsOrDoctors(workers, 'counselors');
        } else {
            populateCounselorsOrDoctors(workers, 'doctors');
        }
    });
}

function populateCounselorsOrDoctors(workers, counselorOrDoc) {
    let counselorOrDocSelect = document.getElementById("assignee-name");
    counselorOrDocSelect.innerHTML = "";
    addBlankOption(counselorOrDocSelect);

    for (const worker of workers[counselorOrDoc]) {
        let option = document.createElement("option");
        option.value = worker['email'];
        option.innerHTML = worker['firstName'] + " " + worker['lastName'];
        counselorOrDocSelect.appendChild(option);
    }
}

function addBlankOption(select) {
    let option = document.createElement("option");
    option.disabled = true;
    option.selected = true;
    select.appendChild(option);
}

function addTimePickerEventListener() {
    let timeSlot = document.getElementById("appointment-date");
    timeSlot.addEventListener("change", () => {
        tryToPopulateAvailableAppointments();
    });
}


function addCounselorOrDocNameSelectEventListener() {
    let counselorDocNameSelect = document.getElementById("assignee-name");
    counselorDocNameSelect.addEventListener("change", () => {
        tryToPopulateAvailableAppointments();
    })
}

function tryToPopulateAvailableAppointments() {
    let datePicker = document.getElementById("appointment-date");
    let counselorDocNameSelect = document.getElementById("assignee-name");
    let timeSlotSelector = document.getElementById("time-slot-selector");
    let createAppButton = document.querySelector(".createAppointment");
    if(datePicker.value !== "" && counselorDocNameSelect.value !== ""){
        timeSlotSelector.classList.remove("disabled");
        populateTimeSlotSelector(counselorDocNameSelect, datePicker);
    } else {
        createAppButton.classList.add("disabled");
        timeSlotSelector.classList.add("disabled");
        timeSlotSelector.innerHTML = "";
    }
}


function populateTimeSlotSelector(counselorDocNameSelect, datePicker) {
    const workerEmail = counselorDocNameSelect.value;
    const date = datePicker.value;
    getRequest("/appointmentsForWorker?workerEmail="+workerEmail+"&date="+date).then(response => {
        console.log(response);
        return response.json();
    }).then(appointments => {
        console.log(appointments);
        const timeSlots = appointments['timeslots'];
        const appointmentsTaken = appointments['appointments'];
        populateTimeSlotWithAppointments(timeSlots, appointmentsTaken);
    });
}

function populateTimeSlotWithAppointments(timeSlots, appointmentsTaken) {
    let timeSlotSelector = document.getElementById("time-slot-selector");
    timeSlotSelector.innerHTML = "";
    addBlankOption(timeSlotSelector);
    for(let i = 0; i < Object.keys(timeSlots).length; i++){
        let option = document.createElement("option");
        option.value = i.toString();
        option.innerHTML = timeSlots[i];
        if(appointmentsTaken.includes(i)){
            option.disabled = true;
            option.style.color = "red";
        }
        timeSlotSelector.appendChild(option);
    }
    addTimeSlotSelectorEventListener(timeSlotSelector);
}

function addTimeSlotSelectorEventListener(timeSlotSelector) {
    let createAppButton = document.querySelector(".createAppointment");
    timeSlotSelector.addEventListener("change", () => {
        if(timeSlotSelector.value !== ""){
            createAppButton.classList.remove("disabled");
        }
    })
}

function populateAppointmentsTable() {
    getRequest(baseURL+"/appointments").then(response => {
        console.log(response);
        return response.json();
    }).then(data => {
        console.log(data);
        populateAppointmentsTableFromResponse(data);
        setUpAppointmentListPagination(data, 1);
    });
}

function setUpAppointmentListPagination(data, pageNum) {
    const start = (pageNum-1)*maxPerPage;
    const end = start + maxPerPage;
    currPage = 1;
    setUpAppointmentPaginationListeners(data);
    populateAppointmentsTableFromResponse(data.slice(start, end));
}

function setUpAppointmentPaginationListeners(data) {
    numPages = Math.ceil(data.length/maxPerPage);
    document.querySelector(".numUsers").textContent = data.length;
    document.querySelector(".usersOrAppointmentsSpan").textContent = "Appointments(s)";

    addAppointmentNavButtons(data);
    addAppointmentPageSelect(data);
    addAppointmentArrowEventListeners(data);
}

function addAppointmentNavButtons(data) {
    let pageCount = 0;
    let navBar = document.querySelector(".navBarBottom");
    let navBarButton = navBar.querySelector("button");

    removeOldNavButtons(navBar);

    while (pageCount < 5 && currPage + pageCount <= numPages) {
        let newNavBarButton = navBarButton.cloneNode(true);
        let listItemPrev = navBarButton.parentNode;
        let listItem = document.createElement("li");
        newNavBarButton.innerText = currPage + pageCount;
        listItem.append(newNavBarButton);
        listItemPrev.parentNode.insertBefore(listItem, listItemPrev.nextSibling);
        navBarButton = newNavBarButton;
        addAppointmentNavButtonEventListener(newNavBarButton,currPage + pageCount, data, data.slice((currPage + pageCount - 1)*maxPerPage,
            (currPage + pageCount - 1)*maxPerPage + maxPerPage));
        pageCount++;
    }
    if(navBar.children.length > 4) {
        let active = navBar.children[2].children[0];
        active.classList.add("bg-blue-100");
    }
}

function addAppointmentArrowEventListeners(data) {
    let lArrow = document.querySelector(".lArrow");
    let rArrow = document.querySelector(".rArrow");
    let newLArrow = lArrow.cloneNode(true);
    let newRArrow = rArrow.cloneNode(true);

    lArrow.parentNode.replaceChild(newLArrow, lArrow);
    rArrow.parentNode.replaceChild(newRArrow, rArrow);

    newLArrow.addEventListener("click", () => {
        if(currPage !== 1) {
            currPage--;
            const dataSlice = data.slice((currPage-1)*maxPerPage, (currPage-1)*maxPerPage + maxPerPage);
            populateAppointmentsTableFromResponse(dataSlice);
            addAppointmentNavButtons(data);
        }
    });

    newRArrow.addEventListener("click", () => {
        if(currPage !== numPages) {
            currPage++;
            const dataSlice = data.slice((currPage-1)*maxPerPage, (currPage-1)*maxPerPage + maxPerPage);
            populateAppointmentsTableFromResponse(dataSlice);
            addAppointmentNavButtons(data);
        }
    });
}

function addAppointmentNavButtonEventListener(newNavBarButton, page, data, dataSlice) {
    newNavBarButton.addEventListener("click", () => {
        currPage = page;
        populateAppointmentsTableFromResponse(dataSlice);
        addAppointmentNavButtons(data);
    });
}

function addAppointmentPageSelect(data) {
    let select = document.querySelector(".selectPage");
    select.innerHTML = "";
    for(let i = 1; i <= numPages; i++) {
        let option = document.createElement("option");
        option.text = i.toString();
        select.appendChild(option);
    }
    select.addEventListener("change", () => {
        const page = select.value;
        const dataSlice = data.slice((page-1)*maxPerPage, (page-1)*maxPerPage + maxPerPage);
        currPage = parseInt(page);
        populateAppointmentsTableFromResponse(dataSlice);
        addAppointmentNavButtons(data);
    })
}

function populateAppointmentsTableFromResponse(appointments){
    let html = '';
    for(appointments of appointments){
        const date = appointments['appDate'];
        const time = appointments['time'];
        const patName = appointments['patientName'];
        const patEmail = appointments['patientEmail'];
        html = setTableEntryForAppointment(html, date, time, patName, patEmail);
    }
    document.getElementById("tableBody2").innerHTML = html;
}

function setTableEntryForAppointment(html, date, time, patName, patEmail) {
    html +=
        `<tr class="whitespace-nowrap border-b">
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                ${date}
                </div></td>
                <td class="px-6 py-4"> <div class="text-sm text-gray-500 text-center">
                ${time}
                </div></td>
                <td class="px-6 py-4"><div class="text-sm text-gray-500 text-center ">
                <a href="#" onclick="loadUserData('${patEmail}', 'appointments')" class="text-blue-400 underline">${patName}</a>
                </div></td>
                <td class="px-6 py-4"><div class="text-sm text-blue-400 text-center underline">
                <a href="#" onclick="viewAssessmentForAppointmentList('${patEmail}')"> click to view</a>
                </div></td>
                <td class="px-6 py-4"><div class="text-sm text-gray-500 text-center justify-between ">
                        <button onclick="refuseButtonForAppointmentList('${patEmail}')" class="rejectBtn inline-block w-16 mr-1 shadow-md text-sm text-white bg-yellow-500">Reject</button>
                        <button onclick="completeAppointment('${patEmail}')" class="completeBtn inline-block w-16 ml-1 shadow-md  text-sm text-white bg-blue-500">Complete</button>
                </div></td>
         </tr>`;
    return html;
}

function refuseButtonForAppointmentList(email) {
    const confirmRefuse = "Are you sure you want to refuse appointment? This will delete the self-assessment. " +
        "The patient will be notified.";

    cuteAlert({
        type: "question",
        title: "Refuse Appointment",
        message: confirmRefuse,
        confirmText: "Refuse",
        cancelText: "Cancel"
    }).then((e)=> {
        if (e === ("confirm")) {
            const appointment = new Map([
                ['status', 'cancelled'],
                ['patientEmail', email],
            ]);
            postData(baseURL + "/appointment", Object.fromEntries(appointment)).then(response => {
                console.log(response);
                if (response.status === 200) {
                    cuteAlert({
                        type: "success",
                        title: "Appointment Status",
                        message: "Appointment refused and self-assessment deleted.",
                        buttonText: "Okay"
                    }).then(()=> location.reload());
                } else {
                    cuteAlert({
                        type: "error",
                        title: "Appointment Status",
                        message: "Unable to refuse appointment, try again later.",
                        buttonText: "Okay"
                    });
                }
            });
        }
    });
}

function completeAppointment(patEmail) {
    const confirmComplete = "Please confirm you would like to complete your appointment.";

    cuteAlert({
        type: "question",
        title: "Complete Appointment",
        message: confirmComplete,
        confirmText: "Complete",
        cancelText: "Cancel"
    }).then((e)=> {
        if (e === ("confirm")) {
            const appointment = new Map([
                ['message', 'You have completed your appointment. Have a good day.'],
                ['status', 'completed'],
                ['patientEmail', patEmail]
            ]);
            postData(baseURL + "/appointment", Object.fromEntries(appointment)).then(response => {
                console.log(response);
                if (response.status === 200) {
                    cuteAlert({
                        type: "success",
                        title: "Appointment Status",
                        message: "Appointment completed successfully.",
                        buttonText: "Okay"
                    }).then(() => location.reload());
                } else {
                    cuteAlert({
                        type: "error",
                        title: "Appointment Status",
                        message: "Unable to complete, please try again later.",
                        buttonText: "Okay"
                    });
                }
            });
        }
    });
}

function viewAssessmentForAppointmentList(patEmail){
    getPatientAssessmentFromEmail(patEmail).then(assessment => {
        console.log(assessment);
        let appointmentContainer = document.getElementById("appointments");
        const oldContents = appointmentContainer.innerHTML;
        modifyAssessmentPageForAppointmentList(appointmentContainer, oldContents, assessment);
    })
}

function modifyAssessmentPageForAppointmentList(appointmentContainer, oldContents, assessment) {
    fetch('../templates/assessment_content.html')
        .then(data => data.text())
        .then(html => {
            appointmentContainer.innerHTML = html;
            document.querySelector(".assessment-content").classList.remove("hidden");
            // document.querySelector(".other-questions").classList.remove("hidden");
            modifyAssessmentCloseButton(appointmentContainer, oldContents);
            unhideAssessmentDivs(assessment);
            hideSubmitButton();
        });
}

function getPatientAssessmentFromEmail(patEmail){
    return getRequest(baseURL + `/assessmentFromPatientWithEmail?patientEmail=${patEmail}`).then(response => {
        console.log(response);
        return response.json();
    });
}

function logout() {
    getRequest("/logout").then(response => {
        if (response.ok) {
            cuteAlert({
                type: "success",
                title: "Logout Status",
                message: "Logged out",
                buttonText: "Okay"
            }).then(()=> window.location.replace(baseURL + "/"));
        } else {
            cuteAlert({
                type: "error",
                title: "Logout Status",
                message: "Unable to logout",
                buttonText: "Okay"
            });
        }
    });
}

async function getRequest(url = '', data = {}) {
    return await fetch(url, {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    });
}

async function postData(url = "", data = {}){
    return await fetch(url, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json",
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(data),
    });
}
