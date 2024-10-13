// Block the inputs initially
window.onload = function() {
    document.getElementById('email').disabled = true;
    document.getElementById('current_password').disabled = true;
    document.getElementById('new_password').disabled = true;
}

function handleIdCheck(event) {
    event.preventDefault(); // Prevent default form submission

    var userID = document.getElementById('userID').value;
    var formData = new URLSearchParams(); // Use URLSearchParams for form data
    formData.append('userid', userID);

    fetch('/account/modify/idcheck', {
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


    fetch('/account/modify/pwcheck', {
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
            document.getElementById('new_password').disabled = false;
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

}