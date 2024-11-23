// Define variables globally
const questBtn = document.getElementById('quest-btn');
const inquiryBtn = document.getElementById('inquiry-btn');
const chargeBtn = document.getElementById('charge-btn');
const exchangeBtn = document.getElementById('exchange-btn');
const logoutBtn = document.getElementById('logout-btn');

// Utility to manage access token
const tokenManager = {
    getToken: function() {
        return localStorage.getItem("access_token");
    },
    setToken: function(token) {
        localStorage.setItem("access_token", token);
    },
    clearToken: function() {
        localStorage.removeItem("access_token");
    }
};

// check status on main page according to login/out states
window.onload = async function() {
    const accessToken = tokenManager.getToken();
    const exchange_button = document.getElementById('exchange-btn');
    exchange_button.style.color = '#007bff';

    if (!accessToken) {
        // User is logged out
        alert("please log in!");
        window.location.replace("/login");
    }

    const userid = await getUserId(accessToken); // Await here to ensure `userid` is retrieved before proceeding
    if (!userid) {
        return; // Stop if `userid` couldn't be retrieved
    }

    // Get the user's coin balance
    const remainingBalance = await getCoinBalance(userid); // No global declaration
    if (remainingBalance !== undefined) {
        document.getElementById('coin-balance').textContent = `내 환전가능 코인: ${remainingBalance}¢`;
    }
};

async function getUserId(accessToken){
    if (!accessToken) {
        alert("Access token not found. Please log in.");
        return null;
    }

    if (accessToken) {
        try {
            // Make a request to the protected endpoint to verify the token and get user information
            const response = await fetch("/login/protected-endpoint", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.ok) {
                const data = await response.json();
                return data.user_id; // Return userid if the token is valid
            } else {
                throw new Error("Invalid token");
            }
        } catch (error) {
            console.error("Error verifying access token:", error);
            alert("Error verifying access token. Please log in again.");
            return; // Stop the function if there's an error with the token
        }
    } else {
        alert("Access token not found. Please log in.");
        return; // Stop the function if no access token is available
    }
}

// Simulate logout function
function logout() {
    // Remove the user from localStorage
    tokenManager.clearToken();

    // Go back to main page
    alert("로그아웃 되었습니다!");
    window.location.replace("/");
}

// Link API function to quest_window page
function link_quest() {
    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");
        window.location.replace("/login");
    }
    // If logged in, link to quest page
    else {
        window.location.replace("/quest");
    }
}

// Link API function to inquiry page
function link_inquiry() {
    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");
        window.location.replace("/login");
    }
    // If logged in, link to inquiry page
    else {
        window.location.replace("/inquiry");
    }
}

// Link API function to coin charge page
function link_coin_charge() {
    // If not logged in, link to login page
    if (loginBtn.style.display === 'block') {  // Assuming loginBtn is visible when not logged in
        alert("로그인 해주세요!");
        window.location.replace("/login");
    }
    // If logged in, link to coin charge page
    else {
        window.location.replace("/charge");
    }
}

function increaseCoinStatus(amount, event) {
    event.preventDefault();
    // Get the current value from the input field and parse it as an integer
    const currentCoin = parseInt(document.getElementById('coin-input').value) || 0; // Default to 0 if empty or NaN

    // Increase it by the specified amount
    const newCoinValue = currentCoin + amount;

    // Update the input field with the new value
    document.getElementById('coin-input').value = newCoinValue;
}

async function handleCoinExchange(event){
    // Prevent default form submission behavior
    event.preventDefault();
    const accessToken = tokenManager.getToken();
    const userid = await getUserId(accessToken); // Await here to ensure `userid` is retrieved before proceeding
    if (!userid) {
        return; // Stop if `userid` couldn't be retrieved
    }

    if (accessToken) {
        try {
            // Ensure it's a negative integer
            const coinInput = parseInt(document.getElementById('coin-input').value);
            const data = {
                user_id: userid,
                update_balance: -Math.abs(coinInput || 0),
            };

            const response = await fetch("/exchange/update/balance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const responseData = await response.json();
                document.getElementById('coin-balance').textContent = `내 환전가능 코인: ${responseData.updated_balance}¢`;

                alert(`총 ${coinInput}¢ 환전했습니다!`);
                document.getElementById('coin-input').value = '';
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("Error in receiving updated balance:", error);
            alert("Error in receiving updated balance. Please retry.");
        }
    }
}

async function getCoinBalance(userid) {
    try {
        // Construct URL with query parameter
        const url = `/account/balance?userid=${encodeURIComponent(userid)}`;

        // Make the GET request
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.balance; // Return balance
        } else {
            throw new Error("Invalid userid");
        }
    } catch (error) {
        console.error("Error getting balance:", error);
        alert("Error getting balance. Please log in again.");
        return undefined; // Explicitly return undefined in case of error
    }
}
