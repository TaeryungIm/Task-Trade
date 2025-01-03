let email_verified = false;
let verification_code = null;
let timerId;

window.onload = function () {
    // Initially hide verification and re-verification sections
    const inputCodeForm = document.getElementById('input-code-form');
    const timerDisplay = document.getElementById('timer-display');
    const reVerifyButton = document.getElementById('re-verify-email-popup');
    const submitButton = document.getElementById('submit-account-form');

    inputCodeForm.style.display = 'none';
    timerDisplay.style.display = 'none';
    reVerifyButton.style.display = 'none';

    // Disable submit button initially
    submitButton.disabled = true;
    submitButton.classList.add('caf-active-background');
};

async function startTimer(durationInSeconds) {
    clearInterval(timerId); // Clear any existing timer
    const display = document.getElementById('timer-display');
    let remainingTime = durationInSeconds;

    timerId = setInterval(() => {
        const minutes = Math.floor((remainingTime % 3600) / 60);
        const seconds = remainingTime % 60;

        display.textContent = `남은 시간: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

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
    const inputCodeForm = document.getElementById('input-code-form');
    const timerDisplay = document.getElementById('timer-display');
    const verifyButton = document.getElementById('verify-email-popup');

    if (!email) {
        alert('Please enter your email address.');
        return;
    }

    verifyButton.disabled = true;

    try {
        const response = await fetch("/account/verify/userid", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: email }),
        });

        if (response.ok) {
            const responseData = await response.json();
            verification_code = parseInt(responseData.verification_code, 10);

            inputCodeForm.style.display = 'block';
            timerDisplay.style.display = 'block';
            startTimer(5 * 60); // Start a 5-minute timer
        } else {
            throw new Error(`Server error: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error sending verification email:", error);
        alert("Error sending verification email. Please try again.");
    } finally {
        verifyButton.disabled = false;
    }
}

function submitCode(event) {
    event.preventDefault();

    const inputField = document.getElementById('id_verify');
    const inputCode = parseInt(inputField.value, 10);

    if (isNaN(inputCode)) {
        alert("Please enter a valid numeric code.");
        inputField.value = "";
        return;
    }

    if (inputCode === verification_code) {
        email_verified = true;
        alert("Email successfully verified!");

        const submitButton = document.getElementById('submit-account-form');
        const reVerifyButton = document.getElementById('re-verify-email-popup');
        const verifyButton = document.getElementById('verify-email-popup');
        const inputCodeForm = document.getElementById('input-code-form');
        const timerDisplay = document.getElementById('timer-display');
        const emailField = document.getElementById('userid');

        submitButton.disabled = false;
        submitButton.classList.remove('caf-active-background');

        inputCodeForm.style.display = 'none';
        timerDisplay.style.display = 'none';

        emailField.readOnly = true;
        reVerifyButton.style.display = 'block';
        verifyButton.style.display = 'none';
    } else {
        alert("Invalid verification code. Please try again.");
        inputField.value = "";
    }
}

function reVerifyEmail(event) {
    event.preventDefault();

    const emailField = document.getElementById('userid');
    const reVerifyButton = document.getElementById('re-verify-email-popup');
    const verifyButton = document.getElementById('verify-email-popup');
    const submitButton = document.getElementById('submit-account-form');

    emailField.readOnly = false;
    reVerifyButton.style.display = 'none';
    verifyButton.style.display = 'block';

    submitButton.disabled = true;
    submitButton.classList.add('caf-active-background');

    email_verified = false;
}

function postAccount(event) {
    event.preventDefault();

    if (!email_verified) {
        alert("Email verification is required!");
        return;
    }

    const data = {
        user_id: document.getElementById('userid').value,
        user_name: document.getElementById('username').value,
        gender: document.querySelector('input[name="gender"]:checked')?.value,
        age: parseInt(document.getElementById('age').value, 10),
        contact: document.getElementById('contact').value,
        password: document.getElementById('password').value,
        conf_password: document.getElementById('confirm_password').value,
        balance: 0,
    };

    fetch("/account/create/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (response.ok) {
                alert("Account successfully created!");
                window.location.replace("/login");
            } else {
                return response.json().then(err => {
                    const errorMessages = err.detail.map(error => error.msg).join("\n");
                    alert(`Validation Error: ${errorMessages}`);
                });
            }
        })
        .catch(error => {
            console.error("Error creating account:", error);
            alert("An error occurred. Please try again.");
        });
}
