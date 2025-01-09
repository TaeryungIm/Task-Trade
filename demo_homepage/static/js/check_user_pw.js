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
// Ensure login status on page load
window.onload = async function () {
    const accessToken = tokenManager.getToken();
    if (!accessToken) {
        redirectToLogin("Please log in.");
        return;
    }

    const user = await verifyUser(accesoken);
    if (!user) {
        redirectToLogin("Failed to verify user. Please log in again.");
    }
};

// Redirect to login with a message
function redirectToLogin(message) {
    alert(message);
    tokenManager.clearToken();
    window.location.replace("/login");
}

// Fetch user details from the server using the access token
async function verifyUser(accessToken) {
    try {
        const response = await fetch("/login/protected-endpoint", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            return await response.json();
        } else if (response.status === 401) {
            redirectToLogin("Your session has expired. Please log in again.");
        } else {
            throw new Error("Failed to verify token.");
        }
    } catch (error) {
        console.error("Error verifying access token:", error);
        alert("An error occurred while verifying your session.");
        return null;
    }
}

// Handle password verification
async function handlePWCheck(event) {
    event.preventDefault();

    const accessToken = tokenManager.getToken();
    const user = await verifyUser(accessToken);
    if (!user) return;

    const userPW = document.getElementById("current_password").value;
    const formData = new URLSearchParams({ userid: user.user_id, userpw: userPW });

    try {
        const response = await fetch("/account/pwcheck", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });

        const data = await response.json();
        if (response.ok && data.success) {
            await sendPWUpdateEmail(user.user_id);
        } else {
            alert(data.message || "Password verification failed.");
        }
    } catch (error) {
        console.error("Error verifying password:", error);
        alert("An error occurred during password verification.");
    }
}

// Send password update email
async function sendPWUpdateEmail(userid) {
    try {
        const response = await fetch("/account/update/password/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userid }),
        });

        if (response.ok) {
            alert("비밀번호 업데이트 링크가 이메일로 전송되었습니다.");
        } else {
            const errorData = await response.json();
            alert(`Failed to send password update email: ${errorData.detail}`);
        }
    } catch (error) {
        console.error("Error sending password update email:", error);
        alert("An error occurred while sending the password update email.");
    }
}
