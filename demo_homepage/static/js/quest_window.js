// Define variables globally
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

// check status on main page according to login/out states
window.onload = function() {
    const userid = localStorage.getItem("userid");

    if (userid) {
        // User is logged in
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        // User is logged out
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
};
