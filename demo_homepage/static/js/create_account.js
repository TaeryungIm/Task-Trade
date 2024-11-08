function postAccount(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    var uid = document.getElementById('userid').value;
    var uname = document.getElementById('username').value;
    var ugender = document.querySelector('input[name="gender"]:checked').value;
    var upw = document.getElementById('password').value;
    var upw_conf = document.getElementById('confirm_password').value;
    var uage = parseInt(document.getElementById('age').value);
    var ucontact = document.getElementById('contact').value;

    var data = {
        user_id: uid,
        user_name: uname,
        gender: ugender,
        age: uage,
        contact: ucontact,
        password: upw,
        conf_password: upw_conf,
        balance: 0,
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
            document.getElementById('userid').value = '';
            document.getElementById('password').value = '';
            document.getElementById('confirm_password').value = '';
            document.querySelector('input[name="gender"]:checked').checked = false;

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
