// Define variables globally
const logoutBtn = document.getElementById("logout-btn");

// Utility to manage access token
const tokenManager = {
    getToken: function () {
        try {
            return localStorage.getItem("access_token");
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return null;
        }
    },
    setToken: function (token) {
        try {
            localStorage.setItem("access_token", token);
        } catch (error) {
            console.error("Error saving token to localStorage:", error);
        }
    },
    clearToken: function () {
        try {
            localStorage.removeItem("access_token");
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    },
};

// Check status on the main page according to login/logout states
window.onload = async function () {
    const accessToken = tokenManager.getToken();
    const inquiryButton = document.getElementById("inquiry-btn");
    inquiryButton.style.color = "#007bff";

    if (!accessToken) {
        // User is logged out
        alert("Please log in!");
        window.location.replace("/login");
    }
};

// Handle inquiry submission
async function handleInquiry(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    const accessToken = tokenManager.getToken();
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
    }

    const userid = await getUserId(accessToken); // Await to ensure `userid` is retrieved
    if (!userid) {
        alert("User ID retrieval failed.");
        return;
    }

    postInquiry(userid);
}

// Fetch user ID
async function getUserId(accessToken) {
    if (!accessToken) {
        alert("Access token not found. Please log in.");
        return null;
    }

    try {
        // Make a request to the protected endpoint
        const response = await fetch("/login/protected-endpoint", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.user_id;
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        console.error("Error verifying access token:", error);
        alert("Error verifying access token. Please log in again.");
        return null;
    }
}

// Handle logout
function logout() {
    tokenManager.clearToken();
    alert("로그아웃 되었습니다!");
    window.location.replace("/");
}

// Link to Quest page
function link_quest() {
    if (!tokenManager.getToken()) {
        alert("로그인 해주세요!");
        window.location.href = "/login";
    } else {
        window.location.href = "/quest";
    }
}

// Link to Coin Account page
function link_coin_account() {
    if (!tokenManager.getToken()) {
        alert("로그인 해주세요!");
        window.location.href = "/login";
    } else {
        window.location.href = "/coin";
    }
}

// Post inquiry to the database
function postInquiry(userid) {
    const inqTitle = document.getElementById("inquiry-title").value.trim();
    const inqContent = document.getElementById("inquiry-content").value.trim();

    if (!inqTitle || !inqContent) {
        alert("문의 제목과 내용을 입력해주세요.");
        return;
    }

    const inquiryData = {
        user_id: userid,
        inquiry_title: inqTitle,
        inquiry_content: inqContent,
    };

    const jsonStr = JSON.stringify(inquiryData);

    // Make the AJAX request
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/inquiry/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonStr);

    xhr.onload = function () {
        if (xhr.status === 200) {
            alert("문의가 전송 되었습니다!");
            document.getElementById("inquiry-title").value = "";
            document.getElementById("inquiry-content").value = "";
        } else if (xhr.status === 422) {
            // Handle validation errors
            const response = JSON.parse(xhr.responseText);
            const errorMessages = response.detail.map((error) => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error posting inquiry: " + xhr.responseText);
        }
    };

    xhr.onerror = function () {
        alert("An error occurred while sending the inquiry.");
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
