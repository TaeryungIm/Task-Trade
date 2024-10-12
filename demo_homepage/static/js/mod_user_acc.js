// Block the inputs initially
window.onload = function() {
    document.getElementById('email').disabled = true;
    document.getElementById('current_password').disabled = true;
    document.getElementById('password').disabled = true;
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
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.detail || 'Unknown error') });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('email').disabled = false;
            document.getElementById('current_password').disabled = false;
            document.getElementById('password').disabled = false;
        } else {
            alert('ID verification failed!');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred: ' + error.message);
    });
}


function handleAccountCheck(event) {

}