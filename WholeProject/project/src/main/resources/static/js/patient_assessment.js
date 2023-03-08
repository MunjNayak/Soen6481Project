const data = {};

// let sections = document.querySelectorAll('.question-wrapper > section');
const getRequest = async (url = '', data = {}) => {
  return await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
  });
}
document.addEventListener("DOMContentLoaded", () => {
  let welcomeDiv = document.querySelector(".username");
  getRequest("/user", {}).then(response => {
    console.log(response);
    return response.json();
  }).then(user => {
    const name = user['firstName'] + " " + user['lastName'];
    welcomeDiv.innerText = "Patient Dashboard - Welcome " + name;
  })
});
document.addEventListener("DOMContentLoaded", (event) => {
  fetch("../templates/assessment_content.html")
      .then((data) => data.text())
      .then((html) => {
        document.getElementById("assessmentContents").innerHTML = html;
        const event = document.createEvent("HTMLEvents");
        event.initEvent("html_injected", true, true);
        document.dispatchEvent(event);
      });
});
document.addEventListener("html_injected", (event) => {
  const startBtn = document.querySelector(".btn-start");
  const baseURL = window.location.origin;
  const logoutBtn = document.querySelector(".logout");


  const instructions = document.querySelector(".instructions-content");
  const assessment = document.querySelector(".assessment-content");
  const submitBtn = document.querySelector(".submit-btn");

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
  };
  logoutBtn.addEventListener("click", () => {
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
  });
  const handleClick = (event) => {
    // Reset previously selected button
    [...event.target.parentElement.getElementsByTagName('button')].forEach((button) => {
      button.style.backgroundColor="white";
    });

    // Add bg-color and white text to clicked button
    if (event.target.tagName === 'BUTTON') {
      event.target.style.backgroundColor="blue";

      // Add answer to data
      data[event.currentTarget.dataset.property] = event.target.innerText;
      console.log(data);
      //localStorage.setItem('data', JSON.stringify(data));
    }
  };

  let sections = document.querySelectorAll('.question-wrapper > section');
  console.log(sections)
  sections.forEach((section) => {
    section.addEventListener('click', handleClick);
  });



  const reveal = (...elements) => {
    elements.forEach((elem) => {
      elem.classList.remove("hidden");
    });
  };

  const hide = (...elements) => {
    elements.forEach((elem) => {
      elem.classList.add("hidden");
    });
  };

  startBtn.addEventListener("click", (e) => {
    hide(instructions);
    reveal(assessment);
  });

  submitBtn.addEventListener("click", () => {
    postData(baseURL + "/assessment", data)
        .then((response) => {
          console.log(response);
          if (response.status === 201) {
            cuteAlert({
              type: "success",
              title: "Assessment Status",
              message: "Assessment saved, please check 'My Appointment'",
              buttonText: "Okay"
            }).then(()=> window.location.replace(baseURL + "/patient_dashboard"));
          }
          response.json();
        })
        .then((data) => {
          console.log(data);
        });
  });
});




