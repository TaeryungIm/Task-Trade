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

window.onload = async function() {
    const accessToken = tokenManager.getToken();

    if (!accessToken) {
        alert("Access token not found. Please log in.");
        tokenManager.clearToken(); // assure clearing the inaccurate token
        window.location.replace("/login"); // Redirect to login page
        return;
    }

    const user = await getUser(accessToken);

    if (user) {
        document.getElementById("username_profile").innerText = user.user_name;
        document.getElementById("userid_profile").innerText = user.user_id;
        document.getElementById("userid_section").innerText = user.user_id;
        document.getElementById("username_section").innerText = user.user_name;
        document.getElementById("user_contact_section").innerText = maskContact(user.user_contact);
    }
};

// masking phone number contact
function maskContact(contact) {
    if (!contact || contact.length < 11) {
        return "Invalid contact"; // Handle invalid input
    }
    // Format as 010-1***-5***
    return `${contact.slice(0, 3)}-${contact[3]}***-${contact[7]}***`;
}

async function getUser(accessToken) {
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
            throw new Error("Failed to fetch user details");
        }
    } catch (error) {
        console.error("Error verifying access token:", error);
        alert("Error verifying access token. Please log in again.");
        tokenManager.clearToken();
        window.location.replace("/login");
        return null;
    }
}
