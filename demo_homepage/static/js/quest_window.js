// Define variables globally
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');

// check status on main page according to login/out states
window.onload = function() {
    const userid = localStorage.getItem("userid");

    if (userid) {
        // User is logged in
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
    } else {
        // User is logged out
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
};

// this function is for posting quest data to the database
function postQuest() {
    // Prevent default form submission behavior
    event.preventDefault();

    const userid = localStorage.getItem("userid");

    var qtitle = document.getElementById('quest_title').value;
    var qtype = document.getElementById('quest_type').value;
    var qcontent = document.getElementById('quest_content').value;

    var quest_data = {
        userid: userid,
        questtitle: qtitle,
        questtype: qtype,
        questcontent: qcontent
    };

    var jsonstr = JSON.stringify(quest_data);

    // Make the AJAX request
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/quest/create");
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(jsonstr);

    xhr.onload = function() {
        if (xhr.status === 200) {
            alert("퀘스트가 등록 되었습니다!");

            // Clear the form fields
            document.getElementById('quest_title').value = '';
            document.getElementById('quest_type').value = '';
            document.getElementById('quest_content').value = '';
        } else if (xhr.status === 422) {  // Handle validation errors
            let response = JSON.parse(xhr.responseText);
            let errorMessages = response.detail.map(error => error.msg).join("\n");
            alert("Validation Error: " + errorMessages);
        } else {
            alert("Error posting quest: " + xhr.responseText);
        }
    };
}
