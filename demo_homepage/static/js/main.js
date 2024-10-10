// Define variables globally
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const user_info = document.getElementById('state_login');
const user_login = document.getElementById('login_link');

// check status on main page according to login/out states
window.onload = function() {
    const username = localStorage.getItem("username");

    if (username) {
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
    localStorage.removeItem("username");
    localStorage.removeItem("access_token");

    // Update the UI
    alert("로그아웃 되었습니다!");
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
    user_info.style.display = 'none';
    user_login.style.display = 'block';
}
