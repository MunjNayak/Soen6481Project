const data = {};

let sections = document.querySelectorAll('.question-wrapper > section');

const handleClick = (event) => {
  // Reset previously selected button
  [...event.target.parentElement.getElementsByTagName('button')].forEach((button) => {
    button.classList.remove('text-white');
    button.classList.remove('bg-sky-600');
  });

  // Add bg-color and white text to clicked button
  if (event.target.tagName === 'BUTTON') {
    event.target.classList.add('bg-sky-600');
    event.target.classList.add('text-white');

    // Add answer to data
    data[event.currentTarget.dataset.property] = event.target.innerText;
    console.log(data);
    localStorage.setItem('data', JSON.stringify(data));
  }
};


// Add click eventlistener to all sections within .question-wrapper section
(() => {
  sections.forEach((section) => {
    section.addEventListener('click', handleClick);
  });
})();

