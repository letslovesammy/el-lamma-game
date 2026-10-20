
const homeScreen = document.getElementById("homeScreen");
const categoryScreen = document.getElementById("categoryScreen");
const questionScreen = document.getElementById("questionScreen");

const startButton = document.getElementById("startButton");
const backButton = document.getElementById("backButton");
const categoriesButton = document.getElementById("categoriesButton");
const revealButton = document.getElementById("revealButton");
const nextButton = document.getElementById("nextButton");

let questions = [
    {
        category: "Triple Translation",
        question: "I accompany you permanently",
        answer: "تملي معاك",
        difficulty: "Easy",
        points: 100
    },
    {
        category: "Triple Translation",
        question: "The light of my eyes",
        answer: "نور العين",
        difficulty: "Medium",
        points: 200
    },
    {
        category: "Formal Language",
        question: "أنا أحبك بشدة",
        answer: "بحبك موت",
        difficulty: "Easy",
        points: 100
    },
    {
        category: "Complete the Saying",
        question: "اللي اختشوا...",
        answer: "ماتوا",
        difficulty: "Easy",
        points: 100
    },
    {
        category: "Emoji Cinema",
        question: "🐘🔵",
        answer: "الفيل الأزرق",
        difficulty: "Easy",
        points: 100
    }
];

let currentCategory = "";
let currentQuestion = null;
let usedQuestions = [];

startButton.addEventListener("click", function() {
    homeScreen.classList.add("hidden");
    categoryScreen.classList.remove("hidden");
});

backButton.addEventListener("click", function() {
    categoryScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
});

document.querySelectorAll(".categoryButton").forEach(function(button) {
    button.addEventListener("click", function() {
        currentCategory = button.dataset.category;
        categoryScreen.classList.add("hidden");
        questionScreen.classList.remove("hidden");
        showQuestion();
    });
});

function showQuestion() {
    const available = questions.filter(function(q, index) {
        return q.category === currentCategory &&
               !usedQuestions.includes(index);
    });

    if (available.length === 0) {
        document.getElementById("questionText").textContent =
            "🎉 No more questions in this category!";
        document.getElementById("answerBox").classList.add("hidden");
        revealButton.classList.add("hidden");
        nextButton.classList.add("hidden");
        return;
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    currentQuestion = available[randomIndex];

    usedQuestions.push(questions.indexOf(currentQuestion));

    document.getElementById("categoryTitle").textContent = currentCategory;
    document.getElementById("questionText").textContent = currentQuestion.question;
    document.getElementById("answerText").textContent = currentQuestion.answer;
    document.getElementById("pointsText").textContent =
        currentQuestion.difficulty + " — " + currentQuestion.points + " points";

    document.getElementById("answerBox").classList.add("hidden");
    revealButton.classList.remove("hidden");
    nextButton.classList.remove("hidden");
}

revealButton.addEventListener("click", function() {
    document.getElementById("answerBox").classList.remove("hidden");
});

nextButton.addEventListener("click", showQuestion);

categoriesButton.addEventListener("click", function() {
    questionScreen.classList.add("hidden");
    categoryScreen.classList.remove("hidden");
});

const csvFile = document.getElementById("csvFile");
const importStatus = document.getElementById("importStatus");

csvFile.addEventListener("change", async function() {
    const file = csvFile.files[0];

    if (!file) return;

    const text = await file.text();

    const rows = parseCSV(text);
    const data = rows.slice(1);

    const importedQuestions = data
        .filter(row => row.length >= 9 && row[3].trim())
        .map(row => ({
            id: row[0],
            category: row[1].trim(),
            difficulty: row[2].trim(),
            question: row[3],
            answer: row[4],
            hint: row[5],
            mediaType: row[6],
            mediaFile: row[7],
            points: Number(row[8]) || 0,
            notes: row[9] || ""
        }));

    if (importedQuestions.length === 0) {
        importStatus.textContent = "No valid questions found!";
        return;
    }

    questions = importedQuestions;
    usedQuestions = [];

    importStatus.textContent =
        `✅ Imported ${questions.length} questions!`;
});

function parseCSV(text) {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            if (inQuotes && text[i + 1] === '"') {
                field += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            row.push(field);
            field = "";
        } else if ((char === "\n" || char === "\r") && !inQuotes) {
            if (char === "\r" && text[i + 1] === "\n") i++;

            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += char;
        }
    }

    if (field || row.length) {
        row.push(field);
        rows.push(row);
    }

    return rows;
}


async function loadQuestions() {
    try {
        const response = await fetch("questions.csv");

        if (!response.ok) {
            throw new Error("Could not load questions");
        }

        const text = await response.text();
        const rows = parseCSV(text);

        const importedQuestions = rows.slice(1)
            .filter(row => row.length >= 9 && row[3].trim())
            .map(row => ({
                id: row[0],
                category: row[1].trim(),
                difficulty: row[2].trim(),
                question: row[3],
                answer: row[4],
                hint: row[5],
                mediaType: row[6],
                mediaFile: row[7],
                points: Number(row[8]) || 0,
                notes: row[9] || ""
            }));

        if (importedQuestions.length === 0) {
            throw new Error("No questions found");
        }

        questions = importedQuestions;
        usedQuestions = [];

        importStatus.textContent =
            `✅ Loaded ${questions.length} questions!`;

        startButton.disabled = false;

    } catch (error) {
        importStatus.textContent =
            "Automatic loading unavailable. Import CSV manually.";
    }
}

startButton.disabled = true;
loadQuestions();
