// Define variables globally
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userid = localStorage.getItem("userid");

// check status on main page according to login/out states
window.onload = function() {
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

// In order to invoke goth postInquiry and sendInquiry
function handleInquiry(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    postInquiry();
    sendInquiry();
}

function postInquiry() {
    var inqtitle = document.getElementById('inquiry_title').value;
    var inqcontent = document.getElementById('inquiry_content').value;
    var inqcontact = document.querySelector('input[name="contact_method"]:checked').value;

    var inquiry_data = {
        userid: userid,  // Ensure userid is defined or replace with a valid value
        inquirytitle: inqtitle,
        inquirycontent: inqcontent,
        contactmethod: inqcontact
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

function sendInquiry() {
    var inqtitle = document.getElementById('inquiry_title').value;
    var inqcontent = document.getElementById('inquiry_content').value;
    var inqcontact = document.querySelector('input[name="contact_method"]:checked').value;

    var inquiry_data = {
        userid: userid,  // Ensure userid is defined or replace with a valid value
        inquirytitle: inqtitle,
        inquirycontent: inqcontent,
        contactmethod: inqcontact
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
