// Define variables globally
const logoutBtn = document.getElementById('logout-btn');

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
    const quest_button = document.getElementById('quest-btn');
    quest_button.style.color = '#007bff';

    if (!accessToken) {
        // User is logged out
        alert("please log in!");
        window.location.replace("/login");
    }
};

// receiving userid api
async function getUserId(accessToken){
    if (!accessToken) {
        alert("Access token not found. Please log in.");
        return null;
    }

    if (accessToken) {
        try {
            // Make a request to the protected endpoint to verify the token and get user information
            const response = await fetch("/login/protected-endpoint", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                userid = data.user_id; // Assign userid if the token is valid
            } else {
                throw new Error("Invalid token");
            }
        } catch (error) {
            console.error("Error verifying access token:", error);
            alert("Error verifying access token. Please log in again.");
            return; // Stop the function if there's an error with the token
        }
    } else {
        alert("Access token not found. Please log in.");
        return; // Stop the function if no access token is available
    }

    // Ensure userid was successfully retrieved
    if (!userid) {
        alert("Unable to retrieve user information. Please try again.");
        return;
    }
}

// Simulate logout function
function logout(event) {
    event.preventDefault();
    // Remove the user from localStorage
    tokenManager.clearToken();

    // Go back to main page
    alert("로그아웃 되었습니다!");
    window.location.replace("/");
}

// Link API function to inquiry page
function link_inquiry(event) {
    event.preventDefault();
    window.location.replace("/inquiry");
}

// Link API function to coin charge page
function link_coin_charge(event) {
    event.preventDefault();
    window.location.replace("/charge");
}

// Link API function to coin exchange page
function link_coin_exchange(event) {
    event.preventDefault();
    window.location.replace("/exchange");
}

// this function is for posting quest data to the database
async function postQuest(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    var q_title = document.getElementById('quest-title').value;
    var q_type = document.getElementById('quest-type').value;
    var q_content = document.getElementById('quest-content').value;

    const accessToken = tokenManager.getToken();
    var userid = getUserId(accessToken);
    if (!userid) {
        alert("Failed to retrieve user ID. Please log in again.");
        return;
    }

    var quest_data = {
        user_id: userid,
        quest_title: q_title,
        quest_type: q_type,
        quest_content: q_content
    };

    var jsonstr = JSON.stringify(quest_data);

    // Make the AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/quest/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonstr);

    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("퀘스트가 등록 되었습니다!");

            // Clear the form fields
            document.getElementById('quest_title').value = '';
            document.getElementById('quest_type').value = '';
            document.getElementById('quest_content').value = '';
        } else if (xhr.status === 422) {  // Handle validation errors
            let response = JSON.parse(xhr.responseText);
            let errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error posting quest: " + xhr.responseText);
        }
    };
}
