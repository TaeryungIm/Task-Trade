// Utility to manage access tokens
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

// Ensure login status on page load
window.onload = async function () {
    const accessToken = tokenManager.getToken();
    const questButton = document.getElementById("quest-btn");
    questButton.style.color = "#007bff";

    if (!accessToken) {
        alert("Please log in!");
        window.location.replace("/login");
    }
};

// Fetch user ID
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
    window.location.replace("/");
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

// Link to Coin Account page
function link_coin_account() {
    if (!tokenManager.getToken()) {
        alert("로그인 해주세요!");
        window.location.href = "/login";
    } else {
        window.location.href = "/coin";
    }
}

// Post quest data to the database
async function postQuest(event) {
    event.preventDefault();

    const questTitle = document.getElementById("quest-title").value.trim();
    const questType = document.getElementById("quest-type").value.trim();
    const questContent = document.getElementById("quest-content").value.trim();

    if (!questTitle || !questType || !questContent) {
        alert("Please fill out all fields.");
        return;
    }

    const accessToken = tokenManager.getToken();
    const userId = await getUserId(accessToken);

    if (!userId) {
        alert("Failed to retrieve user ID. Please log in again.");
        return;
    }

    const questData = {
        user_id: userId,
        quest_title: questTitle,
        quest_type: questType,
        quest_content: questContent,
    };

    try {
        const response = await fetch("/quest/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(questData),
        });

        if (response.ok) {
            alert("퀘스트가 등록 되었습니다!");
            document.getElementById("quest-title").value = "";
            document.getElementById("quest-type").value = "";
            document.getElementById("quest-content").value = "";
        } else if (response.status === 422) {
            const responseData = await response.json();
            const errorMessages = responseData.detail
                .map((error) => error.msg)
                .join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error posting quest. Please try again.");
        }
    } catch (error) {
        console.error("Error posting quest:", error);
        alert("An error occurred while posting the quest.");
    }
}
