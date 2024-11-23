function loginAccount(event) {
    event.preventDefault();

    var uid = document.getElementById('userid').value;
    var upw = document.getElementById('password').value;

    // Create URLSearchParams object
    var data = new URLSearchParams();
    data.append('username', uid);
    data.append('password', upw);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/login/login");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send(data);  // Send the URLSearchParams object

    xhr.onload = function() {
        if (xhr.status === 200) {
            // Successful login
            var response = JSON.parse(xhr.responseText);

            // Store the access token in localStorage for future requests
            localStorage.setItem("access_token", response.access_token);

            alert("로그인 되었습니다!");

            // Clear the form fields
            document.getElementById('userid').value = '';
            document.getElementById('password').value = '';

            // Redirect to main page
            window.location.replace("/");
        } else if (xhr.status === 422) {  // Handle validation errors
            let response = JSON.parse(xhr.responseText);
            let errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else if (xhr.status === 401) {  // Handle authentication failure
            alert("Invalid username or password. Please try again.");
        } else {
            alert("Error logging in: " + xhr.responseText);
        }
    };
}
