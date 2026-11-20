/**
 * ========================================================
 * MRDU - Malla Reddy Deemed To Be University
 * Directorate of Evaluation & Examinations
 * Full-Featured Online Examination & Proctoring Backend Server
 * ========================================================
 * Standalone Node.js HTTP Server & RESTful API
 * Supports PostgreSQL (via DATABASE_URL on Render/Cloud)
 * with graceful fallback to local persistent JSON store
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

// File paths for persistence fallback
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
        category: "Database & Backend",
        question: "In a relational database (SQL), which command is used to retrieve specific columns of data from a table?",
        options: ["SELECT", "EXTRACT", "FETCH", "OPEN"],
        correctAnswer: 0,
        explanation: "The SELECT statement is used in SQL to query and retrieve data from one or more tables in a relational database."
    },
    {
        id: 9,
        category: "Network & Security",
        question: "What does the 'S' stand for in the HTTPS secure communication protocol?",
        options: ["Standard", "Secure", "Socket", "Synchronous"],
        correctAnswer: 1,
        explanation: "HTTPS stands for HyperText Transfer Protocol Secure. It encrypts data transmission over TLS/SSL."
    },
    {
        id: 10,
        category: "Version Control",
        question: "In Git version control, which command creates a new working copy branch and immediately switches to it?",
        options: ["git branch -new", "git checkout -b <branch>", "git merge --create", "git switch --all"],
        correctAnswer: 1,
        explanation: "`git checkout -b <branch-name>` creates a new branch and immediately checks it out into your working tree."
    }
];

const DEFAULT_STUDENTS = [
    { id: "26HEU05R001", name: "Sai Pranay Reddy", dept: "Computer Science & Engineering", password: "student123" },
    { id: "26HEU05R002", name: "Ananya Sharma", dept: "Computer Science & Engineering", password: "student123" },
    { id: "26HEU05R003", name: "Rohit Varma", dept: "AI & Machine Learning", password: "student123" },
    { id: "26HEU05R004", name: "K. Sneha", dept: "Data Science", password: "student123" },
    { id: "26HEU05R005", name: "T. Akhil Kumar", dept: "Information Technology", password: "student123" },
    { id: "26HEU05R006", name: "M. Divya Sree", dept: "Computer Science & Engineering", password: "student123" },
    { id: "26HEU05R007", name: "P. Karthik", dept: "AI & Machine Learning", password: "student123" },
    { id: "26HEU05R008", name: "B. Manasa", dept: "Cyber Security", password: "student123" },
    { id: "26HEU05R009", name: "V. Harish", dept: "Computer Science & Engineering", password: "student123" },
    { id: "26HEU05R010", name: "Ch. Pooja", dept: "Data Science", password: "student123" },
    { id: "26HEU05R011", name: "G. Rahul", dept: "Information Technology", password: "student123" },
    { id: "26HEU05R012", name: "S. Niharika", dept: "Computer Science & Engineering", password: "student123" }
];

const DEFAULT_ATTEMPTS = [
    {
        id: "26HEU05R001",
        name: "Sai Pranay Reddy",
        score: 10,
        total: 10,
        percentage: 100,
        accuracy: 100,
        timeSpentSeconds: 420,
        timeSpentStr: "07:00",
        grade: "O (10.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:15 AM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R002",
        name: "Ananya Sharma",
        score: 9,
        total: 10,
        percentage: 90,
        accuracy: 90,
        timeSpentSeconds: 510,
        timeSpentStr: "08:30",
        grade: "O (10.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:20 AM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R003",
        name: "Rohit Varma",
        score: 8,
        total: 10,
        percentage: 80,
        accuracy: 80,
        timeSpentSeconds: 600,
        timeSpentStr: "10:00",
        grade: "A+ (9.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:25 AM",
        tabSwitchCount: 1
    },
    {
        id: "26HEU05R004",
        name: "K. Sneha",
        score: 8,
        total: 10,
        percentage: 80,
        accuracy: 89,
        timeSpentSeconds: 645,
        timeSpentStr: "10:45",
        grade: "A+ (9.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:30 AM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R005",
        name: "T. Akhil Kumar",
        score: 7,
        total: 10,
        percentage: 70,
        accuracy: 70,
        timeSpentSeconds: 720,
        timeSpentStr: "12:00",
        grade: "A (8.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:35 AM",
        tabSwitchCount: 2
    },
    {
        id: "26HEU05R006",
        name: "M. Divya Sree",
        score: 7,
        total: 10,
        percentage: 70,
        accuracy: 78,
        timeSpentSeconds: 780,
        timeSpentStr: "13:00",
        grade: "A (8.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:40 AM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R007",
        name: "P. Karthik",
        score: 6,
        total: 10,
        percentage: 60,
        accuracy: 60,
        timeSpentSeconds: 840,
        timeSpentStr: "14:00",
        grade: "B+ (7.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:45 AM",
        tabSwitchCount: 3
    },
    {
        id: "26HEU05R008",
        name: "B. Manasa",
        score: 6,
        total: 10,
        percentage: 60,
        accuracy: 67,
        timeSpentSeconds: 870,
        timeSpentStr: "14:30",
        grade: "B+ (7.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:50 AM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R009",
        name: "V. Harish",
        score: 5,
        total: 10,
        percentage: 50,
        accuracy: 50,
        timeSpentSeconds: 900,
        timeSpentStr: "15:00",
        grade: "B (6.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 10:55 AM",
        tabSwitchCount: 1
    },
    {
        id: "26HEU05R010",
        name: "Ch. Pooja",
        score: 5,
        total: 10,
        percentage: 50,
        accuracy: 56,
        timeSpentSeconds: 900,
        timeSpentStr: "15:00",
        grade: "B (6.0)",
        status: "PASS",
        timestamp: "20-Nov-2026, 11:00 AM",
        tabSwitchCount: 0
    },
    {
        id: "26HEU05R011",
        name: "G. Rahul",
        score: 4,
        total: 10,
        percentage: 40,
        accuracy: 40,
        timeSpentSeconds: 900,
        timeSpentStr: "15:00",
        grade: "F",
        status: "FAIL",
        timestamp: "20-Nov-2026, 11:05 AM",
        tabSwitchCount: 4
    },
    {
        id: "26HEU05R012",
        name: "S. Niharika",
        score: 4,
        total: 10,
        percentage: 40,
        accuracy: 44,
        timeSpentSeconds: 900,
        timeSpentStr: "15:00",
        grade: "F",
        status: "FAIL",
        timestamp: "20-Nov-2026, 11:10 AM",
        tabSwitchCount: 2
    }
];

// ========================================================
// FILE SYSTEM DATA HELPERS (OFFLINE / FALLBACK)
// ========================================================
function readJSON(filePath, defaultData) {
    try {
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
        }
    } catch (err) {
        console.warn(`Warning reading ${filePath}:`, err.message);
    }
    writeJSON(filePath, defaultData);
    return JSON.parse(JSON.stringify(defaultData));
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

// Pre-seed local files if not present
readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
readJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);

// ========================================================
// POSTGRESQL CLOUD DATABASE INTEGRATION (RENDER / PG)
// ========================================================
let pgPool = null;
let dbReady = false;

async function initDatabase() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.log("💾 Running in Local File Store Mode (DATABASE_URL not set).");
        return;
    }

    try {
        let Pool;
        try {
            Pool = require('pg').Pool;
        } catch (e) {
            console.warn("⚠️ 'pg' module not installed in this environment. Falling back to File Store.");
            return;
        }

        const isLocalPg = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
        pgPool = new Pool({
            connectionString: dbUrl,
            ssl: isLocalPg ? false : { rejectUnauthorized: false }
        });

        const client = await pgPool.connect();
        console.log("🐘 Successfully connected to PostgreSQL Database!");

        // Create Tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS students (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                dept VARCHAR(255),
                password VARCHAR(255) NOT NULL,
                registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS questions (
                id INT PRIMARY KEY,
                category VARCHAR(100),
                question TEXT NOT NULL,
                options JSONB NOT NULL,
                correct_answer INT NOT NULL,
                explanation TEXT
            );

            CREATE TABLE IF NOT EXISTS attempts (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                score INT NOT NULL,
                total INT NOT NULL,
                percentage INT NOT NULL,
                accuracy INT NOT NULL,
                time_spent_seconds INT,
                time_spent_str VARCHAR(50),
                grade VARCHAR(50),
                status VARCHAR(20),
                timestamp VARCHAR(100),
                tab_switch_count INT DEFAULT 0,
                user_answers JSONB,
                marked_for_review JSONB,
                proctor_video_url TEXT,
                is_current_user BOOLEAN DEFAULT false,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS recordings (
                id SERIAL PRIMARY KEY,
                student_id VARCHAR(50),
                filename VARCHAR(255),
                video_base64 TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed students if empty
        const stdRes = await client.query('SELECT COUNT(*) FROM students');
        if (parseInt(stdRes.rows[0].count, 10) === 0) {
            console.log("🌱 Seeding initial students into PostgreSQL...");
            for (const s of DEFAULT_STUDENTS) {
                await client.query(
                    'INSERT INTO students (id, name, dept, password) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
                    [s.id, s.name, s.dept, s.password || 'student123']
                );
            }
        }

        // Seed questions if empty
        const qRes = await client.query('SELECT COUNT(*) FROM questions');
        if (parseInt(qRes.rows[0].count, 10) === 0) {
            console.log("🌱 Seeding initial questions into PostgreSQL...");
            for (const q of DEFAULT_QUESTIONS) {
                await client.query(
                    'INSERT INTO questions (id, category, question, options, correct_answer, explanation) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING',
                    [q.id, q.category, q.question, JSON.stringify(q.options), q.correctAnswer, q.explanation]
                );
            }
        }

        // Seed attempts if empty
        const attRes = await client.query('SELECT COUNT(*) FROM attempts');
        if (parseInt(attRes.rows[0].count, 10) === 0) {
            console.log("🌱 Seeding initial attempts into PostgreSQL...");
            for (const a of DEFAULT_ATTEMPTS) {
                await client.query(`
                    INSERT INTO attempts (id, name, score, total, percentage, accuracy, time_spent_seconds, time_spent_str, grade, status, timestamp, tab_switch_count, user_answers, marked_for_review, proctor_video_url, is_current_user)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    a.id, a.name, a.score, a.total, a.percentage, a.accuracy,
                    a.timeSpentSeconds, a.timeSpentStr, a.grade, a.status,
                    a.timestamp, a.tabSwitchCount || 0,
                    JSON.stringify(a.userAnswers || []),
                    JSON.stringify(a.markedForReview || []),
                    a.proctorVideoUrl || null,
                    a.isCurrentUser || false
                ]);
            }
        }

        client.release();
        dbReady = true;
        console.log("✅ PostgreSQL Database Initialized & Synced Successfully!");
    } catch (err) {
        console.error("⚠️ PostgreSQL Connection / Migration Error:", err.message);
        console.log("📁 Falling back to local file system store.");
        dbReady = false;
    }
}

// Unified Database Access Helpers
async function getQuestionsFromDb() {
    if (dbReady && pgPool) {
        try {
            const res = await pgPool.query('SELECT id, category, question, options, correct_answer AS "correctAnswer", explanation FROM questions ORDER BY id ASC');
            return res.rows;
        } catch (e) {
            console.warn("DB getQuestions error:", e.message);
        }
    }
    return readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
}

async function saveAllQuestionsToDb(questionsList) {
    if (dbReady && pgPool) {
        try {
            await pgPool.query('DELETE FROM questions');
            for (const q of questionsList) {
                await pgPool.query(
                    'INSERT INTO questions (id, category, question, options, correct_answer, explanation) VALUES ($1, $2, $3, $4, $5, $6)',
                    [q.id, q.category, q.question, JSON.stringify(q.options), q.correctAnswer, q.explanation]
                );
            }
            return true;
        } catch (e) {
            console.warn("DB saveAllQuestions error:", e.message);
        }
    }
    return writeJSON(QUESTIONS_FILE, questionsList);
}

async function addSingleQuestionToDb(q) {
    if (dbReady && pgPool) {
        try {
            const maxRes = await pgPool.query('SELECT COALESCE(MAX(id), 0) + 1 AS new_id FROM questions');
            const newId = maxRes.rows[0].new_id;
            const newQ = { ...q, id: newId };
            await pgPool.query(
                'INSERT INTO questions (id, category, question, options, correct_answer, explanation) VALUES ($1, $2, $3, $4, $5, $6)',
                [newId, newQ.category, newQ.question, JSON.stringify(newQ.options), newQ.correctAnswer, newQ.explanation]
            );
            return newQ;
        } catch (e) {
            console.warn("DB addSingleQuestion error:", e.message);
        }
    }
    const questions = readJSON(QUESTIONS_FILE, DEFAULT_QUESTIONS);
    const newId = questions.length > 0 ? Math.max(...questions.map(item => item.id || 0)) + 1 : 1;
    const newQ = { ...q, id: newId };
    questions.push(newQ);
    writeJSON(QUESTIONS_FILE, questions);
    return newQ;
}

async function getStudentsFromDb() {
    if (dbReady && pgPool) {
        try {
            const res = await pgPool.query('SELECT id, name, dept, password, registered_at AS "registeredAt" FROM students ORDER BY registered_at DESC');
            return res.rows;
        } catch (e) {
            console.warn("DB getStudents error:", e.message);
        }
    }
    return readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
}

async function registerOrUpdateStudentInDb(s) {
    if (dbReady && pgPool) {
        try {
            await pgPool.query(`
                INSERT INTO students (id, name, dept, password, registered_at)
                VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
                ON CONFLICT (id) DO UPDATE
                SET name = EXCLUDED.name, dept = EXCLUDED.dept, password = EXCLUDED.password
            `, [s.id.toUpperCase(), s.name, s.dept || 'Computer Science & Engineering', s.password || 'student123']);
            return { id: s.id.toUpperCase(), name: s.name, dept: s.dept };
        } catch (e) {
            console.warn("DB registerOrUpdateStudent error:", e.message);
        }
    }
    const students = readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
    const existing = students.find(item => item.id.toUpperCase() === s.id.trim().toUpperCase());
    if (existing) {
        existing.name = s.name.trim();
        existing.dept = s.dept || existing.dept;
        existing.password = s.password || existing.password;
    } else {
        students.push({
            id: s.id.trim().toUpperCase(),
            name: s.name.trim(),
            dept: s.dept || 'Computer Science & Engineering',
            password: s.password || 'student123',
            registeredAt: new Date().toISOString()
        });
    }
    writeJSON(STUDENTS_FILE, students);
    return { id: s.id, name: s.name, dept: s.dept };
}

async function findStudentForLogin(roll, password) {
    if (dbReady && pgPool) {
        try {
            const res = await pgPool.query('SELECT * FROM students WHERE UPPER(id) = UPPER($1)', [(roll || '').trim()]);
            if (res.rows.length === 0) return { error: 'Invalid Hall Ticket / Roll number.' };
            const student = res.rows[0];
            if (student.password && student.password !== password) {
                return { error: 'Incorrect password entered.' };
            }
            return { user: { id: student.id, name: student.name, dept: student.dept } };
        } catch (e) {
            console.warn("DB findStudentForLogin error:", e.message);
        }
    }
    const students = readJSON(STUDENTS_FILE, DEFAULT_STUDENTS);
    const found = students.find(s => s.id.toUpperCase() === (roll || '').trim().toUpperCase());
    if (!found) return { error: 'Invalid Hall Ticket / Roll number.' };
    if (found.password && found.password !== password) return { error: 'Incorrect password entered.' };
    return { user: { id: found.id, name: found.name, dept: found.dept } };
}

async function getAttemptsFromDb() {
    if (dbReady && pgPool) {
        try {
            const res = await pgPool.query(`
                SELECT 
                    id, name, score, total, percentage, accuracy,
                    time_spent_seconds AS "timeSpentSeconds",
                    time_spent_str AS "timeSpentStr",
                    grade, status, timestamp,
                    tab_switch_count AS "tabSwitchCount",
                    user_answers AS "userAnswers",
                    marked_for_review AS "markedForReview",
                    proctor_video_url AS "proctorVideoUrl",
                    is_current_user AS "isCurrentUser"
                FROM attempts
                ORDER BY score DESC, time_spent_seconds ASC
            `);
            return res.rows;
        } catch (e) {
            console.warn("DB getAttempts error:", e.message);
        }
    }
    const attempts = readJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
    attempts.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return (a.timeSpentSeconds || 0) - (b.timeSpentSeconds || 0);
    });
    return attempts;
}

async function saveAttemptToDb(a) {
    if (dbReady && pgPool) {
        try {
            await pgPool.query(`
                INSERT INTO attempts (
                    id, name, score, total, percentage, accuracy,
                    time_spent_seconds, time_spent_str, grade, status,
                    timestamp, tab_switch_count, user_answers, marked_for_review,
                    proctor_video_url, is_current_user
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    score = EXCLUDED.score,
                    total = EXCLUDED.total,
                    percentage = EXCLUDED.percentage,
                    accuracy = EXCLUDED.accuracy,
                    time_spent_seconds = EXCLUDED.time_spent_seconds,
                    time_spent_str = EXCLUDED.time_spent_str,
                    grade = EXCLUDED.grade,
                    status = EXCLUDED.status,
                    timestamp = EXCLUDED.timestamp,
                    tab_switch_count = EXCLUDED.tab_switch_count,
                    user_answers = EXCLUDED.user_answers,
                    marked_for_review = EXCLUDED.marked_for_review,
                    proctor_video_url = EXCLUDED.proctor_video_url,
                    is_current_user = EXCLUDED.is_current_user
            `, [
                a.id, a.name, a.score, a.total || 10, a.percentage, a.accuracy,
                a.timeSpentSeconds || 0, a.timeSpentStr || '00:00', a.grade || 'F', a.status || 'FAIL',
                a.timestamp || new Date().toLocaleString('en-IN'),
                a.tabSwitchCount || 0,
                JSON.stringify(a.userAnswers || []),
                JSON.stringify(a.markedForReview || []),
                a.proctorVideoUrl || null,
                true
            ]);
            return a;
        } catch (e) {
            console.warn("DB saveAttempt error:", e.message);
        }
    }
    const attempts = readJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
    const filtered = attempts.filter(item => item.id.toUpperCase() !== (a.id || '').toUpperCase());
    filtered.push(a);
    writeJSON(ATTEMPTS_FILE, filtered);
    return a;
}

async function resetAttemptsInDb() {
    if (dbReady && pgPool) {
        try {
            await pgPool.query('DELETE FROM attempts');
            for (const a of DEFAULT_ATTEMPTS) {
                await pgPool.query(`
                    INSERT INTO attempts (id, name, score, total, percentage, accuracy, time_spent_seconds, time_spent_str, grade, status, timestamp, tab_switch_count, user_answers, marked_for_review, proctor_video_url, is_current_user)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                    ON CONFLICT (id) DO NOTHING
                `, [
                    a.id, a.name, a.score, a.total, a.percentage, a.accuracy,
                    a.timeSpentSeconds, a.timeSpentStr, a.grade, a.status,
                    a.timestamp, a.tabSwitchCount || 0,
                    JSON.stringify(a.userAnswers || []),
                    JSON.stringify(a.markedForReview || []),
                    a.proctorVideoUrl || null,
                    a.isCurrentUser || false
                ]);
            }
            return DEFAULT_ATTEMPTS;
        } catch (e) {
            console.warn("DB resetAttempts error:", e.message);
        }
    }
    writeJSON(ATTEMPTS_FILE, DEFAULT_ATTEMPTS);
    return DEFAULT_ATTEMPTS;
}

async function saveRecordingToDb(studentId, filename, base64) {
    if (dbReady && pgPool) {
        try {
            await pgPool.query(
                'INSERT INTO recordings (student_id, filename, video_base64) VALUES ($1, $2, $3)',
                [studentId, filename, base64 || '']
            );
        } catch (e) {
            console.warn("DB saveRecording error:", e.message);
        }
    }
    try {
        const filePath = path.join(RECORDINGS_DIR, filename);
        if (base64) {
            const base64Data = base64.replace(/^data:video\/\w+;base64,/, '');
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
        } else {
            fs.writeFileSync(filePath, Buffer.from(''));
        }
    } catch (e) {
        console.warn("File recording write warning:", e.message);
    }
}

// ========================================================
// HTTP ROUTER & STATIC FILE SERVER
// ========================================================
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

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const method = req.method.toUpperCase();

    if (method === 'OPTIONS') {
        return sendCORS(res);
    }

    // ========================================================
    // REST APIs
    // ========================================================

    // 1. Health & Status
    if (pathname === '/api/health' && method === 'GET') {
        const questions = await getQuestionsFromDb();
        const students = await getStudentsFromDb();
        const attempts = await getAttemptsFromDb();
        return sendJSON(res, 200, {
            status: 'online',
            service: 'MRDU Online Examination Backend',
            university: 'Malla Reddy Deemed To Be University',
            database: dbReady ? 'PostgreSQL (Cloud DB)' : 'Local File Store',
            databaseConnected: dbReady,
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
        const questions = await getQuestionsFromDb();
        return sendJSON(res, 200, { success: true, count: questions.length, questions });
    }

    if (pathname === '/api/questions' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            if (Array.isArray(body)) {
                await saveAllQuestionsToDb(body);
                return sendJSON(res, 200, { success: true, message: 'All questions synced successfully', count: body.length, questions: body });
            }
            const newQ = await addSingleQuestionToDb(body);
            return sendJSON(res, 201, { success: true, message: 'Question added successfully', question: newQ });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    if (pathname === '/api/questions/reset' && method === 'POST') {
        await saveAllQuestionsToDb(DEFAULT_QUESTIONS);
        return sendJSON(res, 200, { success: true, message: 'Question repository reset to defaults', count: DEFAULT_QUESTIONS.length });
    }

    // 3. Students Registration & Accounts API
    if (pathname === '/api/students' && method === 'GET') {
        const students = await getStudentsFromDb();
        return sendJSON(res, 200, { success: true, count: students.length, students });
    }

    if (pathname === '/api/auth/register' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { name, id, password, dept } = body;
            if (!name || !id) {
                return sendJSON(res, 400, { success: false, error: 'Candidate name and roll number are required.' });
            }
            const result = await registerOrUpdateStudentInDb({ name, id, password, dept });
            return sendJSON(res, 201, { success: true, message: 'Student registered successfully', student: result });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    // 4. Candidate & Examiner Login APIs
    if (pathname === '/api/auth/candidate-login' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { username, password } = body;
            const authResult = await findStudentForLogin(username, password);
            if (authResult.error) {
                return sendJSON(res, 401, { success: false, error: authResult.error });
            }
            return sendJSON(res, 200, { success: true, message: 'Authentication successful', user: authResult.user });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    if (pathname === '/api/auth/examiner-login' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const { username, password } = body;
            if (password === 'admin123') {
                return sendJSON(res, 200, { success: true, message: 'Examiner authenticated', user: { role: 'examiner', name: 'Dr. Examiner / Admin' } });
            }
            return sendJSON(res, 401, { success: false, error: 'Invalid Examiner credentials.' });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    // 5. Exam Attempts & Submissions API
    if (pathname === '/api/attempts' && method === 'GET') {
        const attempts = await getAttemptsFromDb();
        return sendJSON(res, 200, { success: true, count: attempts.length, attempts });
    }

    if (pathname === '/api/attempts' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const savedAttempt = await saveAttemptToDb(body);
            return sendJSON(res, 201, { success: true, message: 'Assessment attempt saved to database', attempt: savedAttempt });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    if (pathname === '/api/attempts/reset' && method === 'POST') {
        const resetData = await resetAttemptsInDb();
        return sendJSON(res, 200, { success: true, message: 'Attempts reset to standard demo records', count: resetData.length });
    }

    // 6. Proctor Video Upload API
    if (pathname === '/api/proctor/upload' && method === 'POST') {
        try {
            const body = await parseRequestBody(req);
            const studentId = (body.studentId || 'session').replace(/[^a-zA-Z0-9_-]/g, '');
            const filename = `proctor_${studentId}_${Date.now()}.webm`;
            await saveRecordingToDb(studentId, filename, body.videoBase64);
            const videoUrl = `/recordings/${filename}`;
            return sendJSON(res, 201, { success: true, filename, videoUrl });
        } catch (err) {
            return sendJSON(res, 400, { success: false, error: err.message });
        }
    }

    // ========================================================
    // STATIC WEB ASSETS SERVING (FRONTEND)
    // ========================================================
    let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePath === '/' || safePath === '\\') {
        safePath = 'index.html';
    }

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

// ========================================================
// START SERVER
// ========================================================
initDatabase().finally(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log('========================================================');
        console.log('🏛️  MALLA REDDY (MR) DEEMED TO BE UNIVERSITY');
        console.log('🎓 Directorate of Evaluation & Online Examination Portal');
        console.log('========================================================');
        console.log(`🚀 Server Running at: http://0.0.0.0:${PORT}`);
        console.log(`🗄️  Active Database: ${dbReady ? '🐘 PostgreSQL (Live Cloud DB)' : '💾 Local File Store'}`);
        console.log(`📁 Static Web Files: ${PUBLIC_DIR}`);
        console.log('--------------------------------------------------------');
        console.log('Available REST APIs:');
        console.log(` - Health Status:       GET  /api/health`);
        console.log(` - Questions Bank:      GET  /api/questions`);
        console.log(` - Student Attempts:    GET  /api/attempts`);
        console.log(` - Candidate Register:  POST /api/auth/register`);
        console.log(` - Candidate Login:     POST /api/auth/candidate-login`);
        console.log(` - Examiner Admin Login: POST /api/auth/examiner-login`);
        console.log('========================================================');
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        if (pgPool) pgPool.end();
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT received, closing server...');
    server.close(() => {
        if (pgPool) pgPool.end();
        process.exit(0);
    });
});
