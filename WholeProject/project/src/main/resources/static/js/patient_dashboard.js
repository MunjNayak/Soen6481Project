document.addEventListener('DOMContentLoaded', (event) => {
    fetch('../templates/assessment_content.html')
        .then(data => data.text())
        .then(html => {
            document.getElementById('assessmentContents').innerHTML = html;
            const event = document.createEvent('HTMLEvents');
            event.initEvent('html_injected', true, true);
            document.dispatchEvent(event);
        });
});

document.addEventListener('html_injected', (event) => {
    // -- Variables ---
    const baseURL = window.location.origin;

    // --- Buttons ---
    const selfAssessBtn = document.querySelector(".main-nav > a:nth-child(1)");
    const appointmentBtn = document.querySelector(".main-nav > a:nth-child(2)");
    const logoutBtn = document.querySelector(".logout");

    // --- Content containers ---
    const questionDivs = document.querySelectorAll("[data-options]");
    const mainAssessmentDiv = document.querySelector(".assessment-content");
    const otherQuestionsDive = document.querySelector(".other-questions");
    const appointmentsDiv = document.querySelector(".appointments");
    const submitButton = document.querySelector(".submit-btn");
    const redoButton = submitButton.cloneNode(true);
    const usernameSpan = document.querySelector(".username");

    // --- Eventlisteners ---
    selfAssessBtn.addEventListener("click", () => {
        appointmentBtn.classList.remove("underline");
        appointmentBtn.classList.remove("text-blue-600");
        selfAssessBtn.classList.add("underline");
        selfAssessBtn.classList.add("text-blue-600");
        displayAssessment();
        hideAppointment();
    });

    appointmentBtn.addEventListener("click", () => {
        appointmentBtn.classList.add("underline");
        appointmentBtn.classList.add("text-blue-600");
        selfAssessBtn.classList.remove("underline");
        selfAssessBtn.classList.remove("text-blue-600");
        hideAssessment();
        displayAppointment();
    });

    logoutBtn.addEventListener("click", () => {
        logout();
    });

    // --- Utility functions ---
    const hideAssessment = () => {
        document.getElementById('assessmentContents').classList.add('hidden');
    }

    const hideAppointment = () => {
        appointmentsDiv.classList.add('hidden');
    }

    const displayAppointment = () => {
        getAppointment().then(appointment => {
            console.log(appointment);
            const date = appointment['appDate'] == null ? "" : appointment['appDate'];
            const time = appointment['time'] == null ? "" : appointment['time'];
            const status = appointment['status'];
            const profType = appointment['withCounselor'] === null ? "" : appointment['withCounselor'] === true ? "Counselor" : "Doctor";
            const profName = appointment['medicalWorkerName'] === null ? "" : appointment['medicalWorkerName'];
            const location = date === "" ? "" : "main clinic";
            const comments = appointment['message'];

            document.getElementById("tableBody").innerHTML =
                setTableEntry(date, time, status, profType, profName, location, comments);
            addCommentEventListener(comments);
            addCancelButton(status);
        });
        appointmentsDiv.classList.remove('hidden');
    }

    const getAppointment = () => {
        return getRequest(baseURL + '/appointment')
            .then(response => {
                console.log(response);
                return response.json();
            });
    };

    const addCancelButton = (status) => {
        if(status !== 'scheduled'){
            return;
        }
        let cancelTh = document.querySelector(".cancelTH");
        let cancelTD = document.querySelector(".cancelTD");

        let cancelBtn = document.createElement('button');
        cancelBtn.className = "inline-block w-16 shadow-md text-sm text-white bg-yellow-500";
        cancelBtn.innerHTML = "Cancel"
        cancelTD.appendChild(cancelBtn);

        addCancelEventListener(cancelBtn);
    }

    const addCancelEventListener = (cancelBtn) => {
        cancelBtn.addEventListener("click", () => {
            cuteAlert({
                type: "question",
                title: "Appointment Cancellation",
                message: 'Are you sure you wish to cancel your appointment?',
                confirmText: "Yes",
                cancelText: "Go Back"
            }).then((e)=> {
                if (e === ("confirm")) {
                    const appointment = new Map([
                        ['status', 'cancelled'],
                    ]);
                    postData(baseURL + "/appointment", Object.fromEntries(appointment)).then(response => {
                        console.log(response);
                        if (response.status === 200) {
                            cuteAlert({
                                type: "success",
                                title: "Appointment Status",
                                message: "Appointment cancelled",
                                buttonText: "Okay"
                            }).then(() => location.reload());
                        } else {
                            cuteAlert({
                                type: "error",
                                title: "Appointment Status",
                                message: "Unable to cancel appointment. Please try again later.",
                                buttonText: "Okay"
                            });
                        }
                    });
                }
            });
        })
    }

    const setTableEntry = (date, time, status, profType, profName, location) => {
        const html =
            `<tr class="whitespace-nowrap border-b">
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                ${date}
                </div></td>
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                ${time}
                </div></td>
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                ${status}
                </div></td>
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                ${profType}
                </div></td>
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                ${profName}
                </div></td>
                <td class="px-6 py-4"> <div class="text-sm text-gray-900 text-center">
                ${location}
                </div></td>
                <td class="px-6 py-4"> <div class="text-sm text-blue-600 text-center">
                <a href="#" class="viewComment underline">view comment</a>
                </div></td>
                <td class="px-6 py-4"> <div class="cancelTD text-sm text-gray-900 text-center">
                </div></td>
            </tr>`
        return html;
    }

    const addCommentEventListener = (comments) => {
        document.querySelector(".viewComment").addEventListener("click", () => {
            cuteAlert({
                type: "info",
                title: "Appointment Status",
                message: comments,
                buttonText: "Okay"
            });
        })
    }

    const displayAssessment = () => {
        getAssessment().then(assessment => {
            unhideInitialDivs();
            hideSubmitButton();
            unhideAssessmentDivs(assessment);
        });
        document.getElementById('assessmentContents').classList.remove("hidden");
    };

    const getAssessment = () => {
        return getRequest(baseURL + '/assessment')
            .then(response => {
                console.log(response);
                if (response.status === 404) {
                    location.assign(baseURL + "/patient_assessment");
                }
                return response.json();
            });
    };

    const unhideInitialDivs = () => {
        mainAssessmentDiv.classList.remove("hidden");
        // otherQuestionsDive.classList.remove("hidden");
    }

    const hideSubmitButton = () => {
        getRequest("/canRedoAssessment", "").then(response => {
            console.log(response);
            return response.json();
        }).then(canRedo => {
            submitButton.classList.add("hidden");
            if(canRedo) {
                addRedoButton();
            }
        })

    }

    const addRedoButton = () => {
        if(!Array.from(submitButton.parentNode.childNodes).includes(redoButton)){
            redoButton.innerHTML = "Redo Assessment";
            redoButton.classList.remove("disabled", "submit-btn");
            redoButton.classList.add("bg-yellow-500", "py-3", "normal-case");
            redoButton.disabled = false;
            submitButton.parentNode.appendChild(redoButton);
            addRedoButtonListener();
        }
    }

    const addRedoButtonListener = () => {
        redoButton.addEventListener("click", () => {
            cuteAlert({
                type: "question",
                title: "Redo Assessment",
                message: "Are you sure you want to redo the assessment?",
                confirmText: "Redo",
                cancelText: "Back"
            }).then((e)=> {
                if (e === ("confirm")) {
                    getRequest("/deleteAssessment", "").then(response => {
                        if (response.status === 200) {
                            cuteAlert({
                                type: "success",
                                title: "Assessment Status",
                                message: "Assessment deleted, you may now redo it.",
                                buttonText: "Okay"
                            }).then(() => location.reload());
                        } else {
                            cuteAlert({
                                type: "error",
                                title: "Assessment Status",
                                message: "Unable to delete assessment, please try again later",
                                buttonText: "Okay"
                            });
                        }
                    })
                }
            });
        });
    }

    const unhideAssessmentDivs = (assessment) => {
        const assessmentMap = Object.entries(assessment);
        assessmentMap.forEach((val, key) => {
            const questNum = String(val[0]);
            const activeButtonNum = val[1];
            console.log(questNum, activeButtonNum);
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

    const appendPara = (response, question) => {
        let para = document.createElement("p");
        para.classList.add("text-center");
        para.innerHTML = "Answer: ".bold() + response;
        question.lastChild.replaceWith(para);
    }

    const hideButtons = (question) => {
        for (let i = 1; i <= 3; i++) {
            let q = question.querySelector("button:nth-of-type(" + i + ")");
            if (q != null) {
                q.classList.add('hidden');
            }
        }
    }

    const logout = () => {
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

    const getRequest = async (url = '', data = {}) => {
        return await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
        });
    };

    const postData = async (url = "", data = {}) => {
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

    // --- Page loading functions ---
    getRequest("/user").then(response => {
        console.log(response);
        return response.json();
    }).then(user => {
        const name = user['firstName'] + " " + user['lastName'];
        usernameSpan.innerText = "Patient Dashboard - Welcome " + name;
    });

});