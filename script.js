// ========== SELECT ELEMENTS ==========
const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const resultContainer = document.querySelector(".result-container");

const answerOptions = document.querySelector(".answer-options");
const nextQuestionBtn = document.querySelector(".next-question-btn");
const questionStatus = document.querySelector(".question-status");
const timerDisplay = document.querySelector(".time-duration");

// ========== QUIZ STATE ==========
const QUIZ_TIME_LIMIT = 15;
let currentTime = QUIZ_TIME_LIMIT;
let timer = null;

let quizCategory = "";
let numberOfQuestions = 5;
let currentQuestion = null;
let correctAnswersCount = 0;
const questionsIndexHistory = [];

// ========== QUESTIONS BANK ==========
const questions = [
    {
        category: "Project Management",
        questions: [
            {
                question: "During what part of the 20th century did Project Management emerge as a profession?",
                options: ["1940-1950", "1920-1930", "1930-1940", "1910-1920", "1960-1970"],
                correctAnswer: 0,
            },
            {
                question: "What is the average rounded salary made by a Project Manager?",
                options: ["$91,000", "$86,000", "$96,000", "$95,000", "$100,000"],
                correctAnswer: 2,
            },
            {
                question: "What degree do you need to be a Project Manager?",
                options: ["None", "Doctorate", "Associates", "Trade School", "Bachelors"],
                correctAnswer: 4,
            },
            {
                question: "When did project management start using computers?",
                options: ["1980-1990", "1950-1960", "1970-1980", "1990-2000", "1940-1950"],
                correctAnswer: 0,
            },
            {
                question: "When did project management start utilizing cloud storage?",
                options: ["1990", "1980", "1970", "2000", "2010"],
                correctAnswer: 0,
            },
        ],
    },
    {
        category: "Software",
        questions: [
            {
                question: "What Microsoft Software is used to create spreadsheets?",
                options: ["Word", "Excel", "Microsoft Project", "Outlook", "Microsoft Planner"],
                correctAnswer: 1,
            },
            {
                question: "What is the most popular Microsoft software?",
                options: ["Teams", "Word", "Excel", "Outlook", "Microsoft Planner"],
                correctAnswer: 0,
            },
            {
                question: "What is the most popular software operating system?",
                options: ["iOS", "Windows", "macOS", "Linux", "Unix"],
                correctAnswer: 3,
            },
            {
                question: "What software operating system is used for iMac?",
                options: ["iOS", "Windows", "Linux", "Unix", "macOS"],
                correctAnswer: 4,
            },
            {
                question: "What is the name of the application store on iOS devices?",
                options: ["App Store", "Google Play Store", "Microsoft Store", "Playstation Store", "Xbox Store"],
                correctAnswer: 0,
            },
        ],
    },
    {
        category: "Hardware",
        questions: [
            {
                question: "What is the largest SSD you can acquire?",
                options: ["122.88TB", "100TB", "50TB", "40TB", "500TB"],
                correctAnswer: 0,
            },
            {
                question: "What is the most secure storage type?",
                options: ["SSD", "Cloud Storage", "Flash Drive", "Flash Memory", "Optical Storage"],
                correctAnswer: 1,
            },
            {
                question: "What type of DVD drive is typically used in a computer?",
                options: ["Optical Disk Drive", "Floppy Disk Drive", "4K Disk Drive", "Blue Ray Drive", "CD Drive"],
                correctAnswer: 0,
            },
            {
                question: "When did computers start using optical disk drives?",
                options: ["1979", "1978", "1980", "1976", "1987"],
                correctAnswer: 4,
            },
            {
                question: "What year did hardware manufacturing companies start making floppy disks for the public?",
                options: ["1960", "1950", "1961", "1971", "1963"],
                correctAnswer: 3,
            },
        ],
    },
    {
        category: "Computer Languages",
        questions: [
            {
                question: "What is the first computer language?",
                options: ["FORTRAN", "Python", "C++", "Java", "JavaScript"],
                correctAnswer: 0,
            },
            {
                question: "What is the most used coding language of 2025 currently?",
                options: ["Python", "FORTRAN", "Java", "JavaScript", "C++"],
                correctAnswer: 0,
            },
            {
                question: "What year was Python first released?",
                options: ["2000", "1998", "1991", "1999", "1993"],
                correctAnswer: 2,
            },
            {
                question: "What year was JavaScript released?",
                options: ["1960", "1998", "1970", "1990", "1995"],
                correctAnswer: 4,
            },
            {
                question: "What year was FORTRAN first released?",
                options: ["1967", "1957", "1947", "1956", "1966"],
                correctAnswer: 1,
            },
        ],
    },
    {
        category: "Computer History",
        questions: [
            {
                question: "What decade was the first computer made?",
                options: ["1930s", "1940s", "1950s", "1960s", "1970s"],
                correctAnswer: 0,
            },
            {
                question: "What year did Apple make their first computer?",
                options: ["1975", "1976", "1977", "1978", "2000"],
                correctAnswer: 1,
            },
            {
                question: "What year did HP produce their first computer?",
                options: ["1966", "1981", "1976", "1980", "1940"],
                correctAnswer: 0,
            },
            {
                question: "What year did Dell produce their first computer?",
                options: ["1981", "1966", "1984", "1995", "2000"],
                correctAnswer: 2,
            },
            {
                question: "What year was the first laptop released?",
                options: ["1980", "1970", "1960", "1972", "1981"],
                correctAnswer: 4,
            },
        ],
    }
];

// ========== FUNCTIONS ==========

// Start and manage the countdown timer
const startTimer = () => {
    clearInterval(timer);
    currentTime = QUIZ_TIME_LIMIT;
    timerDisplay.textContent = `${currentTime}s`;

    timer = setInterval(() => {
        currentTime--;
        timerDisplay.textContent = `${currentTime}s`;

        if (currentTime <= 0) {
            clearInterval(timer);
            highlightCorrectAnswer();
            nextQuestionBtn.style.visibility = "visible";
            quizContainer.querySelector(".quiz-timer").style.background = "#c31402";

            answerOptions.querySelectorAll("li").forEach(option => {
                option.style.pointerEvents = "none";
            });
        }
    }, 1000);
};

// Get a random question that hasn't been used yet
const getRandomQuestion = () => {
    const categoryObj = questions.find(cat => cat.category.toLowerCase() === quizCategory.toLowerCase());
    if (!categoryObj) return null;

    const categoryQuestions = categoryObj.questions;

    if (questionsIndexHistory.length >= Math.min(categoryQuestions.length, numberOfQuestions)) {
        return showQuizResult();
    }

    const availableQuestions = categoryQuestions.filter((_, index) => !questionsIndexHistory.includes(index));
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
    return randomQuestion;
};

// Show the result screen
const showQuizResult = () => {
    quizContainer.style.display = "none";
    resultContainer.style.display = "block";
    document.querySelector(".result-message").innerHTML = `You answered <b>${correctAnswersCount}</b> out of <b>${numberOfQuestions}</b> questions correctly. Great effort!`;
};

// Highlight correct answer
const highlightCorrectAnswer = () => {
    const correctOption = answerOptions.querySelectorAll("li")[currentQuestion.correctAnswer];
    correctOption.classList.add("correct");
    correctOption.insertAdjacentHTML("beforeend", `<span class="material-symbols-rounded">check_circle</span>`);
};

// Handle user selecting an answer
const handleAnswer = (option, answerIndex) => {
    clearInterval(timer);

    const isCorrect = currentQuestion.correctAnswer === answerIndex;
    option.classList.add(isCorrect ? 'correct' : 'incorrect');
    !isCorrect ? highlightCorrectAnswer() : correctAnswersCount++;

    const iconHTML = `<span class="material-symbols-rounded">${isCorrect ? 'check_circle' : 'cancel'}</span>`;
    option.insertAdjacentHTML("beforeend", iconHTML);

    answerOptions.querySelectorAll("li").forEach(opt => {
        opt.style.pointerEvents = "none";
    });

    nextQuestionBtn.style.visibility = "visible";
};

// Render current question
const renderQuestion = () => {
    currentQuestion = getRandomQuestion();
    if (!currentQuestion) return;

    answerOptions.innerHTML = "";
    nextQuestionBtn.style.visibility = "hidden";
    quizContainer.querySelector(".quiz-timer").style.background = "#32313C";

    document.querySelector(".quiz-question").textContent = currentQuestion.question;
    questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> of <b>${numberOfQuestions}</b> Questions`;

    currentQuestion.options.forEach((option, index) => {
        const li = document.createElement("li");
        li.classList.add("answer-option");
        li.textContent = option;
        answerOptions.appendChild(li);
        li.addEventListener("click", () => handleAnswer(li, index));
    });

    startTimer();
};

// Start quiz
const startQuiz = () => {
    configContainer.style.display = "none";
    quizContainer.style.display = "block";

    quizCategory = configContainer.querySelector(".category-option.active").textContent;
    numberOfQuestions = parseInt(configContainer.querySelector(".question-option.active")?.textContent || "5");

    renderQuestion();
};

// Reset quiz
const resetQuiz = () => {
    clearInterval(timer);
    correctAnswersCount = 0;
    questionsIndexHistory.length = 0;

    configContainer.style.display = "block";
    quizContainer.style.display = "none";
    resultContainer.style.display = "none";
};

// ========== EVENT LISTENERS ==========

// Category selection
document.querySelectorAll(".category-option").forEach(option => {
    option.addEventListener("click", () => {
        option.parentNode.querySelectorAll(".category-option").forEach(btn => btn.classList.remove("active"));
        option.classList.add("active");
    });
});

// Question number selection
document.querySelectorAll(".question-option").forEach(option => {
    option.addEventListener("click", () => {
        option.parentNode.querySelectorAll(".question-option").forEach(btn => btn.classList.remove("active"));
        option.classList.add("active");
    });
});

nextQuestionBtn.addEventListener("click", renderQuestion);
document.querySelector(".start-quiz-btn").addEventListener("click", startQuiz);
document.querySelector(".try-again-btn").addEventListener("click", resetQuiz);


/*
const configContainer = document.querySelector(".config-container");
const quizContainer = document.querySelector(".quiz-container");
const answerOptions = document.querySelector(".answer-options");
const nextQuestionBtn = document.querySelector(".next-question-btn");
const questionStatus = document.querySelector(".question-status");
const timerDisplay = document.querySelector(".time-duration");
const resultContainer = document.querySelector(".result-container");

// Quiz state variables
const QUIZ_TIME_LIMIT = 10;
let currentTime = QUIZ_TIME_LIMIT;
let timer = null;
let quizCategory=".category-options";
let numberOfQuestions = 5;
let currentQuestion = null;
const questionsIndexHistory = [];
let correctAnswersCount = 0;

// Display the quiz result and hide the quiz container
const showQuizResult = () => {
    quizContainer.style.display = "none";
    resultContainer.style.display = "block";

    const resultText =  `You answered <b>${correctAnswersCount}</b> out of <b>${numberOfQuestions}</b> questions correctly. Great effort!`;
    document.querySelector(".result-message").innerHTML = resultText;
}

// Clear and rest the timer
const resetTimer = () => {
    clearInterval(timer);
    currentTime = QUIZ_TIME_LIMIT;
    timerDisplay.textContent = `${currentTime}s`;
}

// Initialize and start the timer for the current qustion
const startTimer = () => {
    timer = setInterval(() => {
        currentTime--;
        timerDisplay.textContent = `${currentTime}s`;

        if(currentTime <= 0) {
            clearInterval(timer);
            highlightCorrectAnswer();
            nextQuestionBtn.style.visibility = "visible";
            quizContainer.querySelector(".quiz-timer").style.background = "#c31402";

            // Disable all answer options after one option is selected
            answerOptions.querySelectorAll("li").forEach(option => option.style.pointerEvents = "none");
        }
    }, 1000);
}

// Fetch a random quesiton based on the selected category
const getRandomQuestion = () => {
  const categoryObj = questions.find(cat => cat.category.toLowerCase() === quizCategory.toLowerCase());
  
  if (!categoryObj) {
      console.error("Category not found:", quizCategory);
      return null;
  }
  
  const categoryQuestions = categoryObj.questions;

  if (questionsIndexHistory.length >= Math.min(categoryQuestions.length, numberOfQuestions)) {
      return showQuizResult();
  }

  const availableQuestions = categoryQuestions.filter((_, index) => !questionsIndexHistory.includes(index));
  const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  
  questionsIndexHistory.push(categoryQuestions.indexOf(randomQuestion));
  return randomQuestion;
};

// Highlight the correct answer option and add icon
const highlightCorrectAnswer = () => {
    const correctOption = answerOptions.querySelectorAll(".answer-options")[currentQuestion.correctAnswer];
    correctOption.classList.add("correct");
    const iconHTML = `<span class="material-symbols-rounded">check_circle</span>`;
    correctOption.insertAdjacentHTML("beforeend", iconHTML);
}

// Handle the user's answer selection
const handleAnswer = (option, answerIndex) => {
    clearInterval(timer);

    const isCorrect = currentQuestion.correctAnswer === answerIndex;
    option.classList.add(isCorrect ? 'correct' : 'incorrect');
    !isCorrect ? highlightCorrectAnswer() : correctAnswersCount++;

    // Insert icon based on correctness
    const iconHTML = `<span class="material-symbols-rounded">${ isCorrect ? 'check_circle' : 'cancel'}</span>`;
    option.insertAdjacentHTML("beforeend", iconHTML);

    // Disable all answer options after one option is selected
    answerOptions.querySelectorAll("li").forEach(option => {
      option.style.pointerEvents = "none";
    });

    nextQuestionBtn.style.visibility = "visible";
}

// Render the current question and its options in the quiz
const renderQuestion = () => {
    //getRandomQuestion() = currentQuestion;
    currentQuestion = getRandomQuestion();
    if(!currentQuestion) return;

    resetTimer();
    startTimer();

    // Update the UI
    answerOptions.innerHTML = "";
    nextQuestionBtn.style.visibility = "hidden";
    quizContainer.querySelector(".quiz-timer").style.background = "#32313C";
    document.querySelector(".quiz-question").textContent = currentQuestion.question;
    questionStatus.innerHTML = `<b>${questionsIndexHistory.length}</b> of <b>${numberOfQuestions}</b> Questions`;

    // Create option <li> elements and append them and add click event listeners
    currentQuestion.options.forEach((option, index) => {
        const li = document.createElement("li");
        li.classList.add("answer-options");
        li.textContent = option;
        answerOptions.appendChild(li);
        li.addEventListener("click", () => handleAnswer(li, index));
    });
}

// Start quiz and render the random question
const startQuiz = () => {
    configContainer.style.display = "none";
    quizContainer.style.display = "block";

    quizCategory = configContainer.querySelector(".category-option.active").textContent;
    numberOfQuestions = 5;
    renderQuestion();
}

// Highlight the selected option on click - category
document.querySelectorAll(".catgory-option").forEach(option => {
    option.addEventListener("click", () => {
        option.parentNode.querySelector(".active").classList.remove("active");
        option.classList.add("active");
    });
});

// Reseet the quiz and return to the configuration container
const resetQuiz = () => {
    resetTimer();
    correctAnswersCount = 0;
    questionsIndexHistory.length = 0;
    configContainer.style.display = "block";
    resultContainer.style.display = "none";
}

renderQuestion();

nextQuestionBtn.addEventListener("click", renderQuestion);
document.querySelector(".try-again-btn").addEventListener("click", resetQuiz);
document.querySelector(".start-quiz-btn").addEventListener("click", startQuiz);

const questions = [
    {
      category: "Project Management",
      questions: [
        {
          question: "During what part of the 20th century did Project Management emerge as a profession?",
          options: ["1940-1950", "1920-1930", "1930-1940", "1910-1920", "1960-1970"],
          correctAnswer: 0,
        },
        {
          question: "What is the average rounded salary made by a Project Manager?",
          options: ["$91,000", "$86,000", "$96,000", "$95,000", "$100,000"],
          correctAnswer: 2,
        },
        {
          question: "What degree do you need to be a Project Manager?",
          options: ["None", "Doctorate", "Associates", "Trade School", "Bachelors"],
          correctAnswer: 4,
        },
        {
          question: "When did project management start using computers? ",
          options: ["1980-1990", "1950-1960", "1970-1980", "1990-2000","1940-1950"],
          correctAnswer: 0,
        },
        {
          question: "When did project management start utilizing cloud storage?",
          options: ["1990", "1980", "1970", "2000", "2010"],
          correctAnswer: 0,
        },
      ],
    },
  
    {
      category: "Software",
      questions: [
        {
          question: "What Microsoft Software is used to create spreadsheets?",
          options: ["Word", "Excel", "Microsoft Project", "Outlook", "Microsoft Planner"],
          correctAnswer: 1,
        },
        {
          question: "What is the most popular Microsoft software?",
          options: ["Teams", "Word", "Excel", "Outlook", "Microsoft Planner"],
          correctAnswer: 0,
        },
        {
          question: "What is the most popular software operating system?",
          options: ["iOS", "Windows", "macOS", "Linux", "Unix"],
          correctAnswer: 3,
        },
        {
          question: "What software operating system is used for iMac?",
          options: ["iOS", "Windows", "Linux", "Unix", "macOS"],
          correctAnswer: 4,
        },
        {
          question: "What is the name of the application store on iOS devices?",
          options: ["App Store", "Google Play Store", "Microsoft Store", "Playstation Store", "Xbox Store"],
          correctAnswer: 0,
        },
      ],
    },
  
    {
      category: "Hardware",
      questions: [
        {
          question: "What is the largest SSD you can aqquire?",
          options: ["122.88TB", "100TB", "50TB", "40TB", "500TB"],
          correctAnswer: 0,
        },
        {
          question: "What is the most secure storage type?",
          options: ["SSD", "Cloud Storage", "Flash Drive", "Flash Memory", "Optical Storage"],
          correctAnswer: 1,
        },
        {
          question: "What type of DVD drive is typically used in a computer?",
          options: ["Optical Disk Drive", "Floppy Disk Drive", "4K Disk Drive", "Blue Ray Drive", "CD Drive"],
          correctAnswer: 0,
        },
        {
          question: "When did computers start using optical disk drives?",
          options: ["1979", "1978", "1980", "1976", "1987"],
          correctAnswer: 4,
        },
        {
          question: "What year did hardware manufacturing companies start making floppy disks for the public?",
          options: ["1960", "1950", "1961", "1971", "1963"],
          correctAnswer: 3,
        },
      ],
    },
  
    {
      category: "Computer Languages",
      questions: [
        {
          question: "What is the first computer language",
          options: ["FORTRAN", "Python", "C++", "Java", "JavaScript"],
          correctAnswer: 0,
        },
        {
          question: "What is the most used coding language of 2025 currently?",
          options: ["Python", "FORTRAN", "Java", "JavaScript", "C++"],
          correctAnswer: 0,
        },
        {
          question: "What year was Python first released?",
          options: ["2000", "1998", "1991", "1999", "1993"],
          correctAnswer: 2,
        },
        {
          question: "What year was JavaScript released?",
          options: ["1960", "1998", "1970", "1990", "1995"],
          correctAnswer: 4,
        },
        {
          question: "What year was FORTRAN first released?",
          options: ["1967", "1957", "1947", "1956", "1966"],
          correctAnswer: 1,
        },
      ],
    },
  
    {
      category: "Computer History",
      questions: [
        {
          question:"What decade was the first computer made?",
          options: ["1930s", "1940s", "1950s", "1960s", "1970s"],
          correctAnswer: 0,
        },
        {
          question:"What year did apple make their first computer?",
          options: ["1975", "1976", "1977", "1978", "2000"],
          correctAnswer: 1,
        },
        {
          question:"What year did HP produce their first computer?",
          options: ["1966", "1981", "1976", "1980", "1940"],
          correctAnswer: 0,
        },
        {
          question:"What year did Dell Produce their first computer?",
          options: ["1981", "1966", "1984", "1995", "2000"],
          correctAnswer: 1,
        },
        {
          question:"What year was the first laptop released?",
          options: ["1980", "1970", "1960", "1972", "1981"],
          correctAnswer: 4,
        },
      ]
    }
  ];
*/