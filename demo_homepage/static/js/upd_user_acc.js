// Block the inputs initially
window.onload = function() {
    document.getElementById('email').disabled = true;
    document.getElementById('current_password').disabled = true;
    document.getElementById('new_password1').disabled = true;
    document.getElementById('new_password2').disabled = true;
}

function handleIdCheck(event) {
    event.preventDefault(); // Prevent default form submission

    var userID = document.getElementById('userID').value;
    var formData = new URLSearchParams(); // Use URLSearchParams for form data
    formData.append('userid', userID);

    fetch('/account/update/idcheck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' // Explicitly set the content type
        },
        body: formData
    })
    .then(response => response.json()) // Parse JSON from response
    .then(data => {
        if (data.success) {
            // ID is valid, enable the other fields
            document.getElementById('email').disabled = false;
            document.getElementById('current_password').disabled = false;
            alert(data.message); // Show success message
        } else {
            // ID check failed, show error message
            alert(data.message); // Show failure message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    });
}


function handlePWCheck(event) {
    event.preventDefault(); // Prevent default form submission

    var userPW = document.getElementById('current_password').value;
    var formData = new URLSearchParams(); // Use URLSearchParams for form data
    formData.append('userid', localStorage.getItem('userid'));
    formData.append('userpw', userPW);


    fetch('/account/update/pwcheck', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
    })
    .then(response => response.json()) // Parse JSON from response
    .then(data => {
        if (data.success) {
            // ID is valid, enable the other fields
            document.getElementById('new_password1').disabled = false;
            document.getElementById('new_password2').disabled = false;
            alert(data.message); // Show success message
        } else {
            // ID check failed, show error message
            alert(data.message); // Show failure message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    });
}


function handleAccountCheck(event) {
    event.preventDefault(); // Prevent default form submission

    var cur_id = localStorage.getItem('userid');
    var upd_id = document.getElementById('userID').value;
    var upd_pw = document.getElementById('new_password1').value;
    var conf_upd_pw = document.getElementById('new_password2').value;

    var data = {
        cur_id: cur_id,
        upd_id: upd_id,
        upd_pw: upd_pw,
        conf_upd_pw: conf_upd_pw
    };

    var jsonstr = JSON.stringify(data);

    fetch('/account/update/userdata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: jsonstr
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message); // Show success message
            document.getElementById('userID').value = '';
            document.getElementById('email').value = '';
            document.getElementById('current_password').value = '';
            document.getElementById('new_password1').value = '';
            document.getElementById('new_password2').value = '';

            // Redirect to main page
            window.location.href = "/";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    });
}