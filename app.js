
function openTab(tabIndex) {
    let contents = document.querySelectorAll(".tab-content");
    let btns = document.querySelectorAll(".tab-btn");
    let tabContainer = document.querySelector(".tab-container");
    let tabTitle = document.querySelector("#tabTitle");
    let flexbox = document.querySelector(".flexbox");
    let pseudoInput = document.querySelector("#pseudo-input");
    
    for (let i = 0; i < btns.length; i++) {
        if (contents[i]) {
            contents[i].style.display = "none";
        }
        btns[i].classList.remove("active");
    }
    
    if (contents[tabIndex]) {
        contents[tabIndex].style.display = "block";
        btns[tabIndex].classList.add("active");
        tabContainer.classList.add("active");
        tabTitle.textContent = btns[tabIndex].textContent;
        flexbox.style.display = "none";
        pseudoInput.style.display = "none";
    }
}

function closeTab() {
    let contents = document.querySelectorAll(".tab-content");
    let btns = document.querySelectorAll(".tab-btn");
    let tabContainer = document.querySelector(".tab-container");
    let flexbox = document.querySelector(".flexbox");
    let pseudoInput = document.querySelector("#pseudo-input");
    
    for (let i = 0; i < contents.length; i++) {
        contents[i].style.display = "none";
        btns[i].classList.remove("active");
    }
    tabContainer.classList.remove("active");
    flexbox.style.removeProperty("display");
    pseudoInput.style.removeProperty("display");
}

document.addEventListener("DOMContentLoaded", function() {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const closeTabBtn = document.querySelector("#closeTabBtn");
    
    tabButtons.forEach((button, index) => {
        button.addEventListener("click", function() {
            openTab(index);
        });
    });
    
    closeTabBtn.addEventListener("click", function() {
        closeTab();
    });
});
