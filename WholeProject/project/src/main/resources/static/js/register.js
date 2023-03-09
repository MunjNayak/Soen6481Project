const baseURL = window.location.origin;

document.addEventListener('DOMContentLoaded', function () { //run when page loaded
    addDays();
    addYears();
}, false);


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
function goToRegister() {
    window.location.replace(baseURL + "/register");
}
function goToLoginPage(){
    console.log(baseURL,"abhishek");
    window.location.replace(baseURL + "/");

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
    postData(baseURL + "/" + "doctor", data).then(response => {
        handlePostResponse(response, true);
        return response.json();
    }).then(data => {
        handleFieldErrors(data);
    });
}

function handlePostResponse(response, isWorker) {
    if (response.status === 201) {
        if (isWorker) {
            cuteAlert({
                type: "success",
                title: "User Registration",
                message: 'User registered successfully, please wait for manager approval.',
                buttonText: "Okay"
            }).then(() => window.location.replace(baseURL));
        } else {
            cuteAlert({
                type: "success",
                title: "User Registration",
                message: 'User registered successfully, please log in.',
                buttonText: "Okay"
            }).then(() => window.location.replace(baseURL));
        }
    }
    console.log(response)
}

async function postData(url = '', data = {}) {
    return await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });
}


