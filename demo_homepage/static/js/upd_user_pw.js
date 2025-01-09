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

// Block the inputs initially and check login status on page load
window.onload = async function() {

    const accessToken = tokenManager.getToken();
    if (!accessToken) {
        alert("Please log in.");
        window.location.replace("/login");
    }

    // Optional: You could validate the token on load
    const user = await getUser(accessToken);
    if (!user) {
        alert("Failed to verify user. Please log in again.");
        tokenManager.clearToken();
        window.location.replace("/login");
    }
};

// Get user ID from access token by calling the server
async function getUser(accessToken) {
    if (!accessToken) {
        alert("Access token not found. Please log in.");
        return null;
    }

    try {
        const response = await fetch("/login/protected-endpoint", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        } else if (response.status === 401) {
            alert("Your session has expired. Please log in again.");
            tokenManager.clearToken();
            window.location.replace("/login");
        } else {
            throw new Error("Failed to verify token.");
        }
    } catch (error) {
        console.error("Error verifying access token:", error);
        alert("An error occurred while verifying your session. Please log in again.");
        return null;
    }
}

// Handle account update
async function handlePasswordUpdate(event) {
    event.preventDefault(); // Prevent default form submission

    const accessToken = tokenManager.getToken();
    const user = await getUser(accessToken);
    if (!user) {
        alert("Failed to retrieve user. Please log in again.");
        return;
    }

    const upd_pw = document.getElementById('password').value;
    const conf_upd_pw = document.getElementById('password_confirm').value;

    // confirm new updated password
    if (upd_pw !== conf_upd_pw) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    const upd_data = {
        cur_id: user.user_id,
        upd_pw: upd_pw
    };

    fetch('/account/update/userdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(upd_data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message); // Show success message
            document.getElementById('current_password').value = '';
            document.getElementById('password').value = '';
            document.getElementById('password_confirm').value = '';

            // Redirect to profile page
            // and clear the remaining token
            tokenManager.clearToken();
            window.location.replace("/account/profile");
        } else {
            alert(data.message); // Show failure message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    });
}
