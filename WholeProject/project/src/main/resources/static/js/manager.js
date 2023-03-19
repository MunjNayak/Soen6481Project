const baseURL = window.location.origin;
let userListSelect = document.querySelector(".userLists");
let usersDiv = document.getElementById("usersDiv");
let userInfoDiv = document.getElementById("userInfoDiv");
let reportDiv = document.getElementById("reportDiv");
let selectedUserType;
let viewReportLink = document.querySelector(".viewReportLink");
let userEntireTable = document.querySelector(".userTable");
let userTable = document.getElementById("tableBody");
let addButton = document.querySelector(".addButton");
let regForm = document.getElementById("regForm");
let closeRegFormButton = document.querySelector(".closeUserAddDiv");
let navBarBottom = document.querySelector(".navBarBottom");
let datePicker = document.querySelector(".date-picker");
let userStatsDiv = document.querySelector(".userStatsDiv");
let assessStatsDiv = document.querySelector(".assessStatsDiv");
let searchBar = document.getElementById("searchBar");
let searchDiv = document.querySelector(".searchDiv");
let userList;
let chartBarObject1, chartBarObject2;
let statisticsJson;
let currPage;
const maxPerPage = 10;

datePicker.addEventListener("change", addDatePickerListener);
userListSelect.addEventListener("change", addUserListSelectListener);
viewReportLink.addEventListener("click", addViewReportLinkListener);
addButton.addEventListener("click", addButtonListener);
closeRegFormButton.addEventListener("click", closeRegForm);


function addDatePickerListener() {
    const date = datePicker.value;
    getRequest(baseURL + "/statistics?date="+date).then(response => {
        console.log(response);
        return response.json();
    }).then(statistics => {
        console.log(statistics);
        statisticsJson = statistics;
        showStatistics1();
        showStatistics2();
    })
}

function showStatistics1() {
    userStatsDiv.classList.remove("hidden");

    const labelsBarChart = [
        "Registrations on Day",
        "Registrations in Week",
        "Registrations in Month",
    ];
    const dataBarChart = {
        labels: labelsBarChart,
        datasets: [
            {
                label: "Number of Registrations",
                backgroundColor: "hsl(252, 82.9%, 67.8%)",
                borderColor: "hsl(252, 82.9%, 67.8%)",
                data: [statisticsJson['regOnDay'], statisticsJson['regInWeek'], statisticsJson['regInMonth']],
            },
        ],
    };

    const configBarChart = {
        type: "bar",
        data: dataBarChart,
        options: {},
    };

    if(typeof chartBarObject1 !== 'undefined' && chartBarObject1 !== null){
        chartBarObject1.destroy();
    }
    chartBarObject1 = new Chart(
        document.getElementById("chartBar1"),
        configBarChart
    );
}

function showStatistics2() {
    assessStatsDiv.classList.remove("hidden");

    const labelsBarChart = [
        "Assessments on Day",
        "Assessments in Week",
        "Assessments in Month",
    ];
    const dataBarChart = {
        labels: labelsBarChart,
        datasets: [
            {
                label: "Number of Assessments",
                backgroundColor: "hsl(252, 82.9%, 67.8%)",
                borderColor: "hsl(252, 82.9%, 67.8%)",
                data: [statisticsJson['assessOnDay'], statisticsJson['assessInWeek'], statisticsJson['assessInMonth']],
            },
        ],
    };

    const configBarChart = {
        type: "bar",
        data: dataBarChart,
        options: {},
    };

    if(typeof chartBarObject2 !== 'undefined' && chartBarObject2 !== null){
        chartBarObject2.destroy();
    }
    chartBarObject2 = new Chart(
        document.getElementById("chartBar2"),
        configBarChart
    );
}

function addButtonListener() {
    addButton.classList.add("hidden");
    userEntireTable.classList.add("hidden");
    navBarBottom.classList.add("hidden");
    searchDiv.classList.add("hidden");
    regForm.classList.remove("hidden");
}

function closeRegForm() {
    addButton.classList.remove("hidden");
    userEntireTable.classList.remove("hidden");
    navBarBottom.classList.remove("hidden");
    searchDiv.classList.remove("hidden");
    regForm.classList.add("hidden");
}

function addUserListSelectListener() {
    userListSelect.classList.add("text-blue-600", "underline");
    viewReportLink.classList.remove("text-blue-600", "underline");

    selectedUserType = userListSelect.querySelector('option:checked');
    usersDiv.classList.remove("hidden");
    reportDiv.classList.add("hidden");
    navBarBottom.classList.remove("hidden");

    populateUserTable();
}

function addViewReportLinkListener() {
    viewReportLink.classList.add("text-blue-600", "underline");
    userListSelect.classList.remove("text-blue-600", "underline");
    usersDiv.classList.add("hidden");
    reportDiv.classList.remove("hidden");
    navBarBottom.classList.add("hidden");
}

function populateUserTable() {
    if(selectedUserType.value.includes('Patient')) {
        populatePatientTable();
    } else if(selectedUserType.value.includes('Counselor')) {
        populateCounselorTable();
    } else if(selectedUserType.value.includes('Doctor')) {
        populateDoctorTable();
    }
    searchBar.addEventListener("keydown", searchListener);
}

function populatePatientTable() {
    getRequest(baseURL+"/patients").then(response => {
        console.log(response);
        return response.json();
    }).then(data => {
        console.log(data);
        setUpListPagination(data);
        userList = data;
    });
}

function populateCounselorTable() {
    getRequest(baseURL+"/workers").then(response => {
        console.log(response);
        return response.json();
    }).then(data => {
        console.log(data);
        setUpListPagination(data["counselors"]);
        userList = data["counselors"];
    });
}

function populateDoctorTable() {
    getRequest(baseURL+"/workers").then(response => {
        console.log(response);
        return response.json();
    }).then(data => {
        console.log(data);
        setUpListPagination(data["doctors"]);
        userList = data["doctors"];
    });
}

function searchListener() {
    let searchBar = document.getElementById("searchBar");
    let searchResults = [];
    const searchValue = searchBar.value;
    userList.forEach(patient => {
        if(patient['firstName'].includes(searchValue)
            || patient['lastName'].includes(searchValue)
            || patient['email'].includes(searchValue)) {
            searchResults.push(patient);
        }
    });
    setUpListPagination(searchResults, 1);
}

function setUpListPagination(data) {
    currPage = 1;
    const start = (currPage-1)*maxPerPage;
    const end = start + maxPerPage;

    setUpPaginationListeners(data);
    populateUserTableFromResponse(data.slice(start, end));
}

function setUpPaginationListeners(data) {
    numPages = Math.ceil(data.length/maxPerPage);
    document.querySelector(".numUsers").textContent = data.length;
    document.querySelector(".usersOrAppointmentsSpan").textContent = "Users(s)";

    addNavButtons(data);
    addPageSelect(data);
    addArrowEventListeners(data);
}

function addNavButtons(data) {
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
        addNavButtonEventListener(newNavBarButton,currPage + pageCount, data, data.slice((currPage + pageCount - 1)*maxPerPage,
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

function addNavButtonEventListener(newNavBarButton, page, data, dataSlice) {
    newNavBarButton.addEventListener("click", () => {
        currPage = page;
        populateUserTableFromResponse(dataSlice);
        addNavButtons(data);
    });
}

function addArrowEventListeners(data) {
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
            populateUserTableFromResponse(dataSlice);
            addNavButtons(data);
        }
    });

    newRArrow.addEventListener("click", () => {
        if(currPage !== numPages) {
            currPage++;
            const dataSlice = data.slice((currPage-1)*maxPerPage, (currPage-1)*maxPerPage + maxPerPage);
            populateUserTableFromResponse(dataSlice);
            addNavButtons(data);
        }
    });
}

function addPageSelect(data) {
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
        populateUserTableFromResponse(dataSlice);
        addNavButtons(data);
    })
}

function populateUserTableFromResponse(users){
    let html = '';
    for(let user of users){
        const dateCreated = user['dateCreated'];
        const name = user['firstName'] + " " + user['lastName'];
        const email = user['email'];
        const activated = typeof user['activated'] === 'undefined' ? true : user['activated'];
        html = setTableEntryForUsers(html, dateCreated, name, email, activated);
    }
    userTable.innerHTML = html;
}

function setTableEntryForUsers(html, dateCreated, name, email, activated) {
    html +=
        `<tr class="whitespace-nowrap border-b">
                <td class="px-6 py-4"> <a href="#" onclick="loadUserData('${email}')" class="text-sm text-blue-400 text-center underline">
                ${name}
                </a></td>
                <td class="px-6 py-4"> <div class="text-sm text-gray-500 text-center">
                ${email}
                </div></td>
                <td class="px-6 py-4"><div class="text-sm text-gray-500 text-center ">
                ${dateCreated}
                </div></td>
                <td class="px-6 py-4"><div class="text-sm text-blue-400 text-center underline">
                <button onclick="confirmDelete('${email}')" class="w-16 shadow-md text-sm text-white bg-red-500 mr-3"> Delete</button>`

        if(!activated) {
            html += `<button class="w-16 shadow-md text-sm text-white bg-blue-500" onclick="activateUser('${email}')">Activate</button>`;
        }

    html += `</div></td></tr>`;
    return html;
}

function activateUser(email) {
    cuteAlert({
        type: "question",
        title: "User Activation",
        message: "Confirm user activation",
        confirmText: "Activate",
        cancelText: "Cancel"
    }).then((e)=>{
        if ( e === ("confirm")){
            getRequest(baseURL+"/activate?email="+email).then(response =>{
                console.log("response");
                if(response.status === 200) {
                    cuteAlert({
                        type: "success",
                        title: "Activation Status",
                        message: "User Activated",
                        buttonText: "Okay"
                    }).then(()=> location.reload());
                } else {
                    cuteAlert({
                        type: "error",
                        title: "Activation Status",
                        message: "Unable to activate user, please try again later",
                        buttonText: "Okay"
                    });
                }
            });
        }
    });
}

function loadUserData(email){
    userInfoDiv.classList.remove("hidden");
    usersDiv.classList.add("hidden");
    navBarBottom.classList.add("hidden");
    searchDiv.classList.add("hidden");

    populateUserInfo(email);
    addCloseUserInfoListener();
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
    let address = document.getElementById("address2");
    let city = document.getElementById("city2");
    let postalCode = document.getElementById("postalCode2");
    let province = document.getElementById("province2");
    let dayOfBirth = document.getElementById("dayOfBirth2");
    let monthOfBirth = document.getElementById("monthOfBirth2");
    let yearOfBirth = document.getElementById("yearOfBirth2");
    let phoneNumber = document.getElementById("phoneNumber2");
    let email = document.getElementById("email2");
    let userDiv = document.getElementById("user2");

    address.value = user['address'];
    city.value = user['city'];
    postalCode.value = user['postalCode'];
    province.value = user['province'];
    dayOfBirth.value = user['dayOfBirth'];
    monthOfBirth.value = user['monthOfBirth'];
    yearOfBirth.value = user['yearOfBirth'];
    phoneNumber.value = user['phoneNumber'];
    email.value = user['email'];

    if(selectedUserType.value.includes("Patient")) {
        userDiv.value = 'Patient';
    } else if(selectedUserType.value.includes("Counselor")) {
        userDiv.value = 'Counselor';
    } else if(selectedUserType.value.includes("Doctor")) {
        userDiv.value = 'Doctor';
    }
}

function addCloseUserInfoListener() {
    let closeBtn = document.querySelector(".closeUserInfoBtn");
    let newButton = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newButton, closeBtn);
    newButton.addEventListener("click", ()=> {
        document.getElementById("userInfoDiv").classList.add("hidden");
        usersDiv.classList.remove("hidden");
        navBarBottom.classList.remove("hidden");
        searchDiv.classList.remove("hidden");
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

async function postData(url = "", data = {}) {
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

//---------Mostly just a copy of register.js-----------------//

addDays();
addYears();

function addDays() {
    let select = document.getElementById("dayOfBirth");
    for (let i = 1; i <= 31; i = i + 1) {
        const option = new Option(i);
        select.add(option);
    }
}

function addYears() {
    let select = document.getElementById("yearOfBirth");
    for (let i = 2021; i >= 1900; i = i - 1) {
        const option = new Option(i);
        select.add(option);
    }
}

function addBlackBorder(field) {
    document.getElementById(field).addEventListener("click", function () {
        document.getElementById(field).classList.add('border-gray-300');
        document.getElementById(field).classList.remove('border-red-600');
    });
    document.getElementById(field).addEventListener("change", function () {
        document.getElementById(field).classList.add('border-gray-300');
        document.getElementById(field).classList.remove('border-red-600');
    });
}
function displayRegField() {
    const select = document.getElementById("user");
    if (select.value === 'counselor' || select.value === 'doctor') {
        document.getElementById("registration").type = 'text';
    } else {
        document.getElementById("registration").type = 'hidden';
    }
}

function regButton() {
    const form = document.getElementById("regForm");
    const data = Object.fromEntries(new FormData(form).entries());
    const user = data.user;
    switch (user) {
        case "patient":
            regPatient();
            break;
        case "counselor":
            regCounselor();
            break;
        case "doctor":
            regDoctor();
            break;
        default:
            handleFieldErrors({"errorFields": ['user']});
    }
}

function handleFieldErrors(data) {
    const errors = data['errorFields']
    for (const field of errors) {
        document.getElementById(field).classList.remove('border-gray-300');
        document.getElementById(field).classList.add('border-red-600');
        addBlackBorder(field);
    }
}

function regPatient() {
    const form = document.getElementById("regForm");
    const data = Object.fromEntries(new FormData(form).entries());
    postData(baseURL + "/" + "patient", data).then(response => {
        handlePostResponse(response, false);
        return response.json();
    }).then(data => {
        handleFieldErrors(data);
    });
}

function regCounselor() {
    const form = document.getElementById("regForm");
    const data = Object.fromEntries(new FormData(form).entries());
    data['activated'] = true;
    postData(baseURL + "/" + "counselor", data).then(response => {
        handlePostResponse(response, true);
        return response.json();
    }).then(data => {
        handleFieldErrors(data);
    });
}

function regDoctor() {
    const form = document.getElementById("regForm");
    const data = Object.fromEntries(new FormData(form).entries());
    data['activated'] = true;
    postData(baseURL + "/" + "doctor", data).then(response => {
        handlePostResponse(response, true);
        return response.json();
    }).then(data => {
        handleFieldErrors(data);
    });
}

function handlePostResponse(response, isWorker) {
    if (response.status === 201) {
        if(isWorker) {
            cuteAlert({
                type: "success",
                title: "User Creation Status",
                message: "User registered and activated successfully",
                buttonText: "Okay"
            }).then(()=> window.location.replace(baseURL));
        } else {
            cuteAlert({
                type: "success",
                title: "User Creation Status",
                message: "User registered",
                buttonText: "Okay"
            }).then(()=> window.location.replace(baseURL));
        }
    }
    console.log(response)
}