// Define variables globally
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const user_info = document.getElementById('state_login');
const user_login = document.getElementById('login_link');
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
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        user_info.style.display = 'block';
        user_login.style.display = 'none';
    } else {
        // User is logged out
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        user_info.style.display = 'none';
        user_login.style.display = 'block';
    }

    showBoxes(currentPage);
};

// Simulate logout function
function logout() {
    // Remove the user from localStorage
    tokenManager.clearToken();

    // Update the UI
    alert("로그아웃 되었습니다!");
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    user_info.style.display = 'none';
    user_login.style.display = 'block';
}

// Link API function to quest_window page
function link_quest() {
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

// Link API function to exchange page
function link_exchange() {
    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");
        window.location.href = '/login';
    }
    // If logged in, link to exchange page
    else {
        window.location.href = '/exchange';
    }
}

function showBoxes(page) {
    const boxRow = document.querySelector('.box-row');
    const boxes = boxRow.querySelectorAll('.box');
    boxes.forEach((box, index) => {
        const questIndex = 5 * (page - 1) + index + 1;

        fetch('/quest/display', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: questIndex })
        })
        .then(response => {
            if (!response.ok) {
                // If response status is not 200, throw an error
                throw new Error(`No quest found with ID: ${questIndex}`);
            }
            return response.json();
        })
        .then(data => {
            box.textContent = `Title: ${data.quest_title}\nType: ${data.quest_type}\nLast Update: ${data.updated_at}`;
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
