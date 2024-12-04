// Define variables globally
const logoutBtn = document.getElementById('logout_btn');

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
    const inquiry_button = document.getElementById('inquiry-btn');
    inquiry_button.style.color = '#007bff';

    if (!accessToken) {
        // User is logged out
        alert("please log in!");
        window.location.replace("/login");
    }
};

// In order to invoke both postInquiry and sendInquiry
async function handleInquiry(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    const accessToken = tokenManager.getToken();
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
    }

    const userid = await getUserId(accessToken); // Await here to ensure `userid` is retrieved before proceeding
    if (!userid) {
        return; // Stop if `userid` couldn't be retrieved
    }

    postInquiry(userid);
//    sendInquiry(userid);
}

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
                return data.user_id; // Return userid if the token is valid
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

// Link API function to quest_window page
function link_quest(event) {
    event.preventDefault();
    window.location.replace("/quest");
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

// post inquiry to the db
function postInquiry(userid) {
    var inq_title = document.getElementById('inquiry-title').value;
    var inq_content = document.getElementById('inquiry-content').value;

    var inquiry_data = {
        user_id: userid,
        inquiry_title: inq_title,
        inquiry_content: inq_content
    };

    var jsonstr = JSON.stringify(inquiry_data);

    // Make the AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/inquiry/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonstr);

    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("문의가 전송 되었습니다!");

        } else if (xhr.status === 422) {  // Handle validation errors
            let response = JSON.parse(xhr.responseText);
            let errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error posting quest: " + xhr.responseText);
        }
    };
}

// send posted inquiry to the designated email
//function sendInquiry(userid) {
//    var inq_title = document.getElementById('inquiry-title').value;
//    var inq_content = document.getElementById('inquiry-content').value;
//
//    var inquiry_data = {
//        user_id: userid,
//        inquiry_title: inq_title,
//        inquiry_content: inq_content
//    };
//
//    var jsonstr = JSON.stringify(inquiry_data);
//
//    // Make the AJAX request
//    var xhr = new XMLHttpRequest();
//    xhr.open("POST", "/inquiry/send_email");
//    xhr.setRequestHeader("Content-Type", "application/json");
//    xhr.send(jsonstr);
//
//    xhr.onload = function() {
//        if (xhr.status === 200) {
//            alert("메일이 성공적으로 전송 되었습니다!");
//
//            // Clear the form fields
//            document.getElementById('inquiry-title').value = '';
//            document.getElementById('inquiry-content').value = '';
//        } else if (xhr.status === 422) {  // Handle validation errors
//            let response = JSON.parse(xhr.responseText);
//            let errorMessages = response.detail.map(error => error.msg).join("\n");
//            alert("Validation Error: " + errorMessages);
//        } else {
//            alert("Error posting quest: " + xhr.responseText);
//        }
//    };
//}
