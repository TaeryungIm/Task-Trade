// Define variables globally
const user_section = document.getElementById('user-section');
const sidebar_login = document.getElementById('sidebar-login');
let current_page = 1;

// Utility to manage access token
const tokenManager = {
    getToken: function() {
        return localStorage.getItem("access_token");
    },
    setToken: function(token) {
        localStorage.setItem("access_token", token);
    },
    clearToken: function() {
        localStorage.removeItem("access_token");
    }
};

// check status on main page according to login/out states
window.onload = function() {
    const accessToken = tokenManager.getToken();

    if (accessToken) {
        // User is logged in
        document.getElementById('logged-in-headers').style.display = 'block';
        document.getElementById('logged-out-headers').style.display = 'none';
        user_section.style.display = 'block';
        sidebar_login.style.display = 'none';
    } else {
        // User is logged out
        document.getElementById('logged-in-headers').style.display = 'none';
        document.getElementById('logged-out-headers').style.display = 'block';
        user_section.style.display = 'none';
        sidebar_login.style.display = 'block';
    }

    showBoxes(current_page);
};

// Link API function to login page
function login() {
    const accessToken = tokenManager.getToken();

    if(!accessToken){
        window.location.href = '/login';
    }
    else{
        alert("Already logged in!");
    }
}

// Simulate logout function
function logout() {
    // Remove the user from localStorage
    tokenManager.clearToken();

    // Update the UI
    alert("로그아웃 되었습니다!");
    document.getElementById('logged-in-headers').style.display = 'none';
    document.getElementById('logged-out-headers').style.display = 'block';
    user_section.style.display = 'none';
    sidebar_login.style.display = 'block';
}

// Link API function to quest_window page
function link_quest() {
    const loginBtn = document.getElementById('login-btn');

    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");
        window.location.href = '/login';
    }
    // If logged in, link to quest page
    else {
        window.location.href = '/quest';
    }
}

// Link API function to inquiry page
function link_inquiry() {
    const loginBtn = document.getElementById('login-btn');

    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");
        window.location.href = '/login';
    }
    // If logged in, link to inquiry page
    else {
        window.location.href = '/inquiry';
    }
}

// Link API function to coin account page
function link_coin_account() {
    const loginBtn = document.getElementById('login-btn');

    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");
        window.location.href = '/login';
    }
    // If logged in, link to exchange page
    else {
        window.location.href = '/coin';
    }
}

function showBoxes(page) {
    const boxRow = document.querySelector('.box-row');
    const boxes = boxRow.querySelectorAll('.box');
    boxes.forEach((box, index) => {
        const quest_index = 5 * (page - 1) + index + 1;

        fetch('/quest/display', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quest_index: quest_index })
        })
        .then(response => {
            if (!response.ok) {
                // If response status is not 200, throw an error
                throw new Error(`No quest found with ID: ${quest_index}`);
            }
            return response.json();
        })
        .then(data => {
            box.innerHTML = `Title: ${data.quest_title}<br>
            Type: ${data.quest_type}<br>
            Last Update: ${data.updated_at}`;
        })
        .catch(error => {
            box.textContent = "No Quest";
        });
    });
}

function prevPage() {
    if (current_page === 2) {
        current_page = 1;
        showBoxes(current_page);
    }
}

function nextPage() {
    if (current_page === 1) {
        current_page = 2;
        showBoxes(current_page);
    }
}
