// Define variables globally
const loginBtn = document.getElementById('login_btn');
const logoutBtn = document.getElementById('logout_btn');

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

window.onload = async function() {
    const accessToken = tokenManager.getToken();
    const exchange_button = document.getElementById('button_exchange');
    exchange_button.style.backgroundColor = '#1E1F22';

    const userid = await getUserId(accessToken); // Await here to ensure `userid` is retrieved before proceeding
    if (!userid) {
        return; // Stop if `userid` couldn't be retrieved
    }

    // Get the user's coin balance
    const remainingBalance = await getCoinBalance(userid); // No global declaration
    if (remainingBalance !== undefined) {
        document.getElementById('coin_balance').textContent = `내 보유 코인: ${remainingBalance}¢`;
    }
};

async function getUserId(accessToken){
    if (accessToken) {
        // User is logged in
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';

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
        // User is logged out
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';

        alert("Access token not found. Please log in.");
        return; // Stop the function if no access token is available
    }
}

async function handleExchange(event) {
    // Prevent default form submission behavior
    event.preventDefault();
    const accessToken = tokenManager.getToken();
    const userid = await getUserId(accessToken); // Await here to ensure `userid` is retrieved before proceeding
    if (!userid) {
        return; // Stop if `userid` couldn't be retrieved
    }

    if (accessToken) {
        try {
            const coinInput = document.getElementById('coin_input').value;
            const data = {
                user_id: userid,
                update_balance: coinInput,
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
                document.getElementById('coin_balance').textContent = `내 보유 코인: ${responseData.updated_balance}¢`;

                alert(`총 ${coinInput}¢ 환전했습니다!`);
                document.getElementById('coin_input').value = '';
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
