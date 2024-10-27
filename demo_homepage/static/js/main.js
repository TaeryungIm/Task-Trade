// Define variables globally
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const user_info = document.getElementById('state_login');
const user_login = document.getElementById('login_link');

// check status on main page according to login/out states
window.onload = function() {
    const userid = localStorage.getItem("userid");
    if (userid) {
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
};

// Simulate logout function
function logout() {
    // Remove the user from localStorage
    localStorage.removeItem("userid");
    localStorage.removeItem("access_token");

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
