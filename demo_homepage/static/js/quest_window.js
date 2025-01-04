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
    if (!accessToken) {
        alert("Please log in!");
        window.location.replace("/login");
        return;
    }

    // Highlight quest button
    document.getElementById("quest-btn").style.color = "#007bff";

    // Activate the default task type button
    const defaultButton = document.querySelector(".task-type button.active");
    if (defaultButton) taskTypeSpecifics(1, defaultButton);

    // Setup checkbox behavior for conditions
    setupConditionHandlers();

    // Set today's date as default for task period
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("task-period").value = today;
};

// Setup condition checkboxes behavior
function setupConditionHandlers() {
    document.querySelectorAll("#conditions-container input[type='checkbox']").forEach((checkbox) => {
        checkbox.addEventListener("change", handleConditionChange);
    });
}

// Handle checkbox selection logic
function handleConditionChange() {
    const noConditionCheckbox = document.getElementById("condition-none");
    const conditionMessage = document.querySelector(".condition-message");
    const selectedCheckboxes = Array.from(
        document.querySelectorAll("#conditions-container input[type='checkbox']:checked")
    );

    // Update the message based on the number of selected checkboxes
    conditionMessage.textContent = selectedCheckboxes.length === 0
        ? "Please select at least one condition!"
        : "";

    document.querySelectorAll("#conditions-container .condition-item").forEach((item) => {
        const checkbox = item.querySelector("input[type='checkbox']");
        const input = item.querySelector(".condition-input");

        if (noConditionCheckbox.checked) {
            // Uncheck all other checkboxes before disabling
            if (checkbox.id !== "condition-none") {
                checkbox.checked = false;
                checkbox.disabled = true;
                if (input) {
                    input.disabled = true;
                    input.value = ""; // Clear input field
                }
            }
        } else {
            // Enable all checkboxes and associated inputs
            checkbox.disabled = false;
            if (checkbox.checked && checkbox.id !== "condition-none") {
                if (input) input.disabled = false; // Enable associated input if checkbox is checked
            } else if (input) {
                input.disabled = true;
                input.value = ""; // Clear input field
            }
        }
    });
}

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

async function postQuest(event) {
    event.preventDefault(); // Prevent form submission

    const accessToken = tokenManager.getToken();
    if (!accessToken) {
        alert("Please log in!");
        window.location.replace("/login");
        return;
    }

    const userId = await getUserId(accessToken);
    if (!userId) {
        alert("Failed to fetch user ID. Please log in again.");
        return;
    }

    // Collect task conditions
    const conditions = Array.from(document.querySelectorAll("#conditions-container input[type='checkbox']:checked"))
        .map((checkbox) => {
            // Find the closest input with the class "condition-input" within the same condition-item
            const associatedInput = checkbox.closest(".condition-item").querySelector(".condition-input");

            // Check if the associated input exists and has a value
            const conditionValue = associatedInput && associatedInput.value.trim();
            return conditionValue ? `${checkbox.value}:${conditionValue}` : checkbox.value;
        });

    if (conditions.length === 0 || (conditions.length === 1 && conditions.includes("조건 없음"))) {
        alert("Please select at least one condition or specify '조건 없음'.");
        return;
    }

    const taskType = selectedTaskType;
    const taskTitle = document.getElementById("quest-title").value;
    const taskSpecifics = document.getElementById("quest-content").value;
    const taskBudget = parseInt(document.getElementById("task-budget").value, 10);
    const taskPersonnel = parseInt(document.getElementById("task-personnel").value, 10);
    const taskPeriod = document.getElementById("task-period").value;

    if (!taskType) {
        alert("Please select a task type!");
        return;
    }

    alert(`Conditions: ${conditions.join(", ")}\n
        Task Type: ${taskType}\n
        Task Title: ${taskTitle}\n
        Task Specifics: ${taskSpecifics}\n
        Task Budget: ${taskBudget}\n
        Task Personnel: ${taskPersonnel}\n
        Task Period: ${taskPeriod}`);

    const taskData = {
        user_id: userId,
        quest_type: taskType,
        quest_title: taskTitle,
        quest_specifics: taskSpecifics,
        quest_conditions: conditions.join(", "), // Comma-separated string
        quest_budget: taskBudget,
        quest_personnel: taskPersonnel,
        quest_period: taskPeriod
    };

    // Send data to the server
    try {
        const response = await fetch("/quest/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(taskData),
        });

        if (response.ok) {
            alert("성공적으로 퀘스트를 생성했습니다!");
            document.querySelector(".quest-form").reset(); // Reset form
            selectedTaskType = 1; // Reset to default
            const defaultButton = document.querySelector(".task-type button");
            taskTypeSpecifics(1, defaultButton); // Re-activate the default task type
        } else {
            const errorData = await response.json();
            alert(`Failed to create task: ${errorData.detail}`);
        }
    } catch (error) {
        console.error("Error submitting task:", error);
        alert("An error occurred. Please try again.");
    }
}
