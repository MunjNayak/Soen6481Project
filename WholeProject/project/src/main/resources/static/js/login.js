const baseURL = window.location.origin;

document.addEventListener('DOMContentLoaded', function () { //run when page loaded
    setIndividualActiveListener();
    setWorkerActiveListener();

}, false);

function setIndividualActiveListener() {
    document.getElementById("individual").addEventListener('click', e => {
        document.getElementById("individual").classList.add('active')
        document.getElementById("worker").classList.remove('active')
    })
}

function setWorkerActiveListener() {
    document.getElementById("worker").addEventListener('click', e => {
        document.getElementById("worker").classList.add('active')
        document.getElementById("individual").classList.remove('active')
    })
}

function goToRegister() {
    window.location.replace(baseURL + "/register");
}
function goToLoginPage(){
    window.location.replace(baseURL + "/");

}

function loginToSystem() {
    const form = document.getElementById("loginForm");
    const data = Object.fromEntries(new FormData(form).entries());
    postData(baseURL + "/" + "login", data).then(response => {
        if(response.ok){
            window.location.replace(baseURL + "/");
        } else if(response.status === 401) {
            cuteAlert({
                type: "error",
                title: "Login error",
                message: "Invalid username/password, please try again.",
                buttonText: "Okay"
            });
        } else {
            cuteAlert({
                type: "error",
                title: "Login error",
                message: "Please wait for manager verification",
                buttonText: "Okay"
            });
        }
    });
}

function managerLoginToSystem() {
    const form = document.getElementById("loginForm");
    const data = Object.fromEntries(new FormData(form).entries());
    postData(baseURL + "/" + "managerLogin", data).then(response => {
        if(response.ok){
            window.location.replace(baseURL + "/");
        } else {
            alert("unable to login: " + response.status + " " + response.statusText);
        }
    })
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