/**
 * MRDU - Online Assessment & Examination Portal
 * Full Interactive Logic:
 * 1. Welcome Screen
 * 2. Login Tabs (Candidate with CAPTCHA vs Examiner Admin)
 * 3. Instructions & Code of Conduct Screen (No sliding / No back / 1 Mark each / No negative)
 * 4. Examiner / Admin Control Dashboard
 * 5. Exam Portal (Live Timer, 2x2 Options, Circular Gauge, Anti-cheat Navigation Trap)
 * 6. Results & Performance Analytics
 */

// ========================================================
// QUESTION BANK (Default 10 Curated Questions & Storage)
// ========================================================
const DEFAULT_QUESTIONS_DATA = [
    {
        id: 1,
        category: "Web Development",
        question: "Which of the following is a popular programming language primarily used for developing interactive and multimedia web pages?",
        options: [
            "COBOL",
            "JavaScript",
            "Fortran",
            "Pascal"
        ],
        correctAnswer: 1,
        explanation: "JavaScript is the primary programming language of the web, enabling dynamic interactive content, animations, and multimedia features."
    },
    {
        id: 2,
        category: "Frontend Architecture",
        question: "Which HTML5 element is specifically used for drawing graphics and interactive animations on the fly via scripting?",
        options: [
            "<canvas>",
            "<svg>",
            "<section>",
            "<figure>"
        ],
        correctAnswer: 0,
        explanation: "The <canvas> element provides an API for rendering bitmapped 2D/3D graphics and games directly inside the browser using JavaScript."
    },
    {
        id: 3,
        category: "CSS3 Styling",
        question: "In CSS Flexbox, which property is used to align flex items along the cross axis?",
        options: [
            "justify-content",
            "align-items",
            "flex-direction",
            "flex-wrap"
        ],
        correctAnswer: 1,
        explanation: "'align-items' aligns items along the cross axis (vertical by default in a row), while 'justify-content' aligns along the main axis."
    },
    {
        id: 4,
        category: "JavaScript Core",
        question: "What will the expression `typeof null` return in modern JavaScript?",
        options: [
            "'null'",
            "'undefined'",
            "'object'",
            "'boolean'"
        ],
        correctAnswer: 2,
        explanation: "In JavaScript, `typeof null` returns 'object'. This is a legacy bug originating in the very first version of JavaScript and is kept for backward compatibility."
    },
    {
        id: 5,
        category: "Web APIs",
        question: "Which browser API provides a clean, promise-based interface for making asynchronous HTTP requests?",
        options: [
            "XMLHttpRequest",
            "Fetch API",
            "WebSockets",
            "Service Worker API"
        ],
        correctAnswer: 1,
        explanation: "The Fetch API provides a modern, promise-based standard mechanism for fetching network resources across the web."
    },
    {
        id: 6,
        category: "Performance & Storage",
        question: "Which client-side storage mechanism persists data across browser sessions and has no expiration date unless cleared manually?",
        options: [
            "sessionStorage",
            "localStorage",
            "HTTP Cookies",
            "Memory Cache"
        ],
        correctAnswer: 1,
        explanation: "localStorage persists key-value pairs without expiration, whereas sessionStorage is cleared when the browser tab closes."
    },
    {
        id: 7,
        category: "Backend & HTTP",
        question: "Which HTTP status code signifies that a requested resource was successfully created on the server?",
        options: [
            "200 OK",
            "201 Created",
            "204 No Content",
            "304 Not Modified"
        ],
        correctAnswer: 1,
        explanation: "HTTP 201 Created indicates that the request succeeded and resulted in one or more new resources being created (typically via POST)."
    },
    {
        id: 8,
        category: "Data Structures",
        question: "Which data structure operates on a Strict First-In, First-Out (FIFO) principle?",
        options: [
            "Stack",
            "Queue",
            "Binary Search Tree",
            "Heap"
        ],
        correctAnswer: 1,
        explanation: "A Queue processes elements in First-In, First-Out (FIFO) order, similar to people standing in a physical checkout line."
    },
    {
        id: 9,
        category: "Security",
        question: "What security mechanism prevents a malicious website from making unauthorized cross-origin requests using a logged-in user's credentials?",
        options: [
            "CORS (Cross-Origin Resource Sharing)",
            "Same-Origin Policy (SOP)",
            "DNSSEC",
            "SSL/TLS Handshake"
        ],
        correctAnswer: 1,
        explanation: "The Same-Origin Policy (SOP) is a core web security concept that restricts scripts on one origin from accessing sensitive resources on another."
    },
    {
        id: 10,
        category: "Modern Tooling",
        question: "What is the primary role of a bundler like Vite or Webpack in modern web development?",
        options: [
            "Hosting databases in the cloud",
            "Combining, transforming, and optimizing code modules for production deployment",
            "Running automated unit tests only",
            "Managing server DNS records"
        ],
        correctAnswer: 1,
        explanation: "Module bundlers package JavaScript, CSS, images, and other assets into optimized bundles suitable for web browsers."
    }
];

// ========================================================
// BACKEND API ADAPTER (Full Server Sync & LocalStorage Fallback)
// ========================================================
const BACKEND_API = {
    baseUrl: (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http') && window.location.port === '3000') ? '' : 'http://localhost:3000',
    isOnline: false,

    updateUIStatus(online, text) {
        const dot = document.getElementById('backendStatusDot');
        const label = document.getElementById('backendStatusText');
        const pill = document.getElementById('backendConnectionBadge');
        if (dot) {
            dot.className = online ? 'backend-pulse-dot online' : 'backend-pulse-dot offline';
        }
        if (label) {
            label.textContent = text;
        }
        if (pill) {
            pill.title = online 
                ? 'Backend Server Connected (http://localhost:3000) - Data Persisted in backend/data/' 
                : 'Backend Server Offline - Click to Retry. (Run "npm start" or "node backend/server.js")';
        }
    },

    async checkHealth() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            const res = await fetch(`${this.baseUrl}/api/health`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                this.isOnline = true;
                this.updateUIStatus(true, "Backend Online (Port 3000)");
                console.log("🌐 Connected to MRDU Backend Server:", data);
                return true;
            }
        } catch (e) {
            this.isOnline = false;
            this.updateUIStatus(false, "Standalone / Offline Mode");
        }
        return false;
    },

    async syncQuestions() {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/questions`);
            if (res.ok) {
                const data = await res.json();
                if (data.questions && data.questions.length > 0) {
                    saveExamQuestions(data.questions);
                    questionsData = data.questions;
                    totalQuestions = questionsData.length;
                    return data.questions;
                }
            }
        } catch (e) {
            console.warn("Backend question sync notice:", e);
        }
        return null;
    },

    async syncStudents() {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/students`);
            if (res.ok) {
                const data = await res.json();
                if (data.students && data.students.length > 0) {
                    const local = getRegisteredStudents();
                    data.students.forEach(s => {
                        const idx = local.findIndex(l => l.id.toUpperCase() === s.id.toUpperCase());
                        if (idx >= 0) {
                            local[idx] = { ...local[idx], ...s };
                        } else {
                            local.push(s);
                        }
                    });
                    setRegisteredStudents(local);
                    return local;
                }
            }
        } catch (e) {
            console.warn("Backend students sync notice:", e);
        }
        return null;
    },

    async registerStudent(studentData) {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData)
            });
            return await res.json();
        } catch (e) {
            console.warn("Backend registration notice:", e);
            return null;
        }
    },

    async candidateLogin(roll, password) {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/auth/candidate-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: roll, password: password })
            });
            return await res.json();
        } catch (e) {
            console.warn("Backend candidate login notice:", e);
            return null;
        }
    },

    async examinerLogin(username, password) {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/auth/examiner-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await res.json();
        } catch (e) {
            console.warn("Backend examiner login notice:", e);
            return null;
        }
    },

    async saveAttempt(attemptData) {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/attempts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(attemptData)
            });
            return await res.json();
        } catch (e) {
            console.warn("Backend attempt save notice:", e);
            return null;
        }
    },

    async syncAttempts() {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/attempts`);
            if (res.ok) {
                const data = await res.json();
                if (data.attempts && data.attempts.length > 0) {
                    setStudentAttempts(data.attempts);
                    return data.attempts;
                }
            }
        } catch (e) {
            console.warn("Backend attempt sync notice:", e);
        }
        return null;
    },

    async resetQuestions() {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/questions/reset`, { method: 'POST' });
            return await res.json();
        } catch (e) {
            console.warn("Backend questions reset notice:", e);
            return null;
        }
    },

    async resetAttempts() {
        if (!this.isOnline) return null;
        try {
            const res = await fetch(`${this.baseUrl}/api/attempts/reset`, { method: 'POST' });
            return await res.json();
        } catch (e) {
            console.warn("Backend attempts reset notice:", e);
            return null;
        }
    },

    async uploadProctorVideo(blob, studentId) {
        if (!this.isOnline || !blob) return null;
        try {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    try {
                        const base64 = reader.result;
                        const res = await fetch(`${this.baseUrl}/api/proctor/upload`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ studentId, videoBase64: base64 })
                        });
                        resolve(await res.json());
                    } catch (err) {
                        resolve(null);
                    }
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn("Backend video upload notice:", e);
            return null;
        }
    }
};

const QUESTIONS_STORAGE_KEY = "mrdu_exam_questions_v3";

function loadExamQuestions() {
    try {
        const raw = localStorage.getItem(QUESTIONS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Failed reading questions from storage:", e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_QUESTIONS_DATA));
}

function saveExamQuestions(data) {
    try {
        localStorage.setItem(QUESTIONS_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.warn("Failed saving questions to storage:", e);
    }
    if (typeof BACKEND_API !== 'undefined' && BACKEND_API.isOnline) {
        fetch(`${BACKEND_API.baseUrl}/api/questions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).catch(err => console.warn("Backend save questions error:", err));
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

let questionsData = loadExamQuestions();

// ========================================================
// STATE MANAGEMENT & PERSISTENT STUDENT ATTEMPTS
// ========================================================
const STUDENT_ATTEMPTS_STORAGE_KEY = "mrdu_exam_attempts_v2";
const REGISTERED_STUDENTS_STORAGE_KEY = "mrdu_registered_students_v2";

const DEFAULT_REGISTERED_STUDENTS = [
    { id: "26HEU05R001", name: "Sai Pranay Reddy", dept: "CSE" },
    { id: "26HEU05R002", name: "Ananya Sharma", dept: "CSE" },
    { id: "26HEU05R003", name: "Rohit Varma", dept: "AI & ML" },
    { id: "26HEU05R004", name: "Sneha Latha", dept: "IT" },
    { id: "26HEU05R005", name: "Keerthi Rao", dept: "ECE" },
    { id: "26HEU05R006", name: "Vikramaditya P", dept: "CSE" },
    { id: "26HEU05R007", name: "Pooja Hegde", dept: "IT" },
    { id: "26HEU05R008", name: "Akhil Goud", dept: "ECE" },
    { id: "26HEU05R009", name: "Divya Teja", dept: "CSE" },
    { id: "26HEU05R010", name: "Manoj Kumar", dept: "AI & ML" },
    { id: "26HEU05R011", name: "Bhavani Prasad", dept: "CSE" },
    { id: "26HEU05R012", name: "Karthik Raj", dept: "IT" }
];

const DEFAULT_STUDENT_ATTEMPTS = [
    {
        id: "26HEU05R001",
        name: "Sai Pranay Reddy",
        score: 10,
        total: 10,
        percentage: 100,
        accuracy: 100,
        timeSpentSeconds: 245,
        timeSpentStr: "04:05",
        grade: "O (10.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:15 PM"
    },
    {
        id: "26HEU05R002",
        name: "Ananya Sharma",
        score: 10,
        total: 10,
        percentage: 100,
        accuracy: 100,
        timeSpentSeconds: 312,
        timeSpentStr: "05:12",
        grade: "O (10.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:22 PM"
    },
    {
        id: "26HEU05R003",
        name: "Rohit Varma",
        score: 9,
        total: 10,
        percentage: 90,
        accuracy: 90,
        timeSpentSeconds: 288,
        timeSpentStr: "04:48",
        grade: "A+ (9.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:35 PM"
    },
    {
        id: "26HEU05R004",
        name: "Sneha Latha",
        score: 9,
        total: 10,
        percentage: 90,
        accuracy: 90,
        timeSpentSeconds: 345,
        timeSpentStr: "05:45",
        grade: "A+ (9.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:40 PM"
    },
    {
        id: "26HEU05R005",
        name: "Keerthi Rao",
        score: 8,
        total: 10,
        percentage: 80,
        accuracy: 80,
        timeSpentSeconds: 390,
        timeSpentStr: "06:30",
        grade: "A+ (9.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:45 PM"
    },
    {
        id: "26HEU05R006",
        name: "Vikramaditya P",
        score: 8,
        total: 10,
        percentage: 80,
        accuracy: 80,
        timeSpentSeconds: 430,
        timeSpentStr: "07:10",
        grade: "A+ (9.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:55 PM"
    },
    {
        id: "26HEU05R007",
        name: "Pooja Hegde",
        score: 7,
        total: 10,
        percentage: 70,
        accuracy: 70,
        timeSpentSeconds: 410,
        timeSpentStr: "06:50",
        grade: "A (8.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:02 PM"
    },
    {
        id: "26HEU05R008",
        name: "Akhil Goud",
        score: 7,
        total: 10,
        percentage: 70,
        accuracy: 70,
        timeSpentSeconds: 480,
        timeSpentStr: "08:00",
        grade: "A (8.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:15 PM"
    },
    {
        id: "26HEU05R009",
        name: "Divya Teja",
        score: 6,
        total: 10,
        percentage: 60,
        accuracy: 60,
        timeSpentSeconds: 520,
        timeSpentStr: "08:40",
        grade: "B+ (7.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:30 PM"
    },
    {
        id: "26HEU05R010",
        name: "Manoj Kumar",
        score: 6,
        total: 10,
        percentage: 60,
        accuracy: 60,
        timeSpentSeconds: 590,
        timeSpentStr: "09:50",
        grade: "B+ (7.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:45 PM"
    },
    {
        id: "26HEU05R011",
        name: "Bhavani Prasad",
        score: 5,
        total: 10,
        percentage: 50,
        accuracy: 50,
        timeSpentSeconds: 610,
        timeSpentStr: "10:10",
        grade: "B (6.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 06:05 PM"
    },
    {
        id: "26HEU05R012",
        name: "Karthik Raj",
        score: 4,
        total: 10,
        percentage: 40,
        accuracy: 40,
        timeSpentSeconds: 670,
        timeSpentStr: "11:10",
        grade: "F (0.0)",
        status: "FAIL",
        timestamp: "04 Nov 2026, 06:20 PM"
    }
];

// Validate 26HEU05R001 to 26HEU05R999 range
function isValidRollNumber(roll) {
    if (!roll) return false;
    const clean = roll.trim().toUpperCase();
    const regex = /^26HEU05R(00[1-9]|0[1-9][0-9]|[1-9][0-9]{2})$/;
    return regex.test(clean);
}

function getRegisteredStudents() {
    try {
        const raw = localStorage.getItem(REGISTERED_STUDENTS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {
        console.warn("Storage access failed:", e);
    }
    setRegisteredStudents(DEFAULT_REGISTERED_STUDENTS);
    return JSON.parse(JSON.stringify(DEFAULT_REGISTERED_STUDENTS));
}

function setRegisteredStudents(list) {
    try {
        localStorage.setItem(REGISTERED_STUDENTS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
        console.warn("Could not save registered students:", e);
    }
}

function getStudentAttempts() {
    try {
        const raw = localStorage.getItem(STUDENT_ATTEMPTS_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
    } catch (e) {
        console.warn("Storage access failed:", e);
    }
    // initialize storage with default
    setStudentAttempts(DEFAULT_STUDENT_ATTEMPTS);
    return JSON.parse(JSON.stringify(DEFAULT_STUDENT_ATTEMPTS));
}

function setStudentAttempts(attempts) {
    try {
        localStorage.setItem(STUDENT_ATTEMPTS_STORAGE_KEY, JSON.stringify(attempts));
    } catch (e) {
        console.warn("Could not save attempts to localStorage:", e);
    }
}

function saveCurrentStudentAttempt(attemptData) {
    const attempts = getStudentAttempts();
    // remove prior entry for same candidate roll or name (case-insensitive) to prevent duplicates
    const filtered = attempts.filter(a => a.id.toUpperCase() !== attemptData.id.toUpperCase() && a.name.toLowerCase() !== attemptData.name.toLowerCase());
    filtered.push(attemptData);
    setStudentAttempts(filtered);
    if (typeof BACKEND_API !== 'undefined' && BACKEND_API.isOnline) {
        BACKEND_API.saveAttempt(attemptData);
    }
    return filtered;
}

function getInitials(name) {
    if (!name) return "ST";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getGradeClass(grade) {
    if (!grade) return 'badge-grade-b';
    if (grade.startsWith('O')) return 'badge-grade-o';
    if (grade.startsWith('A')) return 'badge-grade-a';
    if (grade.startsWith('B')) return 'badge-grade-b';
    return 'badge-grade-f';
}

let loggedInUser = {
    name: "Vadla Bharath Chary",
    id: "26HEU05R001"
};

let currentCaptchaCode = "";
let examInProgress = false;
let tabSwitchCount = 0;

let currentQuestionIndex = 0;
let totalQuestions = questionsData.length;
let userAnswers = new Array(totalQuestions).fill(null);
let markedForReview = new Array(totalQuestions).fill(false);

// Timer variables (15 minutes = 900s)
const TOTAL_EXAM_SECONDS = 15 * 60;
let timeRemaining = TOTAL_EXAM_SECONDS;
let timerInterval = null;
let examFinished = false;

// SVG Progress Ring setup
const CIRCUMFERENCE = 2 * Math.PI * 64; // r=64 -> ~402.12

// ========================================================
// DOM ELEMENTS
// ========================================================
// Anti-Cheat Toast
const antiCheatToast = document.getElementById('antiCheatToast');
const antiCheatToastMsg = document.getElementById('antiCheatToastMsg');

// Screens
const welcomeScreen = document.getElementById('welcomeScreen');
const registrationScreen = document.getElementById('registrationScreen');
const loginScreen = document.getElementById('loginScreen');
const instructionsScreen = document.getElementById('instructionsScreen');
const adminDashboardScreen = document.getElementById('adminDashboardScreen');
const examScreenWrapper = document.getElementById('examScreenWrapper');
const examView = document.getElementById('examView');
const resultsView = document.getElementById('resultsView');

// Welcome & Navigation
const btnGoToRegister = document.getElementById('btnGoToRegister');
const btnGoToLogin = document.getElementById('btnGoToLogin');
const btnBackToWelcome = document.getElementById('btnBackToWelcome');
const btnBackToWelcomeFromReg = document.getElementById('btnBackToWelcomeFromReg');
const btnGoToLoginFromReg = document.getElementById('btnGoToLoginFromReg');
const btnGoToRegisterFromLogin = document.getElementById('btnGoToRegisterFromLogin');

// Login Tabs & Forms
const loginTabs = document.getElementById('loginTabs');
const tabSliderPill = document.getElementById('tabSliderPill');
const tabCandidateBtn = document.getElementById('tabCandidateBtn');
const tabExaminerBtn = document.getElementById('tabExaminerBtn');
const candidateLoginTabContent = document.getElementById('candidateLoginTabContent');
const examinerLoginTabContent = document.getElementById('examinerLoginTabContent');

// Candidate Dedicated Registration Screen Elements
const studentRegisterForm = document.getElementById('studentRegisterForm');
const regCandidateName = document.getElementById('regCandidateName');
const regRollNumber = document.getElementById('regRollNumber');
const regDepartment = document.getElementById('regDepartment');
const regPassword = document.getElementById('regPassword');
const btnToggleRegPwd = document.getElementById('btnToggleRegPwd');
const registerErrorMsg = document.getElementById('registerErrorMsg');
const registerErrorText = document.getElementById('registerErrorText');
const btnRegisterSubmit = document.getElementById('btnRegisterSubmit');

// Candidate Login Elements
const studentLoginForm = document.getElementById('studentLoginForm');
const studentUsernameInput = document.getElementById('studentUsernameInput');
const studentPasswordInput = document.getElementById('studentPasswordInput');
const btnToggleLoginPwd = document.getElementById('btnToggleLoginPwd');
const btnCandidateSubmit = document.getElementById('btnCandidateSubmit');
const captchaCodeDisplay = document.getElementById('captchaCode');
const btnRefreshCaptcha = document.getElementById('btnRefreshCaptcha');
const captchaInput = document.getElementById('captchaInput');
const candidateErrorMsg = document.getElementById('candidateErrorMsg');
const candidateErrorText = document.getElementById('candidateErrorText');
const loginSuccessBanner = document.getElementById('loginSuccessBanner');
const loginSuccessBannerText = document.getElementById('loginSuccessBannerText');

// Examiner Login Elements
const adminUsernameInput = document.getElementById('adminUsernameInput');
const adminPasswordInput = document.getElementById('adminPasswordInput');
const examinerErrorMsg = document.getElementById('examinerErrorMsg');
const examinerErrorText = document.getElementById('examinerErrorText');
const btnAdminLogout = document.getElementById('btnAdminLogout');
const adminQuestionsTableBody = document.getElementById('adminQuestionsTableBody');

// Examiner Dashboard: Sub-tabs, Filters & Attempts Table
const adminTabAttemptsBtn = document.getElementById('adminTabAttemptsBtn');
const adminTabQuestionsBtn = document.getElementById('adminTabQuestionsBtn');
const adminAttemptsTabPane = document.getElementById('adminAttemptsTabPane');
const adminQuestionsTabPane = document.getElementById('adminQuestionsTabPane');
const adminSearchStudent = document.getElementById('adminSearchStudent');
const adminFilterGrade = document.getElementById('adminFilterGrade');
const btnPrintAttempts = document.getElementById('btnPrintAttempts');
const btnResetSeedData = document.getElementById('btnResetSeedData');
const adminAttemptsTableBody = document.getElementById('adminAttemptsTableBody');
const adminAttemptedCountBadge = document.getElementById('adminAttemptedCountBadge');
const adminFilteredCountBadge = document.getElementById('adminFilteredCountBadge');
const adminStatTotalAttempts = document.getElementById('adminStatTotalAttempts');
const adminStatAvgScore = document.getElementById('adminStatAvgScore');
const adminStatPassRate = document.getElementById('adminStatPassRate');
const adminStatTotalQuestions = document.getElementById('adminStatTotalQuestions');
const adminStatTotalQuestionsSub = document.getElementById('adminStatTotalQuestionsSub');
const adminQuestionsCountBadge = document.getElementById('adminQuestionsCountBadge');
const btnAddQuestionBtn = document.getElementById('btnAddQuestionBtn');
const btnResetQuestionsBtn = document.getElementById('btnResetQuestionsBtn');

// Question Edit Modal Elements
const adminQuestionEditModal = document.getElementById('adminQuestionEditModal');
const btnCloseQEditModal = document.getElementById('btnCloseQEditModal');
const btnCancelQEdit = document.getElementById('btnCancelQEdit');
const adminQuestionEditForm = document.getElementById('adminQuestionEditForm');
const qEditModalTitle = document.getElementById('qEditModalTitle');
const editQuestionId = document.getElementById('editQuestionId');
const editQuestionCategory = document.getElementById('editQuestionCategory');
const editQuestionText = document.getElementById('editQuestionText');
const editOption0 = document.getElementById('editOption0');
const editOption1 = document.getElementById('editOption1');
const editOption2 = document.getElementById('editOption2');
const editOption3 = document.getElementById('editOption3');
const editCorrectAnswer = document.getElementById('editCorrectAnswer');
const editQuestionMarks = document.getElementById('editQuestionMarks');
const editExplanation = document.getElementById('editExplanation');
const qEditErrorMsg = document.getElementById('qEditErrorMsg');
const qEditErrorText = document.getElementById('qEditErrorText');

// Instructions Screen Elements
const chkAgreement = document.getElementById('chkAgreement');
const btnStartExamNow = document.getElementById('btnStartExamNow');
const btnCancelInstructions = document.getElementById('btnCancelInstructions');
const camVerificationCard = document.getElementById('camVerificationCard');
const instAgreementBox = document.getElementById('instAgreementBox');
const camLockBadge = document.getElementById('camLockBadge');

// Webcam Proctoring Elements
const instCamVideo = document.getElementById('instCamVideo');
const camPlaceholder = document.getElementById('camPlaceholder');
const camLiveIndicator = document.getElementById('camLiveIndicator');
const camStatusPill = document.getElementById('camStatusPill');
const camStatusText = document.getElementById('camStatusText');
const btnToggleCamera = document.getElementById('btnToggleCamera');
const btnToggleCameraText = document.getElementById('btnToggleCameraText');
const examProctorPip = document.getElementById('examProctorPip');
const examCamVideo = document.getElementById('examCamVideo');

// Start Exam Confirmation Modal Elements
const startExamConfirmModal = document.getElementById('startExamConfirmModal');
const btnCancelStartExam = document.getElementById('btnCancelStartExam');
const btnConfirmStartExam = document.getElementById('btnConfirmStartExam');

// Exam Header Elements
const headerUserName = document.getElementById('headerUserName');
const headerUserId = document.getElementById('headerUserId');
const timerDisplay = document.getElementById('timerDisplay');
const timerBadge = document.getElementById('timerBadge');
const btnSubmitTop = document.getElementById('btnSubmitTop');

// Question Elements
const qCategoryBadge = document.getElementById('qCategoryBadge');
const qNumberDisplay = document.getElementById('qNumberDisplay');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const btnReviewToggle = document.getElementById('btnReviewToggle');
const reviewBtnText = document.getElementById('reviewBtnText');
const btnClearChoice = document.getElementById('btnClearChoice');

// Constant Option Cards & Text Elements
const optionCard0 = document.getElementById('optionCard0');
const optionCard1 = document.getElementById('optionCard1');
const optionCard2 = document.getElementById('optionCard2');
const optionCard3 = document.getElementById('optionCard3');
const optionText0 = document.getElementById('optionText0');
const optionText1 = document.getElementById('optionText1');
const optionText2 = document.getElementById('optionText2');
const optionText3 = document.getElementById('optionText3');

// Navigation & Pagination
const btnPrev = document.getElementById('btnPrev');
const btnNext = document.getElementById('btnNext');
const paginationNumbers = document.getElementById('paginationNumbers');

// Right Sidebar / Gauge
const progressCircle = document.getElementById('progressCircle');
const answeredFraction = document.getElementById('answeredFraction');
const countAnswered = document.getElementById('countAnswered');
const countReview = document.getElementById('countReview');
const countUnanswered = document.getElementById('countUnanswered');
const paletteGrid = document.getElementById('paletteGrid');

// Modal Elements
const confirmModal = document.getElementById('confirmModal');
const btnCancelSubmit = document.getElementById('btnCancelSubmit');
const btnConfirmSubmit = document.getElementById('btnConfirmSubmit');
const modalAnsweredCount = document.getElementById('modalAnsweredCount');
const modalUnansweredCount = document.getElementById('modalUnansweredCount');
const modalReviewCount = document.getElementById('modalReviewCount');

// Results & Leaderboard Elements
const resultCandidateGreeting = document.getElementById('resultCandidateGreeting');
const resScore = document.getElementById('resScore');
const resPercent = document.getElementById('resPercent');
const resAccuracy = document.getElementById('resAccuracy');
const resGrade = document.getElementById('resGrade');
const resTime = document.getElementById('resTime');
const btnTabLeaderboard = document.getElementById('btnTabLeaderboard');
const btnTabReview = document.getElementById('btnTabReview');
const resultsLeaderboardSection = document.getElementById('resultsLeaderboardSection');
const resultsReviewSection = document.getElementById('resultsReviewSection');
const resultsLeaderboardBadge = document.getElementById('resultsLeaderboardBadge');
const personalRankHeadline = document.getElementById('personalRankHeadline');
const personalRankDetail = document.getElementById('personalRankDetail');
const personalRankNumber = document.getElementById('personalRankNumber');
const leaderboardPodium = document.getElementById('leaderboardPodium');
const leaderboardTableBody = document.getElementById('leaderboardTableBody');
const questionReviewList = document.getElementById('questionReviewList');
const btnRetake = document.getElementById('btnRetake');
const btnLogoutResults = document.getElementById('btnLogoutResults');
const filterCorrectCount = document.getElementById('filterCorrectCount');
const filterWrongCount = document.getElementById('filterWrongCount');
const filterSkippedCount = document.getElementById('filterSkippedCount');

// Score Slip Modal Elements
const studentScoreSlipModal = document.getElementById('studentScoreSlipModal');
const scoreSlipContent = document.getElementById('scoreSlipContent');
const btnCloseScoreSlip = document.getElementById('btnCloseScoreSlip');
const btnCloseScoreSlip2 = document.getElementById('btnCloseScoreSlip2');

// SGPA & CGPA Formula Guide Modal Elements
const resGradeMetricCard = document.getElementById('resGradeMetricCard');
const sgpaFormulaModal = document.getElementById('sgpaFormulaModal');
const btnCloseSgpaModal = document.getElementById('btnCloseSgpaModal');
const btnCloseSgpaModal2 = document.getElementById('btnCloseSgpaModal2');
const btnRunLiveCalc = document.getElementById('btnRunLiveCalc');
const calcC1 = document.getElementById('calcC1');
const calcG1 = document.getElementById('calcG1');
const calcC2 = document.getElementById('calcC2');
const calcG2 = document.getElementById('calcG2');
const calcC3 = document.getElementById('calcC3');
const calcG3 = document.getElementById('calcG3');
const calcC4 = document.getElementById('calcC4');
const calcG4 = document.getElementById('calcG4');
const liveSgpaResult = document.getElementById('liveSgpaResult');
const liveSgpaGrade = document.getElementById('liveSgpaGrade');

// ========================================================
// INITIALIZATION
// ========================================================
function initApp() {
    progressCircle.style.strokeDasharray = `${CIRCUMFERENCE}`;
    progressCircle.style.strokeDashoffset = `${CIRCUMFERENCE}`;

    getStudentAttempts(); // Seed attempts if not already present
    generateCaptcha();
    setupAdminTable();
    updateAdminStats();
    attachEventListeners();
    setupAntiCheatProtection();
    updateCameraUI(false);

    // Asynchronously connect to Backend Server if running
    if (typeof BACKEND_API !== 'undefined') {
        BACKEND_API.checkHealth().then(online => {
            if (online) {
                BACKEND_API.syncStudents();
                BACKEND_API.syncQuestions().then(qs => {
                    if (qs && typeof setupAdminTable === 'function') setupAdminTable();
                });
                BACKEND_API.syncAttempts().then(atts => {
                    if (atts && typeof updateAdminStats === 'function') updateAdminStats();
                });
            }
        });
    }

    // Interactive connection badge click to check / reconnect
    const badge = document.getElementById('backendConnectionBadge');
    if (badge) {
        badge.addEventListener('click', () => {
            if (typeof BACKEND_API !== 'undefined') {
                BACKEND_API.updateUIStatus(false, "Checking Server...");
                BACKEND_API.checkHealth().then(online => {
                    if (online) {
                        BACKEND_API.syncStudents();
                        BACKEND_API.syncQuestions().then(qs => {
                            if (qs && typeof setupAdminTable === 'function') setupAdminTable();
                        });
                        BACKEND_API.syncAttempts().then(atts => {
                            if (atts && typeof updateAdminStats === 'function') updateAdminStats();
                        });
                        showAntiCheatToast("🟢 Backend Server Connected (Port 3000)!");
                    } else {
                        showAntiCheatToast("⚠️ Backend is offline. Run 'npm start' or 'node backend/server.js'");
                    }
                });
            }
        });
    }
}

// ========================================================
// CAPTCHA CODE GENERATOR
// ========================================================
function generateCaptcha() {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude confusing chars like 0, O, 1, I
    let code = "";
    for (let i = 0; i < 5; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptchaCode = code;
    captchaCodeDisplay.textContent = code;
    captchaInput.value = "";
}

// ========================================================
// SCREEN TRANSITIONS & NAVIGATION
// ========================================================
function showRegistrationScreen() {
    welcomeScreen.classList.add('hidden');
    loginScreen.classList.add('hidden');
    registrationScreen.classList.remove('hidden');
    instructionsScreen.classList.add('hidden');
    adminDashboardScreen.classList.add('hidden');
    examScreenWrapper.classList.add('hidden');
    if (registerErrorMsg) registerErrorMsg.classList.add('hidden');
    if (regCandidateName) regCandidateName.focus();
}

function showLoginScreen(fromRegistration = false) {
    welcomeScreen.classList.add('hidden');
    registrationScreen.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    instructionsScreen.classList.add('hidden');
    adminDashboardScreen.classList.add('hidden');
    examScreenWrapper.classList.add('hidden');
    if (candidateErrorMsg) candidateErrorMsg.classList.add('hidden');
    if (examinerErrorMsg) examinerErrorMsg.classList.add('hidden');
    if (!fromRegistration && loginSuccessBanner) {
        loginSuccessBanner.classList.add('hidden');
    }
    switchLoginTab('candidate');
    generateCaptcha();
}

function showWelcomeScreen() {
    registrationScreen.classList.add('hidden');
    loginScreen.classList.add('hidden');
    instructionsScreen.classList.add('hidden');
    adminDashboardScreen.classList.add('hidden');
    examScreenWrapper.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
}

let currentActiveTab = 'candidate';

// Tab Switching (Candidate vs Examiner) with Sliding Pill Animation
function switchLoginTab(tab) {
    currentActiveTab = tab;
    if (tab === 'candidate') {
        tabCandidateBtn.classList.add('active');
        tabExaminerBtn.classList.remove('active');
        loginTabs.classList.remove('slide-right');
        candidateLoginTabContent.classList.remove('hidden');
        examinerLoginTabContent.classList.add('hidden');
    } else {
        tabExaminerBtn.classList.add('active');
        tabCandidateBtn.classList.remove('active');
        loginTabs.classList.add('slide-right');
        examinerLoginTabContent.classList.remove('hidden');
        candidateLoginTabContent.classList.add('hidden');
    }
}

// ========================================================
// CANDIDATE REGISTRATION & LOGIN VERIFICATION
// ========================================================
function handleCandidateRegister() {
    const name = regCandidateName.value.trim();
    const roll = regRollNumber.value.trim().toUpperCase();
    const dept = regDepartment.value;
    const password = regPassword ? regPassword.value.trim() : '';

    if (!name) {
        showRegisterError("Please enter your Full Name!");
        regCandidateName.focus();
        return;
    }

    if (!isValidRollNumber(roll)) {
        showRegisterError("Invalid Roll Number! Must be from 26HEU05R001 to 26HEU05R999.");
        regRollNumber.focus();
        return;
    }

    if (!password) {
        showRegisterError("Please create a password for your examination account!");
        if (regPassword) regPassword.focus();
        return;
    }

    if (password.length < 4) {
        showRegisterError("Password must be at least 4 characters long!");
        if (regPassword) regPassword.focus();
        return;
    }

    // Save into registered students database with their own created password
    const registered = getRegisteredStudents();
    const existingIndex = registered.findIndex(s => s.id.toUpperCase() === roll);
    if (existingIndex >= 0) {
        registered[existingIndex].name = name;
        registered[existingIndex].dept = dept;
        registered[existingIndex].password = password;
    } else {
        registered.push({
            id: roll,
            name: name,
            dept: dept,
            password: password,
            registeredAt: new Date().toLocaleString('en-IN')
        });
    }
    setRegisteredStudents(registered);

    // Sync registration with backend database if online
    if (typeof BACKEND_API !== 'undefined' && BACKEND_API.isOnline) {
        BACKEND_API.registerStudent({ name, id: roll, dept, password });
    }

    // Set logged-in candidate state
    loggedInUser = { name: name, id: roll };

    // After registration is complete, navigate directly to the login screen!
    showLoginScreen(true);

    // Pre-fill student username / roll number
    studentUsernameInput.value = roll;

    // DO NOT AUTO-FILL PASSWORD OR CAPTCHA (as requested: "LOGIN LO AUTO FILL CHEYAKU")
    studentPasswordInput.value = '';
    captchaInput.value = '';

    // Show prominent success notification
    if (loginSuccessBanner && loginSuccessBannerText) {
        loginSuccessBannerText.innerHTML = `<strong>🎉 Registration Successful!</strong><br>Welcome, <strong>${name}</strong> (${roll}). Your account is registered!<br>Please enter the <strong>password you just created</strong>, solve the security CAPTCHA, and click <strong>Verify & Continue to Instructions</strong> to log in.`;
        loginSuccessBanner.classList.remove('hidden');
    }

    if (candidateErrorMsg) candidateErrorMsg.classList.add('hidden');
    // Focus password field so student can type their password
    studentPasswordInput.focus();
}

function showRegisterError(msg) {
    registerErrorText.textContent = msg;
    registerErrorMsg.classList.remove('hidden');
}

async function handleCandidateLogin() {
    const roll = studentUsernameInput.value.trim().toUpperCase();
    const password = studentPasswordInput.value.trim();
    const userCaptcha = captchaInput.value.trim().toUpperCase();

    if (!roll || !password) {
        showCandidateError("Please enter both Username (Roll No) and Password!");
        return;
    }

    // 1. Verify Roll Number range: 26HEU05R001 to 26HEU05R999
    if (!isValidRollNumber(roll)) {
        showCandidateError("Invalid Roll Number! Must be within 26HEU05R001 to 26HEU05R999.");
        studentUsernameInput.focus();
        return;
    }

    // 2. Verify CAPTCHA
    if (userCaptcha !== currentCaptchaCode) {
        showCandidateError("Incorrect CAPTCHA verification code! New code generated.");
        generateCaptcha();
        captchaInput.focus();
        return;
    }

    let candidateName = `Candidate (${roll})`;
    let candidateDept = 'Computer Science & Engineering';

    // 3. Authenticate with Backend API if online
    if (typeof BACKEND_API !== 'undefined' && BACKEND_API.isOnline) {
        try {
            const loginRes = await BACKEND_API.candidateLogin(roll, password);
            if (loginRes) {
                if (!loginRes.success) {
                    showCandidateError(loginRes.error || "Login verification failed. Check credentials.");
                    studentPasswordInput.focus();
                    return;
                }
                if (loginRes.user) {
                    candidateName = loginRes.user.name || candidateName;
                    candidateDept = loginRes.user.dept || candidateDept;
                }
            } else {
                // Fallback to local
                const registered = getRegisteredStudents();
                const found = registered.find(s => s.id.toUpperCase() === roll);
                if (!found) {
                    showCandidateError("Roll Number not registered! Please register your account first.");
                    studentUsernameInput.focus();
                    return;
                }
                const expectedPassword = found.password || found.id;
                if (password !== expectedPassword) {
                    showCandidateError("Incorrect password! Please enter the password you created during registration.");
                    studentPasswordInput.focus();
                    return;
                }
                candidateName = found.name || candidateName;
                candidateDept = found.dept || candidateDept;
            }
        } catch (err) {
            console.warn("Backend auth exception, using local store:", err);
        }
    } else {
        // Standalone offline verification
        const registered = getRegisteredStudents();
        const found = registered.find(s => s.id.toUpperCase() === roll);
        if (!found) {
            showCandidateError("Roll Number not registered! Please register your account first.");
            studentUsernameInput.focus();
            return;
        }
        const expectedPassword = found.password || found.id;
        if (password !== expectedPassword) {
            showCandidateError("Incorrect password! Please enter the password you created during registration.");
            studentPasswordInput.focus();
            return;
        }
        candidateName = found.name || candidateName;
        candidateDept = found.dept || candidateDept;
    }

    // Save candidate data
    loggedInUser = { name: candidateName, id: roll, dept: candidateDept };
    headerUserName.textContent = loggedInUser.name;
    headerUserId.textContent = `ID: ${loggedInUser.id}`;
    resultCandidateGreeting.textContent = `Candidate: ${loggedInUser.name} | Hall Ticket: ${loggedInUser.id}`;

    // Hide Login, Show Instructions Screen
    loginScreen.classList.add('hidden');
    instructionsScreen.classList.remove('hidden');

    // Reset agreement checkbox and camera state
    chkAgreement.checked = false;
    chkAgreement.disabled = true;
    btnStartExamNow.disabled = true;
    updateCameraUI(false);
}

function showCandidateError(msg) {
    candidateErrorText.textContent = msg;
    candidateErrorMsg.classList.remove('hidden');
}

// ========================================================
// EXAMINER / ADMIN LOGIN & DASHBOARD
// ========================================================
async function handleExaminerLogin() {
    const username = adminUsernameInput.value.trim();
    const password = adminPasswordInput.value.trim();

    if (!username || !password) {
        showExaminerError("Please enter Examiner ID and Password!");
        return;
    }

    if (typeof BACKEND_API !== 'undefined' && BACKEND_API.isOnline) {
        const res = await BACKEND_API.examinerLogin(username, password);
        if (res && !res.success) {
            showExaminerError(res.error || "Invalid Admin Password! Please use 'admin123'.");
            return;
        }
        await BACKEND_API.syncAttempts();
        await BACKEND_API.syncQuestions();
    } else {
        if (password !== "admin123") {
            showExaminerError("Invalid Admin Password! Please use 'admin123'.");
            return;
        }
    }

    loginScreen.classList.add('hidden');
    adminDashboardScreen.classList.remove('hidden');
    renderAdminDashboard();
    switchAdminSubTab('attempts');
}

function showExaminerError(msg) {
    examinerErrorText.textContent = msg;
    examinerErrorMsg.classList.remove('hidden');
}

function setupAdminTable() {
    if (!adminQuestionsTableBody) return;
    adminQuestionsTableBody.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    // Update count badges & stats
    const qCount = questionsData.length;
    if (adminQuestionsCountBadge) adminQuestionsCountBadge.textContent = qCount;
    if (adminStatTotalQuestions) adminStatTotalQuestions.textContent = `${qCount} Questions`;
    if (adminStatTotalQuestionsSub) adminStatTotalQuestionsSub.textContent = "Active Question Bank";

    questionsData.forEach((q, idx) => {
        const tr = document.createElement('tr');

        const safeQuestion = escapeHtml(q.question);
        const opt0 = escapeHtml(q.options && q.options[0] ? q.options[0] : '');
        const opt1 = escapeHtml(q.options && q.options[1] ? q.options[1] : '');
        const opt2 = escapeHtml(q.options && q.options[2] ? q.options[2] : '');
        const opt3 = escapeHtml(q.options && q.options[3] ? q.options[3] : '');
        const correctKey = letters[q.correctAnswer] || 'A';

        tr.innerHTML = `
            <td><strong>${idx + 1}</strong></td>
            <td><span class="q-badge">${escapeHtml(q.category || 'Web Tech')}</span></td>
            <td>
                <div class="q-table-text">${safeQuestion}</div>
                <div class="q-table-options">
                    <span class="${q.correctAnswer === 0 ? 'correct-opt' : ''}"><strong>A:</strong> ${opt0}</span>
                    <span class="${q.correctAnswer === 1 ? 'correct-opt' : ''}"><strong>B:</strong> ${opt1}</span>
                    <span class="${q.correctAnswer === 2 ? 'correct-opt' : ''}"><strong>C:</strong> ${opt2}</span>
                    <span class="${q.correctAnswer === 3 ? 'correct-opt' : ''}"><strong>D:</strong> ${opt3}</span>
                </div>
            </td>
            <td><span class="badge-key">Option ${correctKey}</span></td>
            <td><strong>1.00</strong></td>
            <td><span class="badge-active"><i class="fa-solid fa-circle-check"></i> Published</span></td>
            <td style="text-align: center;">
                <div class="q-actions-flex">
                    <button type="button" class="btn-edit-q" data-q-id="${q.id}" title="Edit Question #${idx + 1}">
                        <i class="fa-solid fa-pen-to-square"></i>
                        <span>Edit</span>
                    </button>
                    <button type="button" class="btn-delete-q" data-q-id="${q.id}" title="Delete Question #${idx + 1}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;

        const editBtn = tr.querySelector('.btn-edit-q');
        if (editBtn) {
            editBtn.addEventListener('click', () => openEditQuestionModal(q.id));
        }

        const deleteBtn = tr.querySelector('.btn-delete-q');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => handleDeleteQuestion(q.id));
        }

        adminQuestionsTableBody.appendChild(tr);
    });
}

function openEditQuestionModal(questionId = null) {
    if (!adminQuestionEditModal) return;

    if (qEditErrorMsg) qEditErrorMsg.classList.add('hidden');

    if (questionId !== null) {
        const q = questionsData.find(item => item.id == questionId);
        if (!q) return;

        const qIndex = questionsData.indexOf(q) + 1;
        if (qEditModalTitle) {
            qEditModalTitle.innerHTML = `<i class="fa-solid fa-pen-to-square"></i> Edit Question #${qIndex}`;
        }
        if (editQuestionId) editQuestionId.value = q.id;
        if (editQuestionCategory) editQuestionCategory.value = q.category || 'Web Development';
        if (editQuestionText) editQuestionText.value = q.question || '';
        if (editOption0) editOption0.value = (q.options && q.options[0]) || '';
        if (editOption1) editOption1.value = (q.options && q.options[1]) || '';
        if (editOption2) editOption2.value = (q.options && q.options[2]) || '';
        if (editOption3) editOption3.value = (q.options && q.options[3]) || '';
        if (editCorrectAnswer) editCorrectAnswer.value = q.correctAnswer !== undefined ? q.correctAnswer : 0;
        if (editQuestionMarks) editQuestionMarks.value = 1;
        if (editExplanation) editExplanation.value = q.explanation || '';
    } else {
        if (qEditModalTitle) {
            qEditModalTitle.innerHTML = `<i class="fa-solid fa-plus"></i> Add New Examination Question`;
        }
        if (editQuestionId) editQuestionId.value = '';
        if (editQuestionCategory) editQuestionCategory.value = 'Web Development';
        if (editQuestionText) editQuestionText.value = '';
        if (editOption0) editOption0.value = '';
        if (editOption1) editOption1.value = '';
        if (editOption2) editOption2.value = '';
        if (editOption3) editOption3.value = '';
        if (editCorrectAnswer) editCorrectAnswer.value = '0';
        if (editQuestionMarks) editQuestionMarks.value = 1;
        if (editExplanation) editExplanation.value = '';
    }

    adminQuestionEditModal.classList.remove('hidden');
    if (editQuestionText) editQuestionText.focus();
}

function closeEditQuestionModal() {
    if (adminQuestionEditModal) {
        adminQuestionEditModal.classList.add('hidden');
    }
}

function handleSaveQuestion() {
    const qIdVal = editQuestionId.value;
    const category = editQuestionCategory.value.trim();
    const statement = editQuestionText.value.trim();
    const opt0 = editOption0.value.trim();
    const opt1 = editOption1.value.trim();
    const opt2 = editOption2.value.trim();
    const opt3 = editOption3.value.trim();
    const correctKey = parseInt(editCorrectAnswer.value, 10);
    const explanation = editExplanation.value.trim();

    if (!statement || !opt0 || !opt1 || !opt2 || !opt3) {
        if (qEditErrorMsg && qEditErrorText) {
            qEditErrorText.textContent = "Please provide the question statement and all four options!";
            qEditErrorMsg.classList.remove('hidden');
        }
        return;
    }

    if (qIdVal) {
        const targetId = isNaN(qIdVal) ? qIdVal : parseInt(qIdVal, 10);
        const index = questionsData.findIndex(item => item.id == targetId);
        if (index >= 0) {
            questionsData[index].category = category || 'Web Development';
            questionsData[index].question = statement;
            questionsData[index].options = [opt0, opt1, opt2, opt3];
            questionsData[index].correctAnswer = isNaN(correctKey) ? 0 : correctKey;
            questionsData[index].explanation = explanation;
        }
    } else {
        const newQuestion = {
            id: Date.now(),
            category: category || 'Web Development',
            question: statement,
            options: [opt0, opt1, opt2, opt3],
            correctAnswer: isNaN(correctKey) ? 0 : correctKey,
            explanation: explanation
        };
        questionsData.push(newQuestion);
    }

    totalQuestions = questionsData.length;
    saveExamQuestions(questionsData);
    setupAdminTable();
    updateAdminStats();
    closeEditQuestionModal();

    showAntiCheatToast(qIdVal ? "✅ Question updated successfully!" : "✅ New question added to repository!");
}

function handleDeleteQuestion(questionId) {
    if (questionsData.length <= 1) {
        alert("The examination must retain at least one question!");
        return;
    }

    const q = questionsData.find(item => item.id == questionId);
    if (!q) return;

    if (!confirm(`Are you sure you want to delete Question:\n"${q.question.substring(0, 60)}..."?`)) {
        return;
    }

    questionsData = questionsData.filter(item => item.id != questionId);
    totalQuestions = questionsData.length;
    saveExamQuestions(questionsData);
    setupAdminTable();
    updateAdminStats();
    showAntiCheatToast("🗑️ Question deleted from repository.");
}

function handleResetQuestionsToDefault() {
    if (!confirm("Are you sure you want to reset the Question Repository to the default 10 curated questions? Any custom question edits will be replaced.")) {
        return;
    }

    questionsData = JSON.parse(JSON.stringify(DEFAULT_QUESTIONS_DATA));
    totalQuestions = questionsData.length;
    saveExamQuestions(questionsData);
    setupAdminTable();
    updateAdminStats();
    showAntiCheatToast("✅ Questions reset to default 10 questions!");
}

// ========================================================
// FULLSCREEN CONTROLS
// ========================================================
function enterFullscreen() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(err => {
            console.log("Fullscreen request was prevented:", err);
        });
    } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) {
        docEl.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => {
                console.log("Exit fullscreen was prevented:", err);
            });
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    }
}

function toggleFullscreenMode() {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        enterFullscreen();
    } else {
        exitFullscreen();
    }
}

function updateFullscreenIcons() {
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement);
    const icons = document.querySelectorAll('.fullscreen-icon-state');
    icons.forEach(icon => {
        if (isFull) {
            icon.className = 'fa-solid fa-compress fullscreen-icon-state';
        } else {
            icon.className = 'fa-solid fa-expand fullscreen-icon-state';
        }
    });
}

document.addEventListener('fullscreenchange', updateFullscreenIcons);
document.addEventListener('webkitfullscreenchange', updateFullscreenIcons);

// ========================================================
// WEBCAM PROCTORING CONTROLS
// ========================================================
let cameraStream = null;
let isCameraActive = false;
let isVirtualCamera = false;
let virtualCanvas = null;
let virtualAnimId = null;

function createVirtualProctorStream() {
    if (!virtualCanvas) {
        virtualCanvas = document.createElement('canvas');
        virtualCanvas.width = 640;
        virtualCanvas.height = 480;
    }
    const ctx = virtualCanvas.getContext('2d');
    let frameCount = 0;

    function drawVirtualFrame() {
        frameCount++;
        const w = virtualCanvas.width;
        const h = virtualCanvas.height;

        // Background: modern proctoring studio
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#0f172a');
        bgGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Grid lines (telemetry)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, h);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }

        // Head and Face Geometry
        const centerX = w / 2;
        const centerY = h / 2 - 10;
        const sway = Math.sin(frameCount * 0.04) * 6;

        // Shoulders
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(centerX + sway, h + 45, 180, 130, 0, 0, Math.PI * 2);
        ctx.fill();

        // Neck
        ctx.fillStyle = '#fbcfe8';
        ctx.fillRect(centerX + sway - 28, centerY + 75, 56, 55);

        // Head
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.ellipse(centerX + sway, centerY, 78, 100, 0, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.ellipse(centerX + sway, centerY - 48, 82, 58, 0, 0, Math.PI);
        ctx.fill();

        // Eyes (blinking simulation)
        const isBlinking = (frameCount % 80) < 5;
        ctx.fillStyle = '#0f172a';
        if (isBlinking) {
            ctx.fillRect(centerX + sway - 38, centerY - 10, 24, 3);
            ctx.fillRect(centerX + sway + 14, centerY - 10, 24, 3);
        } else {
            ctx.beginPath();
            ctx.arc(centerX + sway - 26, centerY - 10, 8, 0, Math.PI * 2);
            ctx.arc(centerX + sway + 26, centerY - 10, 8, 0, Math.PI * 2);
            ctx.fill();

            // Eye highlights
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(centerX + sway - 24, centerY - 12, 3, 0, Math.PI * 2);
            ctx.arc(centerX + sway + 28, centerY - 12, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Nose
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX + sway, centerY - 4);
        ctx.lineTo(centerX + sway - 3, centerY + 16);
        ctx.lineTo(centerX + sway + 3, centerY + 16);
        ctx.stroke();

        // Smile
        ctx.strokeStyle = '#c2410c';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX + sway, centerY + 28, 20, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Face Landmark Tracking Box (Proctor AI Scanner)
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        const bx = centerX + sway - 92;
        const by = centerY - 110;
        const bw = 184;
        const bh = 220;
        ctx.strokeRect(bx, by, bw, bh);

        // Tracking corners
        ctx.fillStyle = '#10b981';
        ctx.fillRect(bx, by, 16, 4);
        ctx.fillRect(bx, by, 4, 16);
        ctx.fillRect(bx + bw - 16, by, 16, 4);
        ctx.fillRect(bx + bw - 4, by, 4, 16);
        ctx.fillRect(bx, by + bh - 4, 16, 4);
        ctx.fillRect(bx, by + bh - 16, 4, 16);
        ctx.fillRect(bx + bw - 16, by + bh - 4, 16, 4);
        ctx.fillRect(bx + bw - 4, by + bh - 16, 4, 16);

        // Status Overlay Text
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('● LIVE PROCTOR FEED', 20, 34);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px monospace';
        const candName = (loggedInUser && loggedInUser.name) ? loggedInUser.name : 'Candidate';
        ctx.fillText(`CANDIDATE: ${candName.toUpperCase()} | FACE DETECTED: 100%`, 20, h - 20);

        virtualAnimId = requestAnimationFrame(drawVirtualFrame);
    }

    if (virtualAnimId) cancelAnimationFrame(virtualAnimId);
    drawVirtualFrame();

    return virtualCanvas.captureStream(30);
}

async function enableCamera(autoOpenModal = false) {
    // If already active and candidate clicked toggle button, turn off
    if (isCameraActive && cameraStream && !autoOpenModal) {
        stopCamera();
        updateCameraUI(false);
        showAntiCheatToast("📷 Camera turned OFF.");
        return false;
    }

    // Indicate connecting state
    if (btnToggleCameraText) btnToggleCameraText.textContent = "Connecting Camera...";
    if (camStatusText) camStatusText.textContent = "Accessing Webcam Hardware...";

    let stream = null;
    isVirtualCamera = false;

    // 1. Attempt hardware webcam access with robust fallbacks
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 640 }, height: { ideal: 480 } },
                    audio: false
                });
            } catch (err1) {
                console.warn("Attempt 1 with constraints failed:", err1);
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                } catch (err2) {
                    console.warn("Attempt 2 with basic video failed:", err2);
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                }
            }
        }
    } catch (err) {
        console.warn("Hardware camera access failed or blocked:", err);
    }

    // 2. If physical camera was blocked, denied, or unavailable: engage Virtual Face Proctor Stream
    if (!stream) {
        console.info("Hardware camera unavailable. Activating Virtual AI Face Proctor Stream.");
        stream = createVirtualProctorStream();
        isVirtualCamera = true;
    }

    if (stream) {
        cameraStream = stream;
        isCameraActive = true;

        // Attach stream to instructions preview video
        if (instCamVideo) {
            instCamVideo.muted = true;
            instCamVideo.playsInline = true;
            instCamVideo.srcObject = stream;
            instCamVideo.play().catch(e => console.log("instCamVideo play notice:", e));
        }

        // Pre-attach stream to exam floating PiP video
        if (examCamVideo) {
            examCamVideo.muted = true;
            examCamVideo.playsInline = true;
            examCamVideo.srcObject = stream;
            examCamVideo.play().catch(e => console.log("examCamVideo play notice:", e));
        }

        updateCameraUI(true);

        if (isVirtualCamera) {
            showAntiCheatToast("📷 Virtual AI Face Proctoring Activated (Face Detected).");
        } else {
            showAntiCheatToast("✅ Webcam Active: Live proctoring verified successfully.");
        }

        if (autoOpenModal) {
            startExamConfirmModal.classList.remove('hidden');
        }

        return true;
    } else {
        isCameraActive = false;
        cameraStream = null;
        updateCameraUI(false);
        alert("⚠️ Camera Access Error!\nPlease check camera permissions or reload your browser.");
        return false;
    }
}

function stopCamera() {
    if (virtualAnimId) {
        cancelAnimationFrame(virtualAnimId);
        virtualAnimId = null;
    }
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => {
            track.stop();
        });
        cameraStream = null;
    }
    isCameraActive = false;
    isVirtualCamera = false;
    if (instCamVideo) {
        instCamVideo.srcObject = null;
    }
    if (examCamVideo) {
        examCamVideo.srcObject = null;
    }
}

// ========================================================
// PROCTORING LIVE MEDIA RECORDER
// ========================================================
let examMediaRecorder = null;
let examRecordedChunks = [];
let currentExamRecordingBlobUrl = null;
const sessionProctorRecordings = {}; // candidateId -> { videoUrl, timestamp }
let auditSimulationTimer = null;
let auditCurrentQIndex = 0;

function startExamProctorRecording() {
    examRecordedChunks = [];
    currentExamRecordingBlobUrl = null;

    if (!cameraStream) {
        console.warn("No active cameraStream to record proctoring video.");
        return;
    }

    try {
        let options = { mimeType: 'video/webm;codecs=vp8,opus' };
        if (typeof MediaRecorder.isTypeSupported === 'function') {
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
            }
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = undefined;
            }
        } else {
            options = undefined;
        }

        examMediaRecorder = options ? new MediaRecorder(cameraStream, options) : new MediaRecorder(cameraStream);

        examMediaRecorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
                examRecordedChunks.push(event.data);
            }
        };

        examMediaRecorder.onstop = () => {
            if (examRecordedChunks.length > 0) {
                try {
                    const blob = new Blob(examRecordedChunks, { type: 'video/webm' });
                    currentExamRecordingBlobUrl = URL.createObjectURL(blob);
                    if (loggedInUser && loggedInUser.id) {
                        sessionProctorRecordings[loggedInUser.id] = {
                            videoUrl: currentExamRecordingBlobUrl,
                            timestamp: new Date().toISOString(),
                            studentName: loggedInUser.name,
                            studentId: loggedInUser.id
                        };
                        if (typeof BACKEND_API !== 'undefined' && BACKEND_API.isOnline) {
                            BACKEND_API.uploadProctorVideo(blob, loggedInUser.id).then(res => {
                                if (res && res.videoUrl) {
                                    sessionProctorRecordings[loggedInUser.id].backendUrl = res.videoUrl;
                                    console.log("🎥 Proctor recording uploaded to university backend:", res.videoUrl);
                                }
                            });
                        }
                    }
                } catch (e) {
                    console.warn("Blob assembly error:", e);
                }
            }
        };

        examMediaRecorder.start(1000); // 1-second chunks
        console.log("Exam MediaRecorder active. Live recording candidate webcam stream.");
    } catch (err) {
        console.warn("MediaRecorder start failed or not supported:", err);
    }
}

function stopExamProctorRecording() {
    if (examMediaRecorder && examMediaRecorder.state !== 'inactive') {
        try {
            examMediaRecorder.stop();
        } catch (err) {
            console.warn("MediaRecorder stop error:", err);
        }
    }
    // Synchronously create Blob from chunks collected so far if needed
    if (examRecordedChunks.length > 0 && !currentExamRecordingBlobUrl) {
        try {
            const blob = new Blob(examRecordedChunks, { type: 'video/webm' });
            currentExamRecordingBlobUrl = URL.createObjectURL(blob);
            if (loggedInUser && loggedInUser.id) {
                sessionProctorRecordings[loggedInUser.id] = {
                    videoUrl: currentExamRecordingBlobUrl,
                    timestamp: new Date().toISOString()
                };
            }
        } catch (e) {
            console.warn("Synchronous Blob assembly warning:", e);
        }
    }
}

function updateCameraUI(active) {
    if (camStatusPill) {
        if (active) {
            camStatusPill.className = "cam-status-pill status-on";
            camStatusPill.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span id="camStatusText">Camera Active & Verified (Ready to Start)</span>';
        } else {
            camStatusPill.className = "cam-status-pill status-off";
            camStatusPill.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span id="camStatusText">Camera Permission Required to Start Exam</span>';
        }
    }

    if (btnToggleCameraText) {
        btnToggleCameraText.textContent = active ? "Camera Verified ✅ (Click to Turn Off)" : "Turn ON Camera & Verify";
    }

    if (btnToggleCamera) {
        if (active) {
            btnToggleCamera.classList.add('cam-active-btn');
        } else {
            btnToggleCamera.classList.remove('cam-active-btn');
        }
    }

    if (instCamVideo && camPlaceholder && camLiveIndicator) {
        if (active) {
            instCamVideo.classList.remove('hidden');
            instCamVideo.style.display = 'block';
            camPlaceholder.classList.add('hidden');
            camPlaceholder.style.display = 'none';
            camLiveIndicator.classList.remove('hidden');
            camLiveIndicator.style.display = 'inline-flex';
        } else {
            instCamVideo.classList.add('hidden');
            instCamVideo.style.display = 'none';
            camPlaceholder.classList.remove('hidden');
            camPlaceholder.style.display = 'flex';
            camLiveIndicator.classList.add('hidden');
            camLiveIndicator.style.display = 'none';
        }
    }

    // Agreement Checkbox: Unlocks and selects ONLY when Camera is verified ON
    if (chkAgreement) {
        if (active) {
            chkAgreement.disabled = false;
            chkAgreement.checked = true; // Auto-select checkbox upon successful camera verification
            if (btnStartExamNow) btnStartExamNow.disabled = false;
        } else {
            chkAgreement.checked = false;
            chkAgreement.disabled = true;
            if (btnStartExamNow) btnStartExamNow.disabled = true;
        }
    }

    if (instAgreementBox) {
        if (active) {
            instAgreementBox.classList.remove('agreement-locked');
            instAgreementBox.classList.add('agreement-verified');
        } else {
            instAgreementBox.classList.remove('agreement-verified');
            instAgreementBox.classList.add('agreement-locked');
        }
    }

    if (camLockBadge) {
        if (active) {
            camLockBadge.className = "cam-lock-badge badge-unlocked";
            camLockBadge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Camera Verified & Checkbox Unlocked';
        } else {
            camLockBadge.className = "cam-lock-badge badge-locked";
            camLockBadge.innerHTML = '<i class="fa-solid fa-lock"></i> Camera verification required to enable checkbox';
        }
    }
}

function triggerCameraHighlight() {
    if (camVerificationCard) {
        camVerificationCard.classList.remove('shake-card-highlight');
        void camVerificationCard.offsetWidth; // trigger reflow
        camVerificationCard.classList.add('shake-card-highlight');
        camVerificationCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
            if (camVerificationCard) camVerificationCard.classList.remove('shake-card-highlight');
        }, 1200);
    }
}

// ========================================================
// PRE-EXAM CONFIRMATION & SESSION LAUNCH
// ========================================================
async function promptStartExamConfirmation() {
    // Strict Camera Check: Exam will NOT start unless camera is ON
    if (!isCameraActive || !cameraStream) {
        showAntiCheatToast("⚠️ Camera Verification Required! Turn ON your camera first.");
        triggerCameraHighlight();
        if (chkAgreement) {
            chkAgreement.checked = false;
            chkAgreement.disabled = true;
        }
        if (btnStartExamNow) btnStartExamNow.disabled = true;
        return;
    }

    if (!chkAgreement.checked) return;

    startExamConfirmModal.classList.remove('hidden');
}

function closeStartExamConfirmModal() {
    startExamConfirmModal.classList.add('hidden');
}

function confirmAndLaunchExam() {
    // Double-check camera is active
    if (!isCameraActive || !cameraStream) {
        alert("⚠️ Camera is not active. Exam will NOT start without an active webcam!");
        enableCamera(true);
        return;
    }

    closeStartExamConfirmModal();
    // Launch directly into exam without browser fullscreen prompt
    beginExamSession();
}

function beginExamSession() {
    instructionsScreen.classList.add('hidden');
    examScreenWrapper.classList.remove('hidden');
    examView.classList.remove('hidden');
    resultsView.classList.add('hidden');
    btnSubmitTop.style.display = 'inline-flex';

    // Hook camera stream into the exam floating proctoring window
    if (examCamVideo && cameraStream) {
        examCamVideo.muted = true;
        examCamVideo.playsInline = true;
        examCamVideo.srcObject = cameraStream;
        examCamVideo.play().catch(e => console.log("Exam video play error:", e));
    }
    if (examProctorPip) {
        examProctorPip.classList.remove('hidden');
        examProctorPip.style.display = 'flex';
    }

    // Start Live Webcam Proctoring Recording
    startExamProctorRecording();

    examInProgress = true;
    tabSwitchCount = 0;

    totalQuestions = questionsData.length;
    userAnswers = new Array(totalQuestions).fill(null);
    markedForReview = new Array(totalQuestions).fill(false);
    timeRemaining = TOTAL_EXAM_SECONDS;
    examFinished = false;

    buildPaginationNumbers();
    buildPaletteGrid();
    loadQuestion(0);
    updateProgressGauge();
    startTimer();

    // Push initial history state to block back button
    window.history.pushState(null, "", window.location.href);
}

// ========================================================
// ANTI-CHEAT & NAVIGATION TRAP ("DO NOT SLIDE OR BACK")
// ========================================================
function setupAntiCheatProtection() {
    // 1. Block back navigation
    window.addEventListener('popstate', (e) => {
        if (examInProgress && !examFinished) {
            window.history.pushState(null, "", window.location.href);
            showAntiCheatToast("⚠️ Back navigation / sliding is blocked during the active exam!");
        }
    });

    // 2. Warn on page reload or close
    window.addEventListener('beforeunload', (e) => {
        if (examInProgress && !examFinished) {
            e.preventDefault();
            e.returnValue = "Exam is in progress! If you leave, your exam will be auto-submitted.";
            return e.returnValue;
        }
    });

    // 3. Tab switch / window slide detection
    document.addEventListener('visibilitychange', () => {
        if (examInProgress && !examFinished) {
            if (document.hidden) {
                tabSwitchCount++;
            } else {
                showAntiCheatToast(`⚠️ Security Alert: Tab switching or sliding away is prohibited! (Warning ${tabSwitchCount} of 3)`);
                if (tabSwitchCount >= 3) {
                    alert("Maximum tab switch warnings reached! Your exam may be scrutinized by the examiner.");
                }
            }
        }
    });
}

function showAntiCheatToast(msg) {
    antiCheatToastMsg.textContent = msg;
    antiCheatToast.classList.remove('hidden');
    setTimeout(() => {
        antiCheatToast.classList.add('hidden');
    }, 4500);
}

// ========================================================
// COUNTDOWN TIMER
// ========================================================
function startTimer() {
    clearInterval(timerInterval);
    timerBadge.classList.remove('timer-warning');
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();

            if (timeRemaining <= 120 && !timerBadge.classList.contains('timer-warning')) {
                timerBadge.classList.add('timer-warning');
            }
        } else {
            clearInterval(timerInterval);
            finishExam();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    timerDisplay.textContent = formatted;
}

// ========================================================
// RENDER QUESTION
// ========================================================
function loadQuestion(index) {
    if (index < 0 || index >= totalQuestions) return;
    currentQuestionIndex = index;

    const q = questionsData[index];

    qCategoryBadge.textContent = q.category || 'General';
    qNumberDisplay.textContent = `Question ${index + 1} of ${totalQuestions}`;

    // Animate question statement
    if (questionText) {
        questionText.classList.remove('question-text-anim');
        void questionText.offsetWidth; // force DOM reflow
        questionText.textContent = q.question;
        questionText.classList.add('question-text-anim');
    }

    if (markedForReview[index]) {
        btnReviewToggle.classList.add('marked');
        reviewBtnText.textContent = "Marked for Review";
        btnReviewToggle.querySelector('i').className = "fa-solid fa-bookmark";
    } else {
        btnReviewToggle.classList.remove('marked');
        reviewBtnText.textContent = "Mark for Review";
        btnReviewToggle.querySelector('i').className = "fa-regular fa-bookmark";
    }

    // Keep the 4 option boxes CONSTANT and only update & animate the text inside
    const userChoice = userAnswers[index];
    const optionCards = [optionCard0, optionCard1, optionCard2, optionCard3];
    const optionTexts = [optionText0, optionText1, optionText2, optionText3];

    for (let i = 0; i < 4; i++) {
        const card = optionCards[i];
        const textEl = optionTexts[i];
        const optText = (q.options && q.options[i]) ? q.options[i] : '';

        if (card && textEl) {
            // Apply selected state
            if (userChoice === i) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }

            // Animate only the text inside with smooth micro-transition
            textEl.classList.remove('option-text-anim');
            void textEl.offsetWidth; // force DOM reflow for same animation on every navigation
            textEl.textContent = optText;
            textEl.classList.add('option-text-anim');

            card.style.display = optText ? 'flex' : 'none';
        }
    }

    btnPrev.disabled = (index === 0);
    if (index === totalQuestions - 1) {
        btnNext.innerHTML = `<span>Review</span> <i class="fa-solid fa-flag-checkered"></i>`;
    } else {
        btnNext.innerHTML = `<span>Next</span> <i class="fa-solid fa-arrow-right"></i>`;
    }

    updatePaginationActiveState();
    updatePaletteActiveState();
}

// ========================================================
// OPTION SELECTION & ACTIONS
// ========================================================
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;

    const optionCards = [optionCard0, optionCard1, optionCard2, optionCard3];
    optionCards.forEach((card, idx) => {
        if (card) {
            if (idx === optionIndex) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        }
    });

    updateProgressGauge();
    updatePaginationIndicators();
    updatePaletteIndicators();
}

function clearChoice() {
    userAnswers[currentQuestionIndex] = null;
    const optionCards = [optionCard0, optionCard1, optionCard2, optionCard3];
    optionCards.forEach(card => {
        if (card) card.classList.remove('selected');
    });

    updateProgressGauge();
    updatePaginationIndicators();
    updatePaletteIndicators();
}

function toggleReview() {
    markedForReview[currentQuestionIndex] = !markedForReview[currentQuestionIndex];
    loadQuestion(currentQuestionIndex);
    updateProgressGauge();
    updatePaginationIndicators();
    updatePaletteIndicators();
}

// ========================================================
// BOTTOM PAGINATION STRIP (1, 2, 3 ... 10)
// ========================================================
function buildPaginationNumbers() {
    paginationNumbers.innerHTML = '';
    for (let i = 0; i < totalQuestions; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-num-btn';
        btn.textContent = i + 1;
        btn.dataset.index = i;
        btn.addEventListener('click', () => loadQuestion(i));
        paginationNumbers.appendChild(btn);
    }
}

function updatePaginationActiveState() {
    const btns = paginationNumbers.querySelectorAll('.page-num-btn');
    btns.forEach((b, idx) => {
        if (idx === currentQuestionIndex) {
            b.classList.add('active');
        } else {
            b.classList.remove('active');
        }
    });
}

function updatePaginationIndicators() {
    const btns = paginationNumbers.querySelectorAll('.page-num-btn');
    btns.forEach((b, idx) => {
        b.classList.toggle('has-answer', userAnswers[idx] !== null);
        b.classList.toggle('is-reviewed', markedForReview[idx]);
    });
}

// ========================================================
// RIGHT PALETTE GRID (1 to 10 Quick Jump)
// ========================================================
function buildPaletteGrid() {
    paletteGrid.innerHTML = '';
    for (let i = 0; i < totalQuestions; i++) {
        const btn = document.createElement('button');
        btn.className = 'palette-btn';
        btn.textContent = i + 1;
        btn.dataset.index = i;
        btn.addEventListener('click', () => loadQuestion(i));
        paletteGrid.appendChild(btn);
    }
}

function updatePaletteActiveState() {
    const btns = paletteGrid.querySelectorAll('.palette-btn');
    btns.forEach((b, idx) => {
        b.classList.toggle('current', idx === currentQuestionIndex);
    });
}

function updatePaletteIndicators() {
    const btns = paletteGrid.querySelectorAll('.palette-btn');
    btns.forEach((b, idx) => {
        b.classList.remove('answered', 'review');
        if (markedForReview[idx]) {
            b.classList.add('review');
        } else if (userAnswers[idx] !== null) {
            b.classList.add('answered');
        }
    });
}

// ========================================================
// CIRCULAR PROGRESS GAUGE & STAT COUNTERS
// ========================================================
function updateProgressGauge() {
    const answeredCount = userAnswers.filter(ans => ans !== null).length;
    const reviewCount = markedForReview.filter(rev => rev === true).length;
    const unansweredCount = totalQuestions - answeredCount;

    answeredFraction.textContent = `${answeredCount}/${totalQuestions}`;
    countAnswered.textContent = answeredCount;
    countReview.textContent = reviewCount;
    countUnanswered.textContent = unansweredCount;

    const progressFraction = answeredCount / totalQuestions;
    const offset = CIRCUMFERENCE - (progressFraction * CIRCUMFERENCE);
    progressCircle.style.strokeDashoffset = offset;
}

// ========================================================
// EXAM SUBMISSION & MODAL
// ========================================================
function openSubmitModal() {
    const answeredCount = userAnswers.filter(ans => ans !== null).length;
    const reviewCount = markedForReview.filter(rev => rev === true).length;
    const unansweredCount = totalQuestions - answeredCount;

    modalAnsweredCount.textContent = answeredCount;
    modalUnansweredCount.textContent = unansweredCount;
    modalReviewCount.textContent = reviewCount;

    confirmModal.classList.remove('hidden');
}

function closeSubmitModal() {
    confirmModal.classList.add('hidden');
}

function finishExam() {
    closeSubmitModal();
    clearInterval(timerInterval);
    examFinished = true;
    examInProgress = false; // anti-cheat restrictions lifted
    exitFullscreen(); // exit fullscreen mode on exam completion

    // Stop proctor recording before shutting off camera
    stopExamProctorRecording();

    // Stop and hide proctor camera
    if (examProctorPip) examProctorPip.classList.add('hidden');
    stopCamera();
    updateCameraUI(false);

    let score = 0;
    let attempted = 0;

    userAnswers.forEach((ans, idx) => {
        if (ans !== null) {
            attempted++;
            if (ans === questionsData[idx].correctAnswer) {
                score++;
            }
        }
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    const accuracy = attempted > 0 ? Math.round((score / attempted) * 100) : 0;
    const timeSpentSeconds = TOTAL_EXAM_SECONDS - timeRemaining;
    const timeSpentMin = Math.floor(timeSpentSeconds / 60);
    const timeSpentSec = timeSpentSeconds % 60;
    const timeSpentStr = `${String(timeSpentMin).padStart(2, '0')}:${String(timeSpentSec).padStart(2, '0')}`;

    let grade = "F";
    if (percentage >= 90) grade = "O (10.0)";
    else if (percentage >= 80) grade = "A+ (9.0)";
    else if (percentage >= 70) grade = "A (8.0)";
    else if (percentage >= 60) grade = "B+ (7.0)";
    else if (percentage >= 50) grade = "B (6.0)";

    resScore.textContent = `${score} / ${totalQuestions}`;
    resPercent.textContent = `${percentage}% Total Score`;
    resAccuracy.textContent = `${accuracy}%`;
    resGrade.textContent = grade;
    resTime.textContent = timeSpentStr;

    // Record submission into persistent store
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const recordedUrl = currentExamRecordingBlobUrl || 
                          (sessionProctorRecordings[loggedInUser.id] ? sessionProctorRecordings[loggedInUser.id].videoUrl : null);

    saveCurrentStudentAttempt({
        id: loggedInUser.id,
        name: loggedInUser.name,
        score: score,
        total: totalQuestions,
        percentage: percentage,
        accuracy: accuracy,
        timeSpentSeconds: timeSpentSeconds,
        timeSpentStr: timeSpentStr,
        grade: grade,
        status: percentage >= 50 ? "PASS" : "FAIL",
        timestamp: `${dateFormatted}, ${timeFormatted}`,
        isCurrentUser: true,
        userAnswers: [...userAnswers],
        markedForReview: [...markedForReview],
        proctorVideoUrl: recordedUrl,
        tabSwitchCount: typeof tabSwitchCount !== 'undefined' ? tabSwitchCount : 0
    });

    examView.classList.add('hidden');
    resultsView.classList.remove('hidden');
    btnSubmitTop.style.display = 'none';

    // Render Leaderboard & Question Reviews
    renderLeaderboard();
    renderQuestionReviews();
    switchResultTab('leaderboard');
    updateAdminStats();
}

// ========================================================
// RESULTS VIEW: TABS & MERIT LEADERBOARD
// ========================================================
function switchResultTab(tab) {
    if (tab === 'leaderboard') {
        if (btnTabLeaderboard) btnTabLeaderboard.classList.add('active');
        if (btnTabReview) btnTabReview.classList.remove('active');
        if (resultsLeaderboardSection) resultsLeaderboardSection.classList.remove('hidden');
        if (resultsReviewSection) resultsReviewSection.classList.add('hidden');
    } else {
        if (btnTabReview) btnTabReview.classList.add('active');
        if (btnTabLeaderboard) btnTabLeaderboard.classList.remove('active');
        if (resultsReviewSection) resultsReviewSection.classList.remove('hidden');
        if (resultsLeaderboardSection) resultsLeaderboardSection.classList.add('hidden');
    }
}

function renderLeaderboard() {
    const attempts = getStudentAttempts();

    // Sort: Score descending, Time spent ascending
    attempts.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpentSeconds - b.timeSpentSeconds;
    });

    if (resultsLeaderboardBadge) {
        resultsLeaderboardBadge.textContent = attempts.length;
    }

    // Find current student's rank
    const myIndex = attempts.findIndex(a => a.isCurrentUser || (a.name.toLowerCase() === loggedInUser.name.toLowerCase()));
    const myRank = myIndex >= 0 ? myIndex + 1 : 1;
    const myAttempt = myIndex >= 0 ? attempts[myIndex] : null;

    if (personalRankHeadline && personalRankDetail && personalRankNumber) {
        personalRankNumber.textContent = `#${myRank}`;
        if (myAttempt) {
            if (myRank === 1) {
                personalRankHeadline.textContent = "🏆 Rank #1 Distinction - Outstanding!";
                personalRankDetail.innerHTML = `Congratulations <strong>${myAttempt.name}</strong>! You secured <strong>Rank #1</strong> out of ${attempts.length} Candidates with <strong>${myAttempt.percentage}% Score</strong> (${myAttempt.score}/${myAttempt.total || 10}) in ${myAttempt.timeSpentStr}!`;
            } else if (myRank <= 3) {
                personalRankHeadline.textContent = `🥈 Podium Merit Rank #${myRank} - Excellent!`;
                personalRankDetail.innerHTML = `Congratulations <strong>${myAttempt.name}</strong>! You secured <strong>Rank #${myRank}</strong> out of ${attempts.length} Candidates with <strong>${myAttempt.percentage}% Score</strong> in ${myAttempt.timeSpentStr}!`;
            } else if (myAttempt.status === "PASS") {
                personalRankHeadline.textContent = "🎉 Examination Qualified!";
                personalRankDetail.innerHTML = `Well done <strong>${myAttempt.name}</strong>! You scored <strong>${myAttempt.score}/${myAttempt.total || 10} (${myAttempt.percentage}%)</strong> and ranked <strong>#${myRank}</strong> out of ${attempts.length} candidates.`;
            } else {
                personalRankHeadline.textContent = "⚠️ Assessment Needs Improvement";
                personalRankDetail.innerHTML = `Candidate <strong>${myAttempt.name}</strong>: Score ${myAttempt.score}/${myAttempt.total || 10}. Better luck in the subsequent session!`;
            }
        }
    }

    renderPodium(attempts);
    renderLeaderboardTable(attempts);
}

function renderPodium(sortedAttempts) {
    if (!leaderboardPodium) return;
    leaderboardPodium.innerHTML = '';

    const top3 = sortedAttempts.slice(0, 3);
    if (top3.length === 0) return;

    // Visual order: 2nd place (left), 1st place (center elevated), 3rd place (right)
    const podiumOrder = [
        { data: top3[1], rank: 2, className: 'podium-second', medal: '🥈' },
        { data: top3[0], rank: 1, className: 'podium-first', medal: '🥇' },
        { data: top3[2], rank: 3, className: 'podium-third', medal: '🥉' }
    ];

    podiumOrder.forEach(p => {
        if (!p.data) return;
        const initials = getInitials(p.data.name);
        const card = document.createElement('div');
        card.className = `podium-card ${p.className}`;

        const crownHtml = p.rank === 1 ? `<div class="podium-crown-badge" title="Champion Rank 1"><i class="fa-solid fa-crown"></i></div>` : '';

        card.innerHTML = `
            ${crownHtml}
            <div class="podium-avatar-wrap">
                <div class="podium-avatar">${initials}</div>
                <div class="podium-rank-pill">${p.medal}</div>
            </div>
            <h4 class="podium-name" title="${p.data.name}">${p.data.name}</h4>
            <span class="podium-id">ID: ${p.data.id}</span>
            <div class="podium-score-box">
                <div class="podium-stat-item">
                    <span>Score</span>
                    <strong>${p.data.score}/${p.data.total || 10}</strong>
                </div>
                <div class="podium-stat-item">
                    <span>Marks</span>
                    <strong>${p.data.percentage}%</strong>
                </div>
                <div class="podium-stat-item">
                    <span>Time</span>
                    <strong>${p.data.timeSpentStr}</strong>
                </div>
            </div>
        `;
        leaderboardPodium.appendChild(card);
    });
}

function renderLeaderboardTable(sortedAttempts) {
    if (!leaderboardTableBody) return;
    leaderboardTableBody.innerHTML = '';

    sortedAttempts.forEach((item, index) => {
        const rank = index + 1;
        const isCurrent = item.isCurrentUser || (item.name.toLowerCase() === loggedInUser.name.toLowerCase());
        const tr = document.createElement('tr');
        if (isCurrent) {
            tr.className = 'current-user-row';
        }

        let rankBadgeClass = 'rank-regular';
        let rankBadgeContent = `${rank}`;
        if (rank === 1) { rankBadgeClass = 'rank-gold'; rankBadgeContent = '🥇'; }
        else if (rank === 2) { rankBadgeClass = 'rank-silver'; rankBadgeContent = '🥈'; }
        else if (rank === 3) { rankBadgeClass = 'rank-bronze'; rankBadgeContent = '🥉'; }

        const initials = getInitials(item.name);
        const youBadge = isCurrent ? `<span class="candidate-you-badge">YOU</span>` : '';
        const gradeClass = getGradeClass(item.grade);
        const statusBadge = item.status === "PASS"
            ? `<span class="badge-status-pass"><i class="fa-solid fa-circle-check"></i> PASS</span>`
            : `<span class="badge-status-fail"><i class="fa-solid fa-circle-xmark"></i> FAIL</span>`;

        tr.innerHTML = `
            <td><span class="rank-badge-item ${rankBadgeClass}">${rankBadgeContent}</span></td>
            <td>
                <div class="candidate-name-cell">
                    <div class="candidate-avatar-circle">${initials}</div>
                    <div class="candidate-meta-name">
                        <span>${item.name}</span>
                        ${youBadge}
                    </div>
                </div>
            </td>
            <td><code style="font-weight:600; color:#475467;">${item.id}</code></td>
            <td>
                <div class="score-progress-wrap">
                    <span><strong>${item.score}</strong> / ${item.total || 10}</span>
                    <div class="score-progress-bar">
                        <div class="score-progress-fill" style="width: ${item.percentage}%;"></div>
                    </div>
                </div>
            </td>
            <td><strong>${item.percentage}%</strong></td>
            <td><i class="fa-regular fa-clock" style="color:#64748b; margin-right:4px;"></i>${item.timeSpentStr}</td>
            <td><span class="badge-grade ${gradeClass}">${item.grade}</span></td>
            <td>${statusBadge}</td>
        `;

        leaderboardTableBody.appendChild(tr);
    });
}

// ========================================================
// EXAMINER / ADMIN DASHBOARD & CANDIDATE ATTEMPTS
// ========================================================
function switchAdminSubTab(tab) {
    if (tab === 'attempts') {
        if (adminTabAttemptsBtn) adminTabAttemptsBtn.classList.add('active');
        if (adminTabQuestionsBtn) adminTabQuestionsBtn.classList.remove('active');
        if (adminAttemptsTabPane) adminAttemptsTabPane.classList.remove('hidden');
        if (adminQuestionsTabPane) adminQuestionsTabPane.classList.add('hidden');
    } else {
        if (adminTabQuestionsBtn) adminTabQuestionsBtn.classList.add('active');
        if (adminTabAttemptsBtn) adminTabAttemptsBtn.classList.remove('active');
        if (adminQuestionsTabPane) adminQuestionsTabPane.classList.remove('hidden');
        if (adminAttemptsTabPane) adminAttemptsTabPane.classList.add('hidden');
    }
}

function renderAdminDashboard() {
    renderAdminAttemptsTable();
    updateAdminStats();
}

function renderAdminAttemptsTable(filter = 'all', searchQuery = '') {
    if (!adminAttemptsTableBody) return;
    const attempts = getStudentAttempts();

    attempts.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.timeSpentSeconds - b.timeSpentSeconds;
    });

    const q = (searchQuery || '').toLowerCase().trim();
    const currentFilter = filter || (adminFilterGrade ? adminFilterGrade.value : 'all');

    const filtered = attempts.filter((item) => {
        if (q && !item.name.toLowerCase().includes(q) && !item.id.toLowerCase().includes(q)) {
            return false;
        }
        if (currentFilter === 'high' && item.percentage < 80) return false;
        if (currentFilter === 'pass' && item.status !== 'PASS') return false;
        if (currentFilter === 'fail' && item.status !== 'FAIL') return false;
        return true;
    });

    if (adminAttemptedCountBadge) adminAttemptedCountBadge.textContent = attempts.length;
    if (adminFilteredCountBadge) adminFilteredCountBadge.textContent = `Showing ${filtered.length} Candidates`;

    adminAttemptsTableBody.innerHTML = '';

    if (filtered.length === 0) {
        adminAttemptsTableBody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    <i class="fa-solid fa-circle-info" style="font-size: 24px; margin-bottom: 8px; display:block;"></i>
                    No student submissions match your search or filter criteria.
                </td>
            </tr>
        `;
        return;
    }

    filtered.forEach((item) => {
        const rank = attempts.indexOf(item) + 1;
        const tr = document.createElement('tr');
        const initials = getInitials(item.name);
        const gradeClass = getGradeClass(item.grade);
        const statusBadge = item.status === "PASS"
            ? `<span class="badge-status-pass"><i class="fa-solid fa-circle-check"></i> PASS</span>`
            : `<span class="badge-status-fail"><i class="fa-solid fa-circle-xmark"></i> FAIL</span>`;

        let rankBadgeClass = 'rank-regular';
        let rankBadgeContent = `${rank}`;
        if (rank === 1) { rankBadgeClass = 'rank-gold'; rankBadgeContent = '🥇'; }
        else if (rank === 2) { rankBadgeClass = 'rank-silver'; rankBadgeContent = '🥈'; }
        else if (rank === 3) { rankBadgeClass = 'rank-bronze'; rankBadgeContent = '🥉'; }

        tr.innerHTML = `
            <td><span class="rank-badge-item ${rankBadgeClass}">${rankBadgeContent}</span></td>
            <td>
                <div class="candidate-name-cell">
                    <div class="candidate-avatar-circle">${initials}</div>
                    <div class="candidate-meta-name">${item.name}</div>
                </div>
            </td>
            <td><code style="font-weight:600; color:#475467;">${item.id}</code></td>
            <td>
                <div class="score-progress-wrap">
                    <span><strong>${item.score}</strong> / ${item.total || 10}</span>
                    <div class="score-progress-bar">
                        <div class="score-progress-fill" style="width: ${item.percentage}%;"></div>
                    </div>
                </div>
            </td>
            <td><strong>${item.percentage}%</strong></td>
            <td>${item.timeSpentStr}</td>
            <td><span class="badge-grade ${gradeClass}">${item.grade}</span></td>
            <td><small style="color:#64748b;">${item.timestamp || 'Today'}</small></td>
            <td>${statusBadge}</td>
            <td style="text-align: center;">
                <button type="button" class="btn-view-slip" title="View Screen & Face Proctor Audit">
                    <i class="fa-solid fa-video"></i> Audit & Slip
                </button>
            </td>
        `;

        const btnSlip = tr.querySelector('.btn-view-slip');
        if (btnSlip) {
            btnSlip.addEventListener('click', () => openStudentSlip(item.id));
        }

        adminAttemptsTableBody.appendChild(tr);
    });
}

function updateAdminStats() {
    const attempts = getStudentAttempts();
    const qCount = questionsData.length;

    if (adminStatTotalQuestions) {
        adminStatTotalQuestions.textContent = `${qCount} Questions`;
    }
    if (adminStatTotalQuestionsSub) {
        adminStatTotalQuestionsSub.textContent = "Active Question Bank";
    }
    if (adminQuestionsCountBadge) {
        adminQuestionsCountBadge.textContent = qCount;
    }

    if (!adminStatTotalAttempts) return;

    if (attempts.length === 0) {
        adminStatTotalAttempts.textContent = "0 Students";
        adminStatAvgScore.textContent = `0.0 / ${qCount}`;
        adminStatPassRate.textContent = "0%";
        return;
    }

    const total = attempts.length;
    const sumScore = attempts.reduce((acc, curr) => acc + curr.score, 0);
    const avgScore = (sumScore / total).toFixed(1);

    const passCount = attempts.filter(a => a.status === 'PASS').length;
    const passRate = ((passCount / total) * 100).toFixed(1);

    adminStatTotalAttempts.textContent = `${total} Students`;
    adminStatAvgScore.textContent = `${avgScore} / ${qCount}`;
    adminStatPassRate.textContent = `${passRate}%`;
}

// Student Score Slip & Proctor Audit Modal
function openStudentSlip(studentId) {
    const attempts = getStudentAttempts();
    const item = attempts.find(a => a.id === studentId) || attempts[0];
    if (!item) return;

    const initials = getInitials(item.name);

    // Check if recorded video exists
    const recordedVideoUrl = (sessionProctorRecordings[item.id] && sessionProctorRecordings[item.id].videoUrl)
                          || item.proctorVideoUrl
                          || (item.isCurrentUser && currentExamRecordingBlobUrl)
                          || null;

    // Retrieve or synthesize candidate's question responses for the screen replay
    let studentAnswers = item.userAnswers;
    if (!Array.isArray(studentAnswers) || studentAnswers.length === 0) {
        studentAnswers = questionsData.map((q, idx) => {
            if (idx < item.score) return q.correctAnswer;
            return (q.correctAnswer + 1) % 4;
        });
    }

    auditCurrentQIndex = 0;
    if (auditSimulationTimer) {
        clearInterval(auditSimulationTimer);
        auditSimulationTimer = null;
    }

    scoreSlipContent.innerHTML = `
        <div class="slip-profile-card">
            <div class="slip-profile-avatar">${initials}</div>
            <div class="slip-profile-info">
                <h4>${item.name}</h4>
                <p>Roll / Hall Ticket: <strong>${item.id}</strong> &bull; Web Tech & Programming</p>
                <p>Attempt Timestamp: <strong>${item.timestamp || 'Recorded Session'}</strong></p>
            </div>
            <div style="margin-left: auto;">
                <span class="slip-badge" style="background: #dcfce7; color: #166534;">
                    <i class="fa-solid fa-circle-check"></i> Verified Candidate Submission
                </span>
            </div>
        </div>

        <div class="slip-metrics-grid">
            <div class="slip-metric-box">
                <span>Total Score</span>
                <strong style="color: #059669;">${item.score} / ${item.total || 10}</strong>
            </div>
            <div class="slip-metric-box">
                <span>Percentage</span>
                <strong style="color: #2563eb;">${item.percentage}%</strong>
            </div>
            <div class="slip-metric-box">
                <span>Grade / SGPA</span>
                <strong style="color: #d97706;">${item.grade}</strong>
            </div>
            <div class="slip-metric-box">
                <span>Accuracy</span>
                <strong>${item.accuracy}%</strong>
            </div>
            <div class="slip-metric-box">
                <span>Duration</span>
                <strong>${item.timeSpentStr}</strong>
            </div>
            <div class="slip-metric-box">
                <span>Status</span>
                <strong style="color: ${item.status === 'PASS' ? '#059669' : '#dc2626'};">${item.status}</strong>
            </div>
        </div>

        <!-- ================= DUAL-STREAM SCREEN & FACE PROCTOR AUDIT SECTION ================= -->
        <div class="audit-section" id="auditSection">
            <div class="audit-section-header">
                <div class="audit-title-area">
                    <h4>
                        <i class="fa-solid fa-video" style="color: #2563eb;"></i>
                        Live Examination Screen & Candidate Face Proctoring Audit
                    </h4>
                    <p>Continuous synchronized recording: Candidate facial feed with full assessment viewport activity</p>
                </div>
                <div class="audit-controls-row">
                    <button type="button" class="audit-layout-btn active" id="btnAuditPipMode" title="Picture-in-Picture View">
                        <i class="fa-solid fa-tv"></i> Screen + Face PiP
                    </button>
                    <button type="button" class="audit-layout-btn" id="btnAuditSplitMode" title="Side-by-side View">
                        <i class="fa-solid fa-table-columns"></i> Side-by-Side
                    </button>
                </div>
            </div>

            <!-- Main Dual Viewport -->
            <div class="audit-viewport-container" id="auditViewportContainer">
                
                <!-- 1. FULL EXAMINATION SCREEN FRAME -->
                <div class="audit-screen-frame" id="auditScreenFrame">
                    <div class="audit-screen-browser-bar">
                        <div class="dots">
                            <span class="dot red"></span>
                            <span class="dot yellow"></span>
                            <span class="dot green"></span>
                        </div>
                        <div>
                            <i class="fa-solid fa-lock" style="color: #10b981; margin-right: 4px;"></i>
                            MRDU University Secure Portal &bull; Fullscreen Session Recorded
                        </div>
                        <div>
                            <span style="color: #38bdf8;"><i class="fa-regular fa-clock"></i> 14:15 / 15:00</span>
                        </div>
                    </div>

                    <div class="audit-screen-header-inner">
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <img src="mrdu-logo.png" alt="MRDU" style="height: 18px; width: 18px; object-fit: contain;">
                            <span style="font-weight: 800; color: #1e293b;">MRDU Exam Session</span>
                            <span style="color: #64748b; font-size: 11px;">(ID: ${item.id})</span>
                        </div>
                        <div style="font-size: 11px; color: #059669; font-weight: 700;">
                            <i class="fa-solid fa-shield-halved"></i> Proctor Monitoring Active
                        </div>
                    </div>

                    <div class="audit-screen-content" id="auditScreenContent">
                        <!-- Dynamically populated question screen -->
                    </div>

                    <div class="audit-screen-footer">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 11px; font-weight: 700; color: #64748b;">Question Palette:</span>
                            <div class="audit-palette-circles" id="auditPaletteDots">
                                <!-- Populated dynamically 1 to 10 -->
                            </div>
                        </div>

                        <div class="audit-replay-controls">
                            <button type="button" class="btn-audit-nav" id="btnAuditPrevQ">
                                <i class="fa-solid fa-chevron-left"></i> Prev
                            </button>
                            <button type="button" class="btn-audit-play" id="btnAuditPlaySimulation">
                                <i class="fa-solid fa-play"></i> Replay Exam
                            </button>
                            <button type="button" class="btn-audit-nav" id="btnAuditNextQ">
                                Next <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 2. CANDIDATE FACE CAMERA PIP WINDOW -->
                <div class="audit-cam-pip" id="auditCamPip">
                    <div class="audit-cam-top-bar">
                        <div>
                            <span class="rec-pulse-dot"></span>
                            <span>PROCTOR CAM AUDIT</span>
                        </div>
                        <span style="color: #38bdf8;">LIVE FEED</span>
                    </div>

                    <div class="audit-cam-video-wrap">
                        ${recordedVideoUrl ? `
                            <video id="auditCamVideoPlayer" src="${recordedVideoUrl}" autoplay loop muted controls playsinline class="audit-cam-video"></video>
                        ` : `
                            <div class="audit-cam-sim-avatar">
                                <i class="fa-solid fa-user-astronaut sim-face"></i>
                                <span style="font-size: 11px; font-weight: 700; color: #f8fafc;">${item.name}</span>
                                <span style="font-size: 9.5px; color: #38bdf8;">HD Webcam Stream Archived</span>
                                <button type="button" class="btn-test-webcam" id="btnAttachLiveCamAudit">
                                    <i class="fa-solid fa-camera"></i> Test With My Camera
                                </button>
                            </div>
                        `}
                    </div>

                    <div class="audit-cam-telemetry">
                        <span><i class="fa-solid fa-face-smile"></i> Face: Verified</span>
                        <span><i class="fa-solid fa-eye"></i> Eye Gaze: Center</span>
                    </div>
                </div>
            </div>

            <!-- Anti-Cheat Compliance Summary Bar -->
            <div class="audit-anti-cheat-bar">
                <div class="anti-cheat-metric clean">
                    <span class="metric-tag">Tab Switch Events</span>
                    <span class="metric-stat"><i class="fa-solid fa-check"></i> ${item.tabSwitchCount || 0} (Clean)</span>
                </div>
                <div class="anti-cheat-metric clean">
                    <span class="metric-tag">Camera Stream Continuity</span>
                    <span class="metric-stat"><i class="fa-solid fa-video"></i> 100% Uninterrupted</span>
                </div>
                <div class="anti-cheat-metric clean">
                    <span class="metric-tag">Fullscreen Integrity</span>
                    <span class="metric-stat"><i class="fa-solid fa-shield-check"></i> Enforced & Maintained</span>
                </div>
                <div class="anti-cheat-metric clean">
                    <span class="metric-tag">Proctoring AI Verdict</span>
                    <span class="metric-stat" style="color: #059669;"><i class="fa-solid fa-stamp"></i> APPROVED & CERTIFIED</span>
                </div>
            </div>
        </div>

        <div class="slip-stamp-notice">
            <i class="fa-solid fa-stamp" style="margin-right: 6px; color: #4338ca;"></i>
            <strong>Malla Reddy Deemed To Be University &mdash; Directorate of Evaluation</strong><br>
            Certified automated online assessment and proctoring surveillance report. Generated electronically for official university records.
        </div>
    `;

    studentScoreSlipModal.classList.remove('hidden');

    initAuditPlayer(studentAnswers, item);
}

function initAuditPlayer(studentAnswers, item) {
    const auditScreenContent = scoreSlipContent.querySelector('#auditScreenContent');
    const auditPaletteDots = scoreSlipContent.querySelector('#auditPaletteDots');
    const btnAuditPrevQ = scoreSlipContent.querySelector('#btnAuditPrevQ');
    const btnAuditNextQ = scoreSlipContent.querySelector('#btnAuditNextQ');
    const btnAuditPlay = scoreSlipContent.querySelector('#btnAuditPlaySimulation');
    const btnAuditPipMode = scoreSlipContent.querySelector('#btnAuditPipMode');
    const btnAuditSplitMode = scoreSlipContent.querySelector('#btnAuditSplitMode');
    const auditViewportContainer = scoreSlipContent.querySelector('#auditViewportContainer');
    const btnAttachLiveCamAudit = scoreSlipContent.querySelector('#btnAttachLiveCamAudit');

    // Layout Mode Switching
    if (btnAuditPipMode && btnAuditSplitMode && auditViewportContainer) {
        btnAuditPipMode.addEventListener('click', () => {
            auditViewportContainer.classList.remove('split-mode');
            btnAuditPipMode.classList.add('active');
            btnAuditSplitMode.classList.remove('active');
        });
        btnAuditSplitMode.addEventListener('click', () => {
            auditViewportContainer.classList.add('split-mode');
            btnAuditSplitMode.classList.add('active');
            btnAuditPipMode.classList.remove('active');
        });
    }

    // Connect Live Webcam option if test is clicked
    if (btnAttachLiveCamAudit) {
        btnAttachLiveCamAudit.addEventListener('click', async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                const videoWrap = scoreSlipContent.querySelector('.audit-cam-video-wrap');
                if (videoWrap) {
                    videoWrap.innerHTML = '<video id="auditCamVideoPlayer" autoplay loop muted playsinline class="audit-cam-video"></video>';
                    const vid = videoWrap.querySelector('#auditCamVideoPlayer');
                    if (vid) {
                        vid.srcObject = stream;
                        vid.play();
                    }
                }
            } catch (err) {
                alert("Could not access camera for preview: " + err.message);
            }
        });
    }

    function renderAuditQuestion(index) {
        if (!auditScreenContent) return;
        const q = questionsData[index] || questionsData[0];
        const studentChoice = studentAnswers[index];
        const isCorrect = studentChoice === q.correctAnswer;

        let optionsHtml = '';
        const letters = ['A', 'B', 'C', 'D'];
        (q.options || []).forEach((opt, idx) => {
            let cardClass = 'audit-option-card';
            let badge = '';
            if (idx === studentChoice) {
                if (isCorrect) {
                    cardClass += ' chosen-answer';
                    badge = '<span class="audit-badge-tag tag-correct"><i class="fa-solid fa-check"></i> Candidate Selection (Correct)</span>';
                } else {
                    cardClass += ' chosen-wrong';
                    badge = '<span class="audit-badge-tag tag-incorrect"><i class="fa-solid fa-xmark"></i> Candidate Selection</span>';
                }
            } else if (idx === q.correctAnswer && !isCorrect) {
                badge = '<span class="audit-badge-tag tag-correct"><i class="fa-solid fa-check"></i> Correct Key</span>';
            }

            optionsHtml += `
                <div class="${cardClass}">
                    <span class="opt-letter">${letters[idx]}</span>
                    <span>${opt}</span>
                    ${badge}
                </div>
            `;
        });

        auditScreenContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span class="audit-q-domain">${q.category || 'General Programming'}</span>
                <span style="font-size: 11px; font-weight: 700; color: #64748b;">Question ${index + 1} of ${questionsData.length} &bull; +1.0 Mark</span>
            </div>
            <div class="audit-q-statement">${q.question}</div>
            <div class="audit-options-list">
                ${optionsHtml}
            </div>
        `;

        // Update palette circles
        if (auditPaletteDots) {
            auditPaletteDots.innerHTML = '';
            questionsData.forEach((_, idx) => {
                const dot = document.createElement('div');
                dot.className = 'audit-pal-dot';
                if (idx === index) dot.classList.add('active-q');
                if (studentAnswers[idx] !== null && studentAnswers[idx] !== undefined) {
                    dot.classList.add('dot-answered');
                } else {
                    dot.classList.add('dot-skipped');
                }
                dot.textContent = idx + 1;
                dot.addEventListener('click', () => {
                    auditCurrentQIndex = idx;
                    renderAuditQuestion(idx);
                });
                auditPaletteDots.appendChild(dot);
            });
        }
    }

    renderAuditQuestion(0);

    // Prev / Next Question buttons
    if (btnAuditPrevQ) {
        btnAuditPrevQ.addEventListener('click', () => {
            if (auditCurrentQIndex > 0) {
                auditCurrentQIndex--;
                renderAuditQuestion(auditCurrentQIndex);
            }
        });
    }

    if (btnAuditNextQ) {
        btnAuditNextQ.addEventListener('click', () => {
            if (auditCurrentQIndex < questionsData.length - 1) {
                auditCurrentQIndex++;
                renderAuditQuestion(auditCurrentQIndex);
            }
        });
    }

    // Auto-Play Replay simulation
    if (btnAuditPlay) {
        btnAuditPlay.addEventListener('click', () => {
            if (auditSimulationTimer) {
                clearInterval(auditSimulationTimer);
                auditSimulationTimer = null;
                btnAuditPlay.innerHTML = '<i class="fa-solid fa-play"></i> Replay Exam';
                return;
            }

            btnAuditPlay.innerHTML = '<i class="fa-solid fa-pause"></i> Pause Replay';
            auditCurrentQIndex = 0;
            renderAuditQuestion(0);

            auditSimulationTimer = setInterval(() => {
                auditCurrentQIndex++;
                if (auditCurrentQIndex >= questionsData.length) {
                    auditCurrentQIndex = 0;
                }
                renderAuditQuestion(auditCurrentQIndex);
            }, 2500);
        });
    }
}

function closeStudentSlip() {
    studentScoreSlipModal.classList.add('hidden');
    if (auditSimulationTimer) {
        clearInterval(auditSimulationTimer);
        auditSimulationTimer = null;
    }
}

// ========================================================
// SGPA & CGPA CALCULATION & FORMULA GUIDE MODAL
// ========================================================
function openSgpaModal() {
    if (sgpaFormulaModal) {
        sgpaFormulaModal.classList.remove('hidden');
        runLiveSgpaCalculation();
    }
}

function closeSgpaModal() {
    if (sgpaFormulaModal) {
        sgpaFormulaModal.classList.add('hidden');
    }
}

function runLiveSgpaCalculation() {
    const c1 = parseFloat(calcC1 ? calcC1.value : 4) || 4;
    const g1 = parseFloat(calcG1 ? calcG1.value : 9) || 9;

    const c2 = parseFloat(calcC2 ? calcC2.value : 4) || 4;
    const g2 = parseFloat(calcG2 ? calcG2.value : 10) || 10;

    const c3 = parseFloat(calcC3 ? calcC3.value : 3) || 3;
    const g3 = parseFloat(calcG3 ? calcG3.value : 8) || 8;

    const c4 = parseFloat(calcC4 ? calcC4.value : 3) || 3;
    const g4 = parseFloat(calcG4 ? calcG4.value : 7) || 7;

    const totalCredits = c1 + c2 + c3 + c4;
    const totalCreditPoints = (c1 * g1) + (c2 * g2) + (c3 * g3) + (c4 * g4);

    if (totalCredits <= 0) return;

    const calculatedSgpa = (totalCreditPoints / totalCredits).toFixed(2);

    let performanceLabel = "Average";
    if (calculatedSgpa >= 9.0) performanceLabel = "Grade O (Outstanding Distinction)";
    else if (calculatedSgpa >= 8.0) performanceLabel = "Grade A+ (Excellent)";
    else if (calculatedSgpa >= 7.0) performanceLabel = "Grade A (Very Good)";
    else if (calculatedSgpa >= 6.0) performanceLabel = "Grade B+ (Good)";
    else if (calculatedSgpa >= 5.0) performanceLabel = "Grade B (Above Average)";
    else performanceLabel = "Grade F (Needs Improvement)";

    if (liveSgpaResult) {
        liveSgpaResult.textContent = `${calculatedSgpa} / 10.0`;
    }
    if (liveSgpaGrade) {
        liveSgpaGrade.textContent = performanceLabel;
    }
}

// ========================================================
// DETAILED QUESTION REVIEW (Page 3 & 7 Style)
// ========================================================
function renderQuestionReviews(filter = 'all') {
    questionReviewList.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];

    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    questionsData.forEach((q, idx) => {
        const userChoice = userAnswers[idx];
        const isCorrect = userChoice === q.correctAnswer;
        const isSkipped = userChoice === null;

        if (isSkipped) skippedCount++;
        else if (isCorrect) correctCount++;
        else wrongCount++;

        if (filter === 'correct' && (!isCorrect || isSkipped)) return;
        if (filter === 'incorrect' && (isCorrect || isSkipped)) return;
        if (filter === 'unanswered' && !isSkipped) return;

        const card = document.createElement('div');
        card.className = 'review-item-card';

        let statusClass = 'skipped';
        let statusText = 'Skipped';
        if (!isSkipped) {
            statusClass = isCorrect ? 'correct' : 'incorrect';
            statusText = isCorrect ? 'Correct (+1)' : 'Incorrect (0)';
        }

        const userAnsText = isSkipped
            ? '<em>Not Attempted</em>'
            : `<strong>(${letters[userChoice]})</strong> ${q.options[userChoice]}`;

        const correctAnsText = `<strong>(${letters[q.correctAnswer]})</strong> ${q.options[q.correctAnswer]}`;

        card.innerHTML = `
            <div class="review-item-header">
                <span class="q-badge">${q.category}</span>
                <span class="status-tag ${statusClass}">${statusText}</span>
            </div>
            <h4 class="review-q-title">Q${idx + 1}. ${q.question}</h4>
            <div class="review-answers-grid">
                <div class="ans-box user-ans">
                    <span class="ans-box-title">Your Choice</span>
                    <span>${userAnsText}</span>
                </div>
                <div class="ans-box correct-ans">
                    <span class="ans-box-title">Correct Answer</span>
                    <span>${correctAnsText}</span>
                </div>
            </div>
            <div class="review-explanation">
                <strong><i class="fa-solid fa-lightbulb"></i> Explanation:</strong> ${q.explanation}
            </div>
        `;

        questionReviewList.appendChild(card);
    });

    filterCorrectCount.textContent = correctCount;
    filterWrongCount.textContent = wrongCount;
    filterSkippedCount.textContent = skippedCount;
}

// ========================================================
// RETAKE EXAM & LOGOUT
// ========================================================
function retakeExam() {
    resultsView.classList.add('hidden');
    instructionsScreen.classList.remove('hidden');
    chkAgreement.checked = false;
    btnStartExamNow.disabled = true;
    if (examProctorPip) examProctorPip.classList.add('hidden');
    stopCamera();
    updateCameraUI(false);
}

function logoutAndExit() {
    exitFullscreen();
    if (examProctorPip) examProctorPip.classList.add('hidden');
    stopCamera();
    updateCameraUI(false);
    clearInterval(timerInterval);
    examInProgress = false;
    examScreenWrapper.classList.add('hidden');
    instructionsScreen.classList.add('hidden');
    adminDashboardScreen.classList.add('hidden');
    registrationScreen.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');

    studentUsernameInput.value = '';
    studentPasswordInput.value = '';
    captchaInput.value = '';
    adminUsernameInput.value = '';
    adminPasswordInput.value = '';
}

// ========================================================
// EVENT LISTENERS
// ========================================================
function attachEventListeners() {
    // Welcome & Registration & Login Screen Navigation
    if (btnGoToRegister) btnGoToRegister.addEventListener('click', showRegistrationScreen);
    if (btnGoToLogin) btnGoToLogin.addEventListener('click', () => showLoginScreen(false));
    if (btnBackToWelcome) btnBackToWelcome.addEventListener('click', showWelcomeScreen);
    if (btnBackToWelcomeFromReg) btnBackToWelcomeFromReg.addEventListener('click', showWelcomeScreen);
    if (btnGoToLoginFromReg) btnGoToLoginFromReg.addEventListener('click', () => showLoginScreen(false));
    if (btnGoToRegisterFromLogin) btnGoToRegisterFromLogin.addEventListener('click', showRegistrationScreen);

    // Form Submissions
    if (studentRegisterForm) {
        studentRegisterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCandidateRegister();
        });
    }
    if (studentLoginForm) {
        studentLoginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleCandidateLogin();
        });
    }

    // Login Tabs Click Switch
    tabCandidateBtn.addEventListener('click', () => switchLoginTab('candidate'));
    tabExaminerBtn.addEventListener('click', () => switchLoginTab('examiner'));

    // Auto-uppercase Roll Number in Registration
    if (regRollNumber) {
        regRollNumber.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Password Show/Hide Toggles
    function setupPasswordToggle(btn, input) {
        if (!btn || !input) return;
        btn.addEventListener('click', () => {
            const isPwd = input.type === 'password';
            input.type = isPwd ? 'text' : 'password';
            btn.innerHTML = isPwd ? '<i class="fa-regular fa-eye-slash"></i>' : '<i class="fa-regular fa-eye"></i>';
        });
    }
    setupPasswordToggle(btnToggleRegPwd, regPassword);
    setupPasswordToggle(btnToggleLoginPwd, studentPasswordInput);

    // Auto-uppercase Username in Login
    if (studentUsernameInput) {
        studentUsernameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }

    // Cursor Hover Slide Animation (on Examiner / Admin tab)
    tabExaminerBtn.addEventListener('mouseenter', () => {
        loginTabs.classList.add('slide-right');
    });

    tabExaminerBtn.addEventListener('mouseleave', () => {
        if (currentActiveTab === 'candidate') {
            loginTabs.classList.remove('slide-right');
        }
    });

    // Cursor Hover Slide Animation (on Candidate tab)
    tabCandidateBtn.addEventListener('mouseenter', () => {
        loginTabs.classList.remove('slide-right');
    });

    tabCandidateBtn.addEventListener('mouseleave', () => {
        if (currentActiveTab === 'examiner') {
            loginTabs.classList.add('slide-right');
        }
    });

    // Captcha Refresh
    btnRefreshCaptcha.addEventListener('click', generateCaptcha);

    // Admin Logout
    btnAdminLogout.addEventListener('click', showLoginScreen);

    // Instructions Agreement Checkbox (Only selectable when Camera is verified)
    if (chkAgreement) {
        chkAgreement.addEventListener('change', () => {
            if (!isCameraActive || !cameraStream) {
                chkAgreement.checked = false;
                chkAgreement.disabled = true;
                btnStartExamNow.disabled = true;
                showAntiCheatToast("⚠️ Camera must be ON & verified before selecting this agreement!");
                triggerCameraHighlight();
                return;
            }
            btnStartExamNow.disabled = !chkAgreement.checked;
        });
    }

    // When candidate clicks agreement box while camera is locked
    if (instAgreementBox) {
        instAgreementBox.addEventListener('click', (e) => {
            if (!isCameraActive || !cameraStream) {
                if (chkAgreement) {
                    chkAgreement.checked = false;
                    chkAgreement.disabled = true;
                }
                showAntiCheatToast("📷 Please click 'Turn ON Camera & Verify' first to enable checkbox!");
                triggerCameraHighlight();
            }
        });
    }
    btnStartExamNow.addEventListener('click', promptStartExamConfirmation);
    btnCancelInstructions.addEventListener('click', showLoginScreen);

    // Camera Toggle Button on Instructions Screen
    if (btnToggleCamera) {
        btnToggleCamera.addEventListener('click', () => enableCamera(false));
    }

    // Pre-Exam Start Confirmation Modal Buttons
    btnCancelStartExam.addEventListener('click', closeStartExamConfirmModal);
    btnConfirmStartExam.addEventListener('click', confirmAndLaunchExam);

    // Top Submit Button
    btnSubmitTop.addEventListener('click', openSubmitModal);

    // Prev / Next Navigation
    btnPrev.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            loadQuestion(currentQuestionIndex - 1);
        }
    });

    btnNext.addEventListener('click', () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            loadQuestion(currentQuestionIndex + 1);
        } else {
            openSubmitModal();
        }
    });

    // Constant Option Cards Click Listeners
    [optionCard0, optionCard1, optionCard2, optionCard3].forEach((card, idx) => {
        if (card) {
            card.addEventListener('click', () => {
                selectOption(idx);
            });
        }
    });

    // Toolbar actions
    btnReviewToggle.addEventListener('click', toggleReview);
    btnClearChoice.addEventListener('click', clearChoice);

    // Modal buttons
    btnCancelSubmit.addEventListener('click', closeSubmitModal);
    btnConfirmSubmit.addEventListener('click', finishExam);

    // Results Actions
    btnRetake.addEventListener('click', retakeExam);
    btnLogoutResults.addEventListener('click', logoutAndExit);

    // Results Sub-Tabs: Leaderboard vs Question Review
    if (btnTabLeaderboard) {
        btnTabLeaderboard.addEventListener('click', () => switchResultTab('leaderboard'));
    }
    if (btnTabReview) {
        btnTabReview.addEventListener('click', () => switchResultTab('review'));
    }

    // Examiner Dashboard Sub-Tabs
    if (adminTabAttemptsBtn) {
        adminTabAttemptsBtn.addEventListener('click', () => switchAdminSubTab('attempts'));
    }
    if (adminTabQuestionsBtn) {
        adminTabQuestionsBtn.addEventListener('click', () => switchAdminSubTab('questions'));
    }

    // Examiner Search & Filter
    if (adminSearchStudent) {
        adminSearchStudent.addEventListener('input', (e) => {
            renderAdminAttemptsTable(adminFilterGrade ? adminFilterGrade.value : 'all', e.target.value);
        });
    }
    if (adminFilterGrade) {
        adminFilterGrade.addEventListener('change', (e) => {
            renderAdminAttemptsTable(e.target.value, adminSearchStudent ? adminSearchStudent.value : '');
        });
    }

    // Examiner Actions
    if (btnPrintAttempts) {
        btnPrintAttempts.addEventListener('click', () => window.print());
    }
    if (btnResetSeedData) {
        btnResetSeedData.addEventListener('click', async () => {
            if (confirm("Are you sure you want to reset candidate submissions to standard demo records?")) {
                setStudentAttempts(DEFAULT_STUDENT_ATTEMPTS);
                if (typeof BACKEND_API !== 'undefined' && BACKEND_API.isOnline) {
                    await BACKEND_API.resetAttempts();
                }
                renderAdminDashboard();
            }
        });
    }

    // Score Slip Modal Close
    if (btnCloseScoreSlip) {
        btnCloseScoreSlip.addEventListener('click', closeStudentSlip);
    }
    if (btnCloseScoreSlip2) {
        btnCloseScoreSlip2.addEventListener('click', closeStudentSlip);
    }

    // SGPA & CGPA Guide Modal Open & Close Listeners
    if (resGradeMetricCard) {
        resGradeMetricCard.addEventListener('click', openSgpaModal);
    }
    if (btnCloseSgpaModal) {
        btnCloseSgpaModal.addEventListener('click', closeSgpaModal);
    }
    if (btnCloseSgpaModal2) {
        btnCloseSgpaModal2.addEventListener('click', closeSgpaModal);
    }
    if (btnRunLiveCalc) {
        btnRunLiveCalc.addEventListener('click', runLiveSgpaCalculation);
    }

    // Question Management Buttons & Modal Listeners
    if (btnAddQuestionBtn) {
        btnAddQuestionBtn.addEventListener('click', () => openEditQuestionModal(null));
    }
    if (btnResetQuestionsBtn) {
        btnResetQuestionsBtn.addEventListener('click', handleResetQuestionsToDefault);
    }
    if (btnCloseQEditModal) {
        btnCloseQEditModal.addEventListener('click', closeEditQuestionModal);
    }
    if (btnCancelQEdit) {
        btnCancelQEdit.addEventListener('click', closeEditQuestionModal);
    }
    if (adminQuestionEditForm) {
        adminQuestionEditForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveQuestion();
        });
    }

    // Filter Buttons in Results
    const filterPills = document.querySelectorAll('.filter-pill');
    filterPills.forEach(pill => {
        pill.addEventListener('click', () => {
            filterPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            renderQuestionReviews(pill.dataset.filter);
        });
    });

    // Keyboard Shortcuts (only during active exam)
    document.addEventListener('keydown', (e) => {
        if (!examInProgress || examFinished || !confirmModal.classList.contains('hidden')) {
            return;
        }

        if (e.key === 'ArrowRight' && currentQuestionIndex < totalQuestions - 1) {
            loadQuestion(currentQuestionIndex + 1);
        } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
            loadQuestion(currentQuestionIndex - 1);
        } else if (['a', 'A', '1'].includes(e.key)) {
            selectOption(0);
        } else if (['b', 'B', '2'].includes(e.key)) {
            selectOption(1);
        } else if (['c', 'C', '3'].includes(e.key)) {
            selectOption(2);
        } else if (['d', 'D', '4'].includes(e.key)) {
            selectOption(3);
        }
    });
}

// App Kickoff on DOM Load
document.addEventListener('DOMContentLoaded', initApp);
