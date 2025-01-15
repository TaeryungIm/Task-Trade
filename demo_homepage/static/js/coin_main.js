// Utility to manage access token
const tokenManager = {
    getToken: function () {
        try {
            return localStorage.getItem("access_token");
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return null;
        }
    },
    setToken: function (token) {
        try {
            localStorage.setItem("access_token", token);
        } catch (error) {
            console.error("Error saving token to localStorage:", error);
        }
    },
    clearToken: function () {
        try {
            localStorage.removeItem("access_token");
        } catch (error) {
            console.error("Error clearing localStorage:", error);
        }
    },
};

// Check status on main page according to login/logout states
window.onload = async function () {
    const accessToken = tokenManager.getToken();

    const coinAccountButton = document.getElementById("coin-account-btn");
    coinAccountButton.style.color = "#007bff";

    const userid = await getUserId(accessToken);

    if (userid) {
        // User is logged in
        document.getElementById('logged-in-headers').style.display = 'block';

        // Display transaction history and balance
        showHistory(userid);
        const remainingBalance = await getCoinBalance(userid);
        if (remainingBalance !== undefined) {
            document.getElementById('coin-balance').textContent = `${remainingBalance} COIN`;
            document.getElementById('exchange-possible').textContent = `최대 환전가능 코인: ${remainingBalance} COIN`;
        }
    } else {
        // User is logged out
        document.getElementById('logged-in-headers').style.display = 'none';
    }

    const activeTabId = sessionStorage.getItem("activeTab") || "history"; // Replace "defaultTabId" with your default tab ID

    // Activate the stored tab
    document.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.getAttribute("aria-controls") === activeTabId) {
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
        } else {
            btn.setAttribute("aria-selected", "false");
        }
    });

    document.querySelectorAll(".tab-content").forEach((tab) => {
        if (tab.id === activeTabId) {
            tab.classList.remove("hidden");
            tab.setAttribute("aria-hidden", "false");
        } else {
            tab.classList.add("hidden");
            tab.setAttribute("aria-hidden", "true");
        }
    });

    updateChargedCoinAmount();
    updateExchangedCoinAmount()
};

// Get user ID using access token
async function getUserId(accessToken) {
    if (!accessToken) {
        alert("Access token not found. Please log in.");
        return null;
    }
    try {
        const response = await fetch("/login/protected-endpoint", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.user_id;
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        console.error("Error verifying access token:", error);
        alert("Error verifying access token. Please log in again.");
        return null;
    }
}

// Handle logout
function logout() {
    tokenManager.clearToken();
    alert("로그아웃 되었습니다!");
    document.getElementById('logged-in-headers').style.display = 'none';
}

// Link to Quest page
function link_quest() {
    if (!tokenManager.getToken()) {
        alert("로그인 해주세요!");
        window.location.href = "/login";
    } else {
        window.location.href = "/quest";
    }
}

// Link to Inquiry page
function link_inquiry() {
    if (!tokenManager.getToken()) {
        alert("로그인 해주세요!");
        window.location.href = "/login";
    } else {
        window.location.href = "/inquiry";
    }
}

// Show transaction history
async function showHistory(userid) {
    const accessToken = tokenManager.getToken();

    if (accessToken) {
        try {
            const data = {
                user_id: userid,
            };

            const response = await fetch("/history/record", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                const responseData = await response.json();

                const transactionListContainer = document.querySelector(".transaction-list");
                transactionListContainer.innerHTML = ""; // Clear existing content

                if (responseData.transactions.length === 0) {
                    transactionListContainer.innerHTML = `<h2 id="transaction-default">거래내역이 없습니다</h2>`;
                } else {
                    responseData.transactions.forEach((transaction) => {
                        const { transaction_type, amount, created_at } = transaction;

                        const date = new Date(created_at);
                        const formattedDate = date.toISOString().split("T")[0];
                        const formattedTime = date.toTimeString().split(" ")[0].slice(0, 5);

                        const statusText = transaction_type === "DEPOSIT" ? "입금 완료" : "출금 완료";
                        const statusClass = transaction_type === "DEPOSIT" ? "deposit" : "withdraw";

                        const transactionItem = `
                            <div class="transaction-item">
                                <div class="transaction-date">${formattedDate}</div>
                                <div class="transaction-details">
                                    <span class="transaction-status ${statusClass}">${statusText}</span>
                                    <span class="transaction-time">${formattedTime}</span>
                                </div>
                                <div class="transaction-amount">${amount.toLocaleString()} 원</div>
                            </div>
                        `;
                        transactionListContainer.insertAdjacentHTML("beforeend", transactionItem);
                    });
                }
            } else {
                throw new Error("Invalid response");
            }
        } catch (error) {
            console.error("Error fetching transaction records:", error);
        }
    }
}

// Handle deposit (충전하기)
async function charge(event) {
    event.preventDefault();
    const accessToken = tokenManager.getToken();
    const userid = await getUserId(accessToken);

    if (!userid) return;

    try {
        const coinInput = document.getElementById("charge-input").value;
        const data = {
            user_id: userid,
            update_balance: parseInt(coinInput),
        };

        const response = await fetch("/charge/update/balance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData = await response.json();
            document.getElementById("coin-balance").textContent = `${responseData.updated_balance} COIN`;
            alert(`총 ${coinInput} COIN 충전했습니다!`);
            document.getElementById("charge-input").value = "";
            document.getElementById("charged-coin-amount").innerText = "총 입금 코인: 0 COIN";
            document.getElementById("charged-krw-amount").innerText = "총 입금 금액: 0 원";
        } else {
            throw new Error("Failed to charge");
        }
    } catch (error) {
        console.error("Error charging balance:", error);
    }
}

// Handle withdrawal (환전하기)
async function exchange(event) {
    event.preventDefault();
    const accessToken = tokenManager.getToken();
    const userid = await getUserId(accessToken);

    if (!userid) return;

    try {
        const coinInput = parseInt(document.getElementById("exchange-input").value);
        if (isNaN(coinInput) || coinInput <= 0) {
            alert("유효한 금액을 입력해주세요.");
            return;
        }

        const data = {
            user_id: userid,
            update_balance: -coinInput,
        };

        const response = await fetch("/exchange/update/balance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            const responseData = await response.json();
            alert(`총 ${coinInput * 0.9} 원 환전했습니다!`);

            document.getElementById("coin-balance").textContent = `${responseData.updated_balance} COIN`;
            document.getElementById("exchange-possible").textContent =
                `최대 환전가능 코인: ${responseData.updated_balance} COIN`;
            document.getElementById("exchanged-coin-amount").innerText = "총 환전 금액: 0 원";
            document.getElementById("exchange-input").value = "";
        } else {
            throw new Error("Failed to exchange");
        }
    } catch (error) {
        console.error("Error exchanging balance:", error);
    }
}

// Increase coin input for withdrawal
function increaseCoinStatus(amount, event) {
    event.preventDefault();
    const currentCoin = parseInt(document.getElementById("exchange-input").value) || 0;
    document.getElementById("exchange-input").value = currentCoin + amount;
}

// Get user balance
async function getCoinBalance(userid) {
    try {
        const url = `/account/balance?userid=${encodeURIComponent(userid)}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.balance;
        } else {
            throw new Error("Failed to fetch balance");
        }
    } catch (error) {
        console.error("Error fetching balance:", error);
        return undefined;
    }
}

// Show tab content and refresh the page
function showTab(tabId) {
    // Store the selected tab in sessionStorage or query parameters
    sessionStorage.setItem("activeTab", tabId);

    // Reload the page
    location.reload();
}

// Function to handle input changes for charging
function updateChargedCoinAmount() {
    const chargeInput = document.getElementById("charge-input");
    const chargedCoinAmount = document.getElementById("charged-coin-amount");
    const chargedKRWAmount = document.getElementById("charged-krw-amount");
    const chargeButton = document.getElementById("charge-btn");

    // Add a new paragraph to display messages
    let messageParagraph = document.getElementById("charge-message");
    if (!messageParagraph) {
        messageParagraph = document.createElement("p");
        messageParagraph.id = "charge-message";
        messageParagraph.style.color = "red";
        chargeInput.parentElement.insertBefore(messageParagraph, chargedCoinAmount);
    }

    // Add event listener to the input field
    chargeInput.addEventListener("input", () => {
        const inputValue = parseInt(chargeInput.value, 10);

        if (isNaN(inputValue) || inputValue < 5000) {
            // Show error message and disable button
            messageParagraph.textContent = "최소 충전 액수는 5000원 입니다.";
            chargedCoinAmount.textContent = "총 입금 코인: 0 COIN";
            chargedKRWAmount.textContent = "총 입금 금액: 0 원";
            chargeButton.classList.add("disabled");
            chargeButton.disabled = true;
        } else {
            // Clear error and enable button
            messageParagraph.textContent = "";
            const valueWithMargin = Math.floor(inputValue * 1.1);
            chargedCoinAmount.textContent = `총 입금 코인: ${inputValue} COIN`;
            chargedKRWAmount.textContent = `총 입금 금액: ${valueWithMargin} 원`;
            chargeButton.classList.remove("disabled");
            chargeButton.disabled = false;
        }
    });
}

// Function to handle input changes for exchange
function updateExchangedCoinAmount() {
    const exchangeInput = document.getElementById("exchange-input");
    const exchangedCoinAmount = document.getElementById("exchanged-coin-amount");
    const exchangePossible = document.getElementById("exchange-possible");
    const exchangeButton = document.getElementById("exchange-btn");

    const maxExchangeable = parseInt(exchangePossible.textContent.replace(/\D/g, ""), 10);

    // Add a new paragraph to display messages
    let messageParagraph = document.getElementById("exchange-message");
    if (!messageParagraph) {
        messageParagraph = document.createElement("p");
        messageParagraph.id = "exchange-message";
        messageParagraph.style.color = "red";
        exchangeInput.parentElement.insertBefore(messageParagraph, exchangedCoinAmount);
    }

    function updateMessageAndAmount(inputValue) {
        if (isNaN(inputValue) || inputValue < 1000) {
            // Show error message and disable button
            messageParagraph.textContent = "최소 환전 액수는 5000원 입니다.";
            exchangedCoinAmount.textContent = "총 환전 금액: 0 원";
            exchangeButton.classList.add("disabled");
            exchangeButton.disabled = true;
        } else if (inputValue > maxExchangeable) {
            // Show error message and disable button
            messageParagraph.textContent = "환전가능 한도를 초과하였습니다.";
            exchangedCoinAmount.textContent = "총 환전 금액: 0 원";
            exchangeButton.classList.add("disabled");
            exchangeButton.disabled = true;
        } else {
            // Clear error and enable button
            messageParagraph.textContent = "";
            const exchangedValue = Math.floor(inputValue * 0.9);
            exchangedCoinAmount.textContent = `총 환전 금액: ${exchangedValue} 원`;
            exchangeButton.classList.remove("disabled");
            exchangeButton.disabled = false;
        }
    }

    exchangeInput.addEventListener("input", () => {
        const inputValue = parseInt(exchangeInput.value, 10);
        updateMessageAndAmount(inputValue);
    });

    const amountButtons = document.querySelectorAll(".exchange-amount-selection button");
    amountButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            const currentInputValue = parseInt(exchangeInput.value, 10) || 0;

            // Update the message and displayed coin amount
            updateMessageAndAmount(currentInputValue);
        });
    });
}
