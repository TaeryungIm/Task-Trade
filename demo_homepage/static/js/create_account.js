let email_verified;
let verification_code = null;
let timerId;

window.onload = async function () {
    // Initially hide the verification form and re-verification button
    document.getElementById('input-code-form').style.display = 'none';
    document.getElementById('timer-display').style.display = 'none';
    document.getElementById('re-verify-email-popup').style.display = 'none';

    // Disable account creation button until email is verified
    document.getElementById('submit-account-form').disabled = true;
    document.getElementById('submit-account-form').classList.add('caf-active-background');

    email_verified = false;
};

async function startTimer(durationInSeconds) {
    clearInterval(timerId); // Clear any previous timer
    const display = document.getElementById('timer-display');
    let remainingTime = durationInSeconds;

    timerId = setInterval(() => {
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;

        display.textContent =
            `남은 시간: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (remainingTime <= 0) {
            clearInterval(timerId);
            alert("Verification code expired. Please request a new code.");
        }

        remainingTime--;
    }, 1000);
}

async function verifyEmail(event) {
    event.preventDefault();

    const email = document.getElementById('userid').value;

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    // Disable the button to prevent multiple clicks
    const button = document.getElementById('verify-email-popup');
    button.disabled = true;

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
            verification_code = parseInt(responseData.verification_code, 10);

            setTimeout(() => {
                document.getElementById('input-code-form').style.display = 'block';
                document.getElementById('timer-display').style.display = 'block';
                startTimer(5 * 60); // Start a 5-minute timer
            }, 500);
        } else {
            const errorText = await response.text();
            throw new Error(`Server responded with status ${response.status}: ${errorText}`);
        }
    } catch (error) {
        console.error("Error in sending email verification code:", error);
        alert("Error in sending email verification code. Please retry.");
    } finally {
        button.disabled = false; // Re-enable the button
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

            // Enable account creation button
            document.getElementById('submit-account-form').disabled = false;
            document.getElementById('submit-account-form').classList.remove('caf-active-background');

            // Hide the verification form
            setTimeout(() => {
                inputField.value = '';
                document.getElementById('input-code-form').style.display = 'none';
                document.getElementById('timer-display').style.display = 'none';

                // Make email field read-only and toggle verification buttons
                document.getElementById('userid').readOnly = true;
                document.getElementById('re-verify-email-popup').style.display = 'block';
                document.getElementById('verify-email-popup').style.display = 'none';
            }, 500);

            email_verified = true; // Set email as verified
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

    // Make email field editable and reset the buttons
    document.getElementById('userid').readOnly = false;
    document.getElementById('re-verify-email-popup').style.display = 'none';
    document.getElementById('verify-email-popup').style.display = 'block';

    // Disable account creation button again
    document.getElementById('submit-account-form').disabled = true;
    document.getElementById('submit-account-form').classList.add('caf-active-background');

    email_verified = false; // Reset verification status
}

function postAccount(event) {
    event.preventDefault();

    if (!email_verified) {
        alert("Email not verified!");
        return;
    }

    const uid = document.getElementById('userid').value;
    const uname = document.getElementById('username').value;
    const ugender = document.querySelector('input[name="gender"]:checked')?.value;
    const upw = document.getElementById('password').value;
    const upw_conf = document.getElementById('confirm_password').value;
    const uage = parseInt(document.getElementById('age').value, 10);
    const ucontact = document.getElementById('contact').value;

    const data = {
        user_id: uid,
        user_name: uname,
        gender: ugender,
        age: uage,
        contact: ucontact,
        password: upw,
        conf_password: upw_conf,
        balance: 0,
    };

    const jsonstr = JSON.stringify(data);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/account/create/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonstr);

    xhr.onload = function () {
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
            const genderInput = document.querySelector('input[name="gender"]:checked');
            if (genderInput) genderInput.checked = false;

            // Redirect to the login page
            window.location.replace("/login");
        } else if (xhr.status === 422) {
            const response = JSON.parse(xhr.responseText);
            const errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error creating account: " + xhr.responseText);
        }
    };
}
