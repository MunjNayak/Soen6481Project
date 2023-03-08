const data = JSON.parse(localStorage.getItem('data'));

document.querySelector("[data-property='interest']").innerText = data["interest"];
document.querySelector("[data-property='feeling']").innerText = data["feeling"];
document.querySelector("[data-property='sleep']").innerText = data["sleep"];
document.querySelector("[data-property='tired']").innerText = data["tired"];
document.querySelector("[data-property='appetite']").innerText = data["appetite"];
document.querySelector("[data-property='feeling-down']").innerText = data["feeling-down"];
document.querySelector("[data-property='concentration']").innerText = data["concentration"];
document.querySelector("[data-property='slowness']").innerText = data["slowness"];
document.querySelector("[data-property='killing']").innerText = data["killing"];