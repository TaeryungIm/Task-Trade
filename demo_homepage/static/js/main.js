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

// Link API function to quest_window
function link_quest() {
    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");

        fetch('/login', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/login';  // Redirect to login page
            }
        }).catch(error => {
            console.error("Error linking to login page:", error);
        });
    }
    // If logged in, link to quest page
    else {
        fetch('/quest', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => {
            if (response.ok) {
                window.location.href = '/quest';  // Redirect to quest page
            }
        }).catch(error => {
            console.error("Error linking to quest page:", error);
        });
    }
}
