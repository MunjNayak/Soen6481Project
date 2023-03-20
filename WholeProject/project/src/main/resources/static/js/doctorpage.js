const baseURL = window.location.origin;
let currPage = -1;
let numPages = -1;
const maxPerPage = 10;

document.addEventListener("DOMContentLoaded", () => {
    let welcomeDiv = document.querySelector(".username");
    getRequest("/user").then(response => {
        console.log(response);
        return response.json();
    }).then(user => {
        const name = user['firstName'] + " " + user['lastName'];
        welcomeDiv.innerText = "Doctor Dashboard - Welcome " + name;
    })
});

function showAppointments() {
    const appointments = document.getElementById("appointments");
    const appLink = document.querySelector(".appLink");
    const userInfoDiv = document.getElementById("userInfoDiv");

    appointments.classList.remove("hidden");
    appLink.classList.add("underline");
    appLink.classList.add("text-blue-600");

    userInfoDiv.classList.add("hidden");

    populateAppointmentsTable();
}

function populateAppointmentsTable() {
    getRequest(baseURL+"/appointments").then(response => {
        console.log(response);
        return response.json();
    }).then(data => {
        console.log(data);
        setUpAppointmentListPagination(data);
    });
}

function setUpAppointmentListPagination(data) {
    currPage = 1;
    const start = (currPage-1)*maxPerPage;
    const end = start + maxPerPage;
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

function removeOldNavButtons(navBar) {
    while (navBar.children.length > 4) {
        navBar.removeChild(navBar.children[2]);
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
            modifyCloseButton(appointmentContainer, oldContents);
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

function modifyCloseButton(container, oldContents) {
    let closeButton = document.querySelector(".close");
    closeButton.classList.remove("hidden");
    closeButton.addEventListener("click", () => {
        container.innerHTML = oldContents;
    })
}

const unhideAssessmentDivs = (assessment) => {
    const assessmentMap = Object.entries(assessment);
    const questionDivs = document.querySelectorAll("[data-ques]");

    assessmentMap.forEach((val, key) => {
        const questNum = String(val[0]);
        const activeButtonNum = val[1];
        for (const question of questionDivs) {
            if(question.getAttribute("data-ques") === questNum){
                question.classList.remove("hidden");
                const response = question.querySelector("button:nth-of-type("+ activeButtonNum +")").innerHTML;
                appendPara(response, question);
                hideButtons(question);
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


function hideSubmitButton() {
    let submitButton = document.querySelector(".submit-btn");
    submitButton.parentNode.removeChild(submitButton);
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

