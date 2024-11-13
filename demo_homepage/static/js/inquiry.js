// Define variables globally
const loginBtn = document.getElementById('login_btn');
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

    if (accessToken) {
        // User is logged in
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        // User is logged out
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
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

    let userid;
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
            userid = data.user_id;
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        console.error("Error verifying access token:", error);
        return;
    }

    postInquiry(userid);
    sendInquiry(userid);
}

function postInquiry(userid) {
    var inq_title = document.getElementById('inquiry_title').value;
    var inq_content = document.getElementById('inquiry_content').value;
    var inq_contact = document.querySelector('input[name="contact_method"]:checked').value;

    var inquiry_data = {
        userid: userid,
        inquiry_title: inq_title,
        inquiry_content: inq_content,
        contact_method: inq_contact
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

function sendInquiry(userid) {
    var inq_title = document.getElementById('inquiry_title').value;
    var inq_content = document.getElementById('inquiry_content').value;
    var inq_contact = document.querySelector('input[name="contact_method"]:checked').value;

    var inquiry_data = {
        user_id: userid,
        inquiry_title: inq_title,
        inquiry_content: inq_content,
        contact_method: inq_contact
    };

    var jsonstr = JSON.stringify(inquiry_data);

    // Make the AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/inquiry/send_email");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonstr);

    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("메일이 성공적으로 전송 되었습니다!");

            // Clear the form fields
            document.getElementById('inquiry_title').value = '';
            document.getElementById('inquiry_content').value = '';
            document.querySelector('input[name="contact_method"]:checked').checked = false;
        } else if (xhr.status === 422) {  // Handle validation errors
            let response = JSON.parse(xhr.responseText);
            let errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error posting quest: " + xhr.responseText);
        }
    };
}
