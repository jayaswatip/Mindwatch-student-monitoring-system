const API_URL = "http://localhost:5000"; // Change to backend URL when deployed

/* ------------------ INDEX PAGE ------------------ */
function goToLogin() {
  window.location.href = "login.html";
}

function goToSignup() {
  window.location.href = "signup.html";
}

/* ------------------ SIGNUP ------------------ */
async function signup() {
  const fullname = document.getElementById("fullname").value.trim();
  const username = document.getElementById("signupUsername").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!fullname || !username || !email || !password) {
    return alert("⚠ Please fill all fields");
  }
  if (password !== confirmPassword) {
    return alert("⚠ Passwords do not match");
  }

  try {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, username, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      alert("🎉 Signup successful! Please login.");
      window.location.href = "login.html";
    } else {
      alert(data.message || "Signup failed");
    }
  } catch (err) {
    console.error(err);
    alert("⚠ Error signing up");
  }
}

/* ------------------ LOGIN ------------------ */
async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!username || !password) {
    return alert("⚠ Please fill all fields");
  }

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      alert("✅ Login successful! Redirecting...");
      window.location.href = "dashboard.html";
    } else {
      alert(data.message || "Login failed");
    }
  } catch (err) {
    console.error(err);
    alert("⚠ Error logging in");
  }
}

/* ------------------ PASSWORD TOGGLE ------------------ */
function togglePassword(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  const icon = passwordInput.parentElement.querySelector(".fa-eye, .fa-eye-slash");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    if (icon) icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    passwordInput.type = "password";
    if (icon) icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

/* ------------------ LOGOUT ------------------ */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("studentsData");
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

/* ------------------ DASHBOARD ------------------ */
function generateStudentData() {
  const students = [];
  for (let i = 1; i <= 20; i++) {
    const isListening = Math.random() > 0.5;
    const confidence = isListening
      ? Math.random() * 0.3 + 0.7
      : Math.random() * 0.3 + 0.4;

    students.push({
      name: `Student ${i}`,
      time: new Date().toLocaleTimeString(),
      attention: isListening ? "Listening" : "Not Listening",
      confidence: (confidence * 100).toFixed(0) + "%"
    });
  }
  return students;
}

function saveStudentData(students) {
  localStorage.setItem("studentsData", JSON.stringify(students));
}

function loadStudentData() {
  return JSON.parse(localStorage.getItem("studentsData")) || [];
}

function displayStudentData() {
  const students = loadStudentData();
  const tableBody = document.getElementById("recordsTable");
  if (!tableBody) return; // safeguard if table not on page
  tableBody.innerHTML = "";

  students.forEach(student => {
    const row = `
      <tr>
        <td>${student.name}</td>
        <td>${student.time}</td>
        <td>${student.confidence}</td>
        <td>
          <span class="badge ${student.attention === "Listening" ? "bg-success" : "bg-danger"}">
            ${student.attention}
          </span>
        </td>
      </tr>
    `;
    tableBody.innerHTML += row;
  });
}

/* ------------------ AUTO REFRESH ------------------ */
function startAutoRefresh() {
  initChart();
  updateDashboard();
  setInterval(updateDashboard, 5000);
}

function updateDashboard() {
  const students = generateStudentData();
  saveStudentData(students);
  displayStudentData();

  const statusEl = document.getElementById("status");
  const confEl = document.getElementById("confidence");

  if (statusEl && confEl) {
    statusEl.innerText = students[0].attention;
    statusEl.className =
      "badge " + (students[0].attention === "Listening" ? "bg-success" : "bg-danger");

    confEl.innerText = students[0].confidence;
    updateChart(parseFloat(students[0].confidence));
  }
}

/* ------------------ CHART ------------------ */
let attentionChart;
function initChart() {
  const ctx = document.getElementById("attentionChart");
  if (!ctx) return; // safeguard if chart not on page
  attentionChart = new Chart(ctx.getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Attention % (Student 1)",
        data: [],
        borderColor: "blue",
        fill: false
      }]
    }
  });
}

function updateChart(value) {
  if (!attentionChart) return;
  const now = new Date().toLocaleTimeString();
  attentionChart.data.labels.push(now);
  attentionChart.data.datasets[0].data.push(value);
  attentionChart.update();
}
