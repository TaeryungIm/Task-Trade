let email_verified;
let verification_code;

window.onload = async function() {
    // do not show the verification form in the first place
    document.getElementById('id_verify').style.display = 'none';
    document.getElementById('submit-email-code').style.display = 'none';

    // also do not show the re-verification form
    document.getElementById('re-verify-email-popup').style.display = 'none';

    // disable the make-account button before verification
    document.getElementById('submit-account-form').disabled = true;
    document.getElementById('submit-account-form').classList.add('caf-active-background');

    email_verified = false;
    verification_code = 000000; // for default
}

function postAccount(event) {
    // Prevent default form submission behavior
    event.preventDefault();

    // If email not verified, alert and return
    if(!email_verified){
        alert("Email not verified!")
        return;
    }

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
            alert("로그인페이지로 이동합니다");

            // Clear the form fields
            document.getElementById('username').value = '';
            document.getElementById('age').value = '';
            document.getElementById('contact').value = '';
            document.getElementById('userid').value = '';
            document.getElementById('password').value = '';
            document.getElementById('confirm_password').value = '';
            document.querySelector('input[name="gender"]:checked').checked = false;

            // After creating the account, return to the login page
            window.location.replace("/login");

        } else if (xhr.status === 422) {  // Handle validation errors
            let response = JSON.parse(xhr.responseText);
            let errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error creating account: " + xhr.responseText);
        }
    };
}

async function verifyEmail(event) {
    event.preventDefault();

    const email = document.getElementById('userid').value;

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    const data = { user_id: email };

    try {
        const response = await fetch("/account/verify/userid", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData = await response.json();
            verification_code = parseInt(responseData.verification_code);

            setTimeout(() => {
                document.getElementById('id_verify').style.display = 'block';
                document.getElementById('submit-email-code').style.display = 'block';
            }, 500);
        } else {
            const errorText = await response.text();
            throw new Error(`Server responded with status ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error("Error in sending email verification code:", error);
        alert("Error in sending email verification code. Please retry.");
    }
}

async function submitCode(event) {
    event.preventDefault();

    const inputField = document.getElementById('id_verify');
    const inputValue = inputField.value;

    try {
        const input_code = parseInt(inputValue, 10);

        // Check if parsing failed (e.g., input is not a number)
        if (isNaN(input_code)) {
            throw new Error("Invalid input: Please enter a numeric code.");
        }

        // Compare the parsed code with the verification code
        if (input_code === verification_code) {
            alert("Email verified!");

            // make account form submission active
            document.getElementById('submit-account-form').disabled = false;
            document.getElementById('submit-account-form').classList.remove('caf-active-background');

            // make verification form disappear
            setTimeout(() => {
                inputField.value = '';
                inputField.style.display = 'none';
                document.getElementById('submit-email-code').style.display = 'none';
            }, 500);

            // make email form stable and change the verify to re-verify
            document.getElementById('userid').readOnly = true;
            document.getElementById('re-verify-email-popup').style.display = 'block';
            document.getElementById('verify-email-popup').style.display = 'none';

        } else {
            alert("Wrong verification code! Please re-enter.");
            inputField.value = ""; // Clear the input field for re-entry
        }
    } catch (error) {
        console.error(error.message); // Log the error for debugging
        alert("Invalid input: Please enter a 6-digit numeric code.");
        inputField.value = ""; // Clear the input field for re-entry
    }
}

async function reVerifyEmail(event) {
    event.preventDefault();

    // make email form updatable and change the re-verify to verify
    document.getElementById('userid').readOnly = false;
    document.getElementById('re-verify-email-popup').style.display = 'none';
    document.getElementById('verify-email-popup').style.display = 'block';

    // and make account form submission deactivate
    document.getElementById('submit-account-form').disabled = true;
    document.getElementById('submit-account-form').classList.add('caf-active-background');
}
