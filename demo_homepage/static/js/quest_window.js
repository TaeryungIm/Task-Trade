// Map task specifics to each button
const taskDescriptions = {
    1: "홍보: 이 퀘스트를 통해서 유저들이 원하는 상품에 대해서 홍보를 진행할 수 있습니다.",
    2: "리뷰: 이 퀘스트를 통해서 각종 SNS를 통해서 리뷰 컨텐츠를 작성하게 할 수 있습니다.",
    3: "컨텐츠 사용: 이 퀘스트를 통해서 각종 게임, 앱 등을 사용하고 체험하게 할 수 있습니다.",
    4: "기타: 그 외에도 자유로운 목표를 이 퀘스트를 통해서 달성할 수 있습니다."
};

// Track the selected task type
// and first one is default
let selectedTaskType = 1;

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

    const defaultButton = document.querySelector(".task-type button.active");
    if (defaultButton) {
        taskTypeSpecifics(1, defaultButton); // Activate the default task type
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

function updatePeriodLabel() {
    const periodRange = document.getElementById("task-period");
    const periodLabel = document.getElementById("period-label");
    periodLabel.textContent = `${periodRange.value} Days`;
}

// Handle button clicks
function taskTypeSpecifics(selection, button) {
    selectedTaskType = button.value; // Store the selected task type value

    // Highlight the clicked button
    document.querySelectorAll(".task-type button").forEach((btn) => {
        btn.classList.remove("active");
    });
    button.classList.add("active");

    // Show the corresponding task specifics
    const taskSpecificsDiv = document.getElementById("task-specifics");
    taskSpecificsDiv.textContent = taskDescriptions[selection];
}

// Collect data and send via postQuest
async function postQuest(event) {
    event.preventDefault(); // Prevent form submission

    const accessToken = tokenManager.getToken();
    if (!accessToken) {
        alert("Please log in!");
        window.location.replace("/login");
        return; // Stop execution if the user is not logged in
    }

    // Wait for the user ID to be fetched
    const userId = await getUserId(accessToken);
    if (!userId) {
        alert("Failed to fetch user ID. Please log in again.");
        return; // Stop execution if user ID could not be retrieved
    }

    const taskType = selectedTaskType; // Use the stored selected task type
    const taskTitle = document.getElementById("quest-title").value;
    const taskSpecifics = document.getElementById("quest-content").value;
    const taskConditions = Array.from(
      document.getElementById("conditions").selectedOptions
    ).map(opt => opt.value).join(","); // Convert to comma-separated string
    const taskBudget = parseInt(document.getElementById("task-budget").value, 10);
    const taskPersonnel = parseInt(document.getElementById("task-personnel").value, 10);
    const taskPeriod = parseInt(document.getElementById("task-period").value, 10);

    if (!taskType) {
        alert("Please select a task type!");
        return; // Stop execution if task type is not selected
    }

    const taskData = {
        user_id: userId,
        quest_type: taskType,
        quest_title: taskTitle,
        quest_specifics: taskSpecifics,
        quest_conditions: taskConditions,
        quest_budget: taskBudget,
        quest_personnel: taskPersonnel,
        quest_period: taskPeriod,
    };

    // Send the data to the server
    try {
        const response = await fetch("/quest/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        });

        if (response.ok) {
            alert("Task successfully created!");
            document.querySelector(".quest-form").reset(); // Reset form after submission
            selectedTaskType = 1; // Reset to default
            const defaultButton = document.querySelector(".task-type button");
            taskTypeSpecifics(1, defaultButton); // Re-activate the default task type
        } else {
            const errorData = await response.json();
            if (response.status === 422) {
                const validationErrors = errorData.detail.map((error) => `${error.loc[1]}: ${error.msg}`).join("\n");
                alert(`Validation Error:\n${validationErrors}`);
            } else {
                alert(`Error ${response.status}: ${errorData.detail || "An unexpected error occurred."}`);
            }
        }
    } catch (error) {
        console.error("Error submitting task:", error);
        alert("An error occurred while communicating with the server. Please check your connection and try again.");
    }
}
