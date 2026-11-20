/**
 * ========================================================
 * MRDU - Malla Reddy Deemed To Be University
 * Directorate of Evaluation & Examinations
 * Full-Featured Online Examination & Proctoring Backend Server
 * ========================================================
 * Standalone Node.js HTTP Server & RESTful API
 * Zero External Dependencies (Uses pure Node.js built-ins)
 * Run: node server.js
 * Default Port: 3000 (http://localhost:3000)
 * ========================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = fs.existsSync(path.join(__dirname, '..', 'frontend'))
    ? path.join(__dirname, '..', 'frontend')
    : (fs.existsSync(path.join(__dirname, 'frontend')) ? path.join(__dirname, 'frontend') : __dirname);
const DATA_DIR = path.join(__dirname, 'data');
const RECORDINGS_DIR = path.join(DATA_DIR, 'recordings');

// File paths for persistence
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const STUDENTS_FILE = path.join(DATA_DIR, 'students.json');
const ATTEMPTS_FILE = path.join(DATA_DIR, 'attempts.json');

// Ensure data directories exist
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(RECORDINGS_DIR)) {
    fs.mkdirSync(RECORDINGS_DIR, { recursive: true });
}

// ========================================================
// DEFAULT SEED DATA
// ========================================================
const DEFAULT_QUESTIONS = [
    {
        id: 1,
        category: "Web Development",
        question: "Which of the following is a popular programming language primarily used for developing interactive and multimedia web pages?",
        options: ["COBOL", "JavaScript", "Fortran", "Pascal"],
        correctAnswer: 1,
        explanation: "JavaScript is the primary programming language of the web, enabling dynamic interactive content, animations, and multimedia features."
    },
    {
        id: 2,
        category: "Frontend Architecture",
        question: "Which HTML5 element is specifically used for drawing graphics and interactive animations on the fly via scripting?",
        options: ["<canvas>", "<svg>", "<section>", "<figure>"],
        correctAnswer: 0,
        explanation: "The <canvas> element provides an API for rendering bitmapped 2D/3D graphics and games directly inside the browser using JavaScript."
    },
    {
        id: 3,
        category: "CSS3 Styling",
        question: "In CSS Flexbox, which property is used to align flex items along the cross axis?",
        options: ["justify-content", "align-items", "flex-direction", "flex-wrap"],
        correctAnswer: 1,
        explanation: "'align-items' aligns items along the cross axis (vertical by default in a row), while 'justify-content' aligns along the main axis."
    },
    {
        id: 4,
        category: "JavaScript Core",
        question: "What will the expression `typeof null` return in modern JavaScript?",
        options: ["'null'", "'undefined'", "'object'", "'boolean'"],
        correctAnswer: 2,
        explanation: "In JavaScript, `typeof null` returns 'object'. This is a legacy bug originating in the very first version of JavaScript and is kept for backward compatibility."
    },
    {
        id: 5,
        category: "Web APIs",
        question: "Which browser API provides a clean, promise-based interface for making asynchronous HTTP requests?",
        options: ["XMLHttpRequest", "Fetch API", "WebSockets", "Service Worker API"],
        correctAnswer: 1,
        explanation: "The Fetch API provides a modern, promise-based standard mechanism for fetching network resources across the web."
    },
    {
        id: 6,
        category: "Performance & Storage",
        question: "Which client-side storage mechanism persists data across browser sessions and has no expiration date unless cleared manually?",
        options: ["sessionStorage", "localStorage", "HTTP Cookies", "Memory Cache"],
        correctAnswer: 1,
        explanation: "localStorage persists key-value pairs without expiration, whereas sessionStorage is cleared when the browser tab closes."
    },
    {
        id: 7,
        category: "Backend & HTTP",
        question: "Which HTTP status code signifies that a requested resource was successfully created on the server?",
        options: ["200 OK", "201 Created", "204 No Content", "304 Not Modified"],
        correctAnswer: 1,
        explanation: "HTTP 201 Created indicates that the request succeeded and resulted in one or more new resources being created (typically via POST)."
    },
    {
        id: 8,
        category: "Data Structures",
        question: "Which data structure operates on a Strict First-In, First-Out (FIFO) principle?",
        options: ["Stack", "Queue", "Binary Search Tree", "Heap"],
        correctAnswer: 1,
        explanation: "A Queue processes elements in First-In, First-Out (FIFO) order, similar to people standing in a physical checkout line."
    },
    {
        id: 9,
        category: "Security",
        question: "What security mechanism prevents a malicious website from making unauthorized cross-origin requests using a logged-in user's credentials?",
        options: ["CORS (Cross-Origin Resource Sharing)", "Same-Origin Policy (SOP)", "DNSSEC", "SSL/TLS Handshake"],
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

const DEFAULT_STUDENTS = [
    { id: "26HEU05R001", name: "Sai Pranay Reddy", dept: "CSE", password: "password123" },
    { id: "26HEU05R002", name: "Ananya Sharma", dept: "CSE", password: "password123" },
    { id: "26HEU05R003", name: "Rohit Varma", dept: "AI & ML", password: "password123" },
    { id: "26HEU05R004", name: "Sneha Latha", dept: "IT", password: "password123" },
    { id: "26HEU05R005", name: "Keerthi Rao", dept: "ECE", password: "password123" },
    { id: "26HEU05R006", name: "Vikramaditya P", dept: "CSE", password: "password123" },
    { id: "26HEU05R007", name: "Pooja Hegde", dept: "IT", password: "password123" },
    { id: "26HEU05R008", name: "Akhil Goud", dept: "ECE", password: "password123" },
    { id: "26HEU05R009", name: "Divya Teja", dept: "CSE", password: "password123" },
    { id: "26HEU05R010", name: "Manoj Kumar", dept: "AI & ML", password: "password123" },
    { id: "26HEU05R011", name: "Bhavani Prasad", dept: "CSE", password: "password123" },
    { id: "26HEU05R012", name: "Karthik Raj", dept: "IT", password: "password123" }
];

const DEFAULT_ATTEMPTS = [
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
        timestamp: "04 Nov 2026, 04:15 PM",
        tabSwitchCount: 0
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
        timestamp: "04 Nov 2026, 04:22 PM",
        tabSwitchCount: 0
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
        timestamp: "04 Nov 2026, 04:35 PM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R004",
        name: "Sneha Latha",
        score: 9,
        total: 10,
        percentage: 90,
        accuracy: 90,
        timeSpentSeconds: 340,
        timeSpentStr: "05:40",
        grade: "A+ (9.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:42 PM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R005",
        name: "Keerthi Rao",
        score: 8,
        total: 10,
        percentage: 80,
        accuracy: 80,
        timeSpentSeconds: 315,
        timeSpentStr: "05:15",
        grade: "A (8.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 04:55 PM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R006",
        name: "Vikramaditya P",
        score: 8,
        total: 10,
        percentage: 80,
        accuracy: 80,
        timeSpentSeconds: 395,
        timeSpentStr: "06:35",
        grade: "A (8.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:02 PM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R007",
        name: "Pooja Hegde",
        score: 7,
        total: 10,
        percentage: 70,
        accuracy: 70,
        timeSpentSeconds: 420,
        timeSpentStr: "07:00",
        grade: "B+ (7.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:15 PM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R008",
        name: "Akhil Goud",
        score: 7,
        total: 10,
        percentage: 70,
        accuracy: 70,
        timeSpentSeconds: 465,
        timeSpentStr: "07:45",
        grade: "B+ (7.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:25 PM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R009",
        name: "Divya Teja",
        score: 6,
        total: 10,
        percentage: 60,
        accuracy: 60,
        timeSpentSeconds: 510,
        timeSpentStr: "08:30",
        grade: "B (6.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:35 PM",
        tabSwitchCount: 1
    },
    {
        id: "26HEU05R010",
        name: "Manoj Kumar",
        score: 5,
        total: 10,
        percentage: 50,
        accuracy: 50,
        timeSpentSeconds: 545,
        timeSpentStr: "09:05",
        grade: "B (6.0)",
        status: "PASS",
        timestamp: "04 Nov 2026, 05:48 PM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R011",
        name: "Bhavani Prasad",
        score: 4,
        total: 10,
        percentage: 40,
        accuracy: 40,
        timeSpentSeconds: 590,
        timeSpentStr: "09:50",
        grade: "F",
        status: "FAIL",
        timestamp: "04 Nov 2026, 05:55 PM",
        tabSwitchCount: 2
    },
    {
        id: "26HEU05R012",
        name: "Karthik Raj",
        score: 3,
        total: 10,
        percentage: 30,
        accuracy: 30,
        timeSpentSeconds: 620,
        timeSpentStr: "10:20",
        grade: "F",
        status: "FAIL",
        timestamp: "04 Nov 2026, 06:05 PM",
        tabSwitchCount: 3
    }
];

// Helper functions for reading/writing JSON files
function readJSON(filePath, fallback) {
    try {
        if (!fs.existsSync(filePath)) {
            writeJSON(filePath, fallback);
            return fallback;
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err.message);
        return fallback;
    }
}

function writeJSON(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err.message);
        return false;
    }
}

// Initialize seed data if not present
readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
readJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);

// MIME type dictionary for static file serving
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4',
    '.txt': 'text/plain; charset=utf-8'
};

// Response helpers
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end(JSON.stringify(data));
}

function sendCORS(res) {
    res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
}

function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
            // 50MB limit to support video payloads
            if (body.length > 50 * 1024 * 1024) {
                req.destroy();
                reject(new Error('Payload too large'));
            }
        });
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                resolve({ raw: body });
            }
        });
        req.on('error', err => reject(err));
    });
}

// ========================================================
// HTTP REQUEST ROUTER & CONTROLLER
// ========================================================
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    // CORS preflight
    if (method === 'OPTIONS') {
        return sendCORS(res);
    }

    // ========================================================
    // REST API ENDPOINTS
    // ========================================================

    // 1. Health check & Server Status
    if (pathname === '/api/health' && method === 'GET') {
        const questions = readJSON(QUESTIONS_FILE, []);
        const students = readJSON(STUDENTS_FILE, []);
        const attempts = readJSON(ATTEMPTS_FILE, []);
        return sendJSON(res, 200, {
            status: 'online',
            service: 'MRDU Online Examination Backend',
            university: 'Malla Reddy Deemed To Be University',
            version: '1.0.0',
            uptimeSeconds: Math.floor(process.uptime()),
            stats: {
                totalQuestions: questions.length,
                totalStudents: students.length,
                totalAttempts: attempts.length
            },
            serverTime: new Date().toISOString()
        });
    }

    // 2. Questions API
    if (pathname === '/api/questions' && method === 'GET') {
        const questions = readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
        return sendJSON(res, 200, { success: true, count: questions.length, questions });
    }

    if (pathname === '/api/questions' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            if (Array.isArray(body)) {
                writeJSON(QUESTIONS_FILE, body);
                return sendJSON(res, 200, { success: true, message: 'All questions synced successfully', count: body.length, questions: body });
            }
            const questions = readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
            const newId = questions.length > 0 ? Math.max(...questions.map(q => q.id || 0)) + 1 : 1;
            const newQuestion = {
                id: newId,
                category: body.category || 'General Programming',
                question: body.question || '',
                options: Array.isArray(body.options) ? body.options : ['', '', '', ''],
                correctAnswer: typeof body.correctAnswer === 'number' ? body.correctAnswer : 0,
                explanation: body.explanation || ''
            };
            questions.push(newQuestion);
            writeJSON(QUESTIONS_FILE, questions);
            return sendJSON(res, 201, { success: true, message: 'Question added successfully', question: newQuestion });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    if (pathname.startsWith('/api/questions/') && method === 'PUT') {
        try {
            const id = parseInt(pathname.split('/')[3], 10);
            const body = await parseRequestBody(req);
            const questions = readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
            const idx = questions.findIndex(q => q.id === id);
            if (idx === -1) {
                return sendJSON(res, 404, { success: false, error: 'Question not found' });
            }
            questions[idx] = {
                ...questions[idx],
                category: body.category || questions[idx].category,
                question: body.question || questions[idx].question,
                options: Array.isArray(body.options) ? body.options : questions[idx].options,
                correctAnswer: typeof body.correctAnswer === 'number' ? body.correctAnswer : questions[idx].correctAnswer,
                explanation: body.explanation || questions[idx].explanation
            };
            writeJSON(QUESTIONS_FILE, questions);
            return sendJSON(res, 200, { success: true, message: 'Question updated successfully', question: questions[idx] });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    if (pathname.startsWith('/api/questions/') && method === 'DELETE') {
        const id = parseInt(pathname.split('/')[3], 10);
        const questions = readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
        const filtered = questions.filter(q => q.id !== id);
        if (filtered.length === questions.length) {
            return sendJSON(res, 404, { success: false, error: 'Question not found' });
        }
        writeJSON(QUESTIONS_FILE, filtered);
        return sendJSON(res, 200, { success: true, message: 'Question deleted successfully', remaining: filtered.length });
    }

    if (pathname === '/api/questions/reset' && method === 'POST') {
        writeJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
        return sendJSON(res, 200, { success: true, message: 'Question repository reset to defaults', count: DEFAULT_QUESTIONS.length });
    }

    // 3. Students Registration & Accounts API
    if (pathname === '/api/students' && method === 'GET') {
        const students = readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
        return sendJSON(res, 200, { success: true, count: students.length, students });
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { name, id, password, dept } = body;
            if (!name || !id) {
                return sendJSON(res, 400, { success: false, error: 'Candidate name and roll number are required.' });
            }

            const students = readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
            const exists = students.find(s => s.id.toUpperCase() === id.trim().toUpperCase());
            if (exists) {
                exists.name = name.trim();
                exists.dept = dept || exists.dept;
                exists.password = password || exists.password;
                writeJSON(STUDENTS_FILE, students);
                return sendJSON(res, 200, { success: true, message: 'Student details updated successfully', student: { id: exists.id, name: exists.name } });
            }

            const newStudent = {
                id: id.trim().toUpperCase(),
                name: name.trim(),
                dept: dept || 'Computer Science & Engineering',
                password: password || 'student123',
                registeredAt: new Date().toISOString()
            };
            students.push(newStudent);
            writeJSON(STUDENTS_FILE, students);
            return sendJSON(res, 201, { success: true, message: 'Student registered successfully', student: { id: newStudent.id, name: newStudent.name } });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    // 4. Authentication APIs
    if (pathname === '/api/auth/candidate-login' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { username, password } = body;
            const students = readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
            const found = students.find(s => s.id.toUpperCase() === (username || '').trim().toUpperCase());

            if (!found) {
                return sendJSON(res, 401, { success: false, error: 'Invalid Hall Ticket / Roll number.' });
            }
            if (found.password && found.password !== password) {
                return sendJSON(res, 401, { success: false, error: 'Incorrect password entered.' });
            }
            return sendJSON(res, 200, { success: true, message: 'Authentication successful', user: { id: found.id, name: found.name, dept: found.dept } });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    if (pathname === '/api/auth/examiner-login' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { username, password } = body;
            if ((username || '').trim().toLowerCase() === 'admin' && password === 'admin123') {
                return sendJSON(res, 200, { success: true, message: 'Examiner authenticated', user: { role: 'examiner', name: 'Dr. Examiner / Admin' } });
            }
            return sendJSON(res, 401, { success: false, error: 'Invalid Examiner credentials.' });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    // 5. Exam Attempts & Submissions API
    if (pathname === '/api/attempts' && method === 'GET') {
        const attempts = readJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
        // Sort descending by score, ascending by duration
        attempts.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return (a.timeSpentSeconds || 0) - (b.timeSpentSeconds || 0);
        });
        return sendJSON(res, 200, { success: true, count: attempts.length, attempts });
    }

    if (pathname === '/api/attempts' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const attempts = readJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);

            // Filter out existing attempt by same roll to prevent duplicate records
            const filtered = attempts.filter(a => a.id.toUpperCase() !== (body.id || '').toUpperCase());

            const newAttempt = {
                id: body.id,
                name: body.name,
                score: body.score,
                total: body.total || 10,
                percentage: body.percentage,
                accuracy: body.accuracy,
                timeSpentSeconds: body.timeSpentSeconds,
                timeSpentStr: body.timeSpentStr,
                grade: body.grade,
                status: body.status,
                timestamp: body.timestamp || new Date().toLocaleString('en-IN'),
                tabSwitchCount: body.tabSwitchCount || 0,
                userAnswers: Array.isArray(body.userAnswers) ? body.userAnswers : [],
                markedForReview: Array.isArray(body.markedForReview) ? body.markedForReview : [],
                proctorVideoUrl: body.proctorVideoUrl || null,
                isCurrentUser: true
            };

            filtered.push(newAttempt);
            writeJSON(ATTEMPTS_FILE, filtered);
            return sendJSON(res, 201, { success: true, message: 'Assessment attempt saved to university database', attempt: newAttempt });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    if (pathname.startsWith('/api/attempts/') && method === 'GET') {
        const studentId = pathname.split('/')[3];
        const attempts = readJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
        const found = attempts.find(a => a.id.toUpperCase() === (studentId || '').toUpperCase());
        if (!found) {
            return sendJSON(res, 404, { success: false, error: 'Student attempt record not found' });
        }
        return sendJSON(res, 200, { success: true, attempt: found });
    }

    if (pathname === '/api/attempts/reset' && method === 'POST') {
        writeJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
        return sendJSON(res, 200, { success: true, message: 'Attempts reset to standard demo records', count: DEFAULT_ATTEMPTS.length });
    }

    // 6. Proctor Video Upload API
    if (pathname === '/api/proctor/upload' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const studentId = (body.studentId || 'session').replace(/[^a-zA-Z0-9_-]/g, '');
            const filename = `proctor_${studentId}_${Date.now()}.webm`;
            const filePath = path.join(RECORDINGS_DIR, filename);

            if (body.videoBase64) {
                const base64Data = body.videoBase64.replace(/^data:video\/\w+;base64,/, '');
                fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
            } else {
                fs.writeFileSync(filePath, Buffer.from(''));
            }

            const videoUrl = `/recordings/${filename}`;
            return sendJSON(res, 201, { success: true, filename, videoUrl });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    // ========================================================
    // STATIC FILE SERVER
    // ========================================================
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
        safePath = 'index.html';
    }

    // Check in recordings dir
    let filePath;
    if (safePath.startsWith('/recordings/') || safePath.startsWith('\\recordings\\')) {
        filePath = path.join(DATA_DIR, safePath);
    } else {
        filePath = path.join(PUBLIC_DIR, safePath);
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(`404 Not Found: ${pathname}`);
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': stats.size,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

// Start listening
server.listen(PORT, () => {
    console.log('========================================================');
    console.log('🏛️  MALLA REDDY (MR) DEEMED TO BE UNIVERSITY');
    console.log('🎓 Directorate of Evaluation & Online Examination Portal');
    console.log('========================================================');
    console.log(`🚀 Backend Server Running at: http://localhost:${PORT}`);
    console.log(`📁 Static Web Files Served From: ${PUBLIC_DIR}`);
    console.log(`💾 JSON Database Persistent Store: ${DATA_DIR}`);
    console.log(`📹 Live Proctor Recordings Store: ${RECORDINGS_DIR}`);
    console.log('--------------------------------------------------------');
    console.log('Available REST APIs:');
    console.log(` - Health Status:       GET  http://localhost:${PORT}/api/health`);
    console.log(` - Questions Bank:      GET  http://localhost:${PORT}/api/questions`);
    console.log(` - Student Attempts:    GET  http://localhost:${PORT}/api/attempts`);
    console.log(` - Candidate Register:  POST http://localhost:${PORT}/api/auth/register`);
    console.log(` - Candidate Login:     POST http://localhost:${PORT}/api/auth/candidate-login`);
    console.log(` - Examiner Admin Login: POST http://localhost:${PORT}/api/auth/examiner-login`);
    console.log('========================================================');
});
