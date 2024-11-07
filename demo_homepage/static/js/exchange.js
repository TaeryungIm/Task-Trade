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
    let userid;

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
                userid = data.user_id; // Assign userid if the token is valid
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

    // Ensure userid was successfully retrieved
    if (!userid) {
        alert("Unable to retrieve user information. Please try again.");
        return;
    }

    const remainingBalance = getCoinBalance(userid);
    document.getElementById('coin_balance').textContent = `내 보유 코인: ${remainingBalance} &cent;`;

}


function handleExchange(event){
    // Prevent default form submission behavior
    event.preventDefault();

    const userid = localStorage.getItem("userid");

    var coinInput = document.getElementById('coin_input').value;


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
            return data.balance;
        } else {
            throw new Error("Invalid userid");
        }
    } catch (error) {
        console.error("Error getting balance:", error);
        alert("Error getting balance. Please log in again.");
        return; // Stop the function if there's an error
    }
}
