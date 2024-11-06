function postAccount(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    var uid = document.getElementById('userid').value;
    var uname = document.getElementById('username').value;
    var ugender = document.querySelector('input[name="gender"]:checked').value;
    var upw1 = document.getElementById('password').value;
    var upw2 = document.getElementById('confirm_password').value;
    var uage = parseInt(document.getElementById('age').value);
    var ucontact = document.getElementById('contact').value;

    var data = {
        userid: uid,
        username: uname,
        gender: ugender,
        age: uage,
        contact: ucontact,
        password1: upw1,
        password2: upw2,
    };

    var jsonstr = JSON.stringify(data);

    // Make the AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/account/create/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonstr);

    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("회원가입 되었습니다!");

            // Clear the form fields
            document.getElementById('username').value = '';
            document.getElementById('age').value = '';
            document.getElementById('contact').value = '';
            document.getElementById('email').value = '';
            document.getElementById('userid').value = '';
            document.getElementById('password1').value = '';
            document.getElementById('password2').value = '';

            // After creating the account, return to the login page
            window.location.replace("/");

        } else if (xhr.status === 422) {  // Handle validation errors
            let response = JSON.parse(xhr.responseText);
            let errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error creating account: " + xhr.responseText);
        }
    };
}
