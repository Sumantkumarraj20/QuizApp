// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD4sWIxV-uQBUkIaBY3JcOAgMrmSdDPees",
    authDomain: "quizeguide.firebaseapp.com",
    projectId: "quizeguide",
    storageBucket: "quizeguide.firebasestorage.app",
    messagingSenderId: "688415775599",
    appId: "1:688415775599:web:0c805d3053eef487eca69a",
    measurementId: "G-MWZD22DB5V"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // App state
  let currentUser = null;
  let questions = [];
  let currentQuestionIndex = 0;
  let userAnswers = [];
  let selectedOption = null;
  let selectedConfidence = 3;
  
  // DOM elements
  const authScreen = document.getElementById('auth-screen');
  const quizScreen = document.getElementById('quiz-screen');
  const resultsScreen = document.getElementById('results-screen');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegister = document.getElementById('show-register');
  const showLogin = document.getElementById('show-login');
  
  // Initialize the app
  function init() {
    setupEventListeners();
    checkAuthState();
  }
  
  // Event listeners
  function setupEventListeners() {
    // Auth events
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('register-btn').addEventListener('click', register);
    showRegister.addEventListener('click', () => toggleAuthForms(true));
    showLogin.addEventListener('click', () => toggleAuthForms(false));
    
    // Quiz events
    document.getElementById('submit-btn').addEventListener('click', submitAnswer);
    document.getElementById('next-btn').addEventListener('click', nextQuestion);
    document.getElementById('restart-btn').addEventListener('click', restartQuiz);
    
    // Confidence rating
    document.querySelectorAll('.confidence-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.confidence-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedConfidence = parseInt(e.target.dataset.rating);
      });
    });
  }
  
  // Check auth state
  function checkAuthState() {
    auth.onAuthStateChanged(user => {
      if (user) {
        currentUser = user;
        loadQuiz();
      } else {
        showAuthScreen();
      }
    });
  }
  
  // Auth functions
  function toggleAuthForms(showRegister) {
    if (showRegister) {
      loginForm.classList.add('d-none');
      registerForm.classList.remove('d-none');
    } else {
      registerForm.classList.add('d-none');
      loginForm.classList.remove('d-none');
    }
  }
  
  async function login() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      alert(error.message);
    }
  }
  
  async function register() {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
      await auth.createUserWithEmailAndPassword(email, password);
    } catch (error) {
      alert(error.message);
    }
  }
  
  // Quiz functions
  async function loadQuiz() {
    try {
      // Load questions from Firestore
      const snapshot = await db.collection('questions').get();
      questions = snapshot.docs.map(doc => doc.data());
      
      if (questions.length === 0) {
        throw new Error('No questions available');
      }
      
      showQuizScreen();
      showQuestion();
    } catch (error) {
      alert(error.message);
      auth.signOut();
    }
  }
  
  function showQuestion() {
    if (currentQuestionIndex >= questions.length) {
      showResults();
      return;
    }
    
    const question = questions[currentQuestionIndex];
    document.getElementById('question-text').textContent = question.text;
    
    // Clear previous options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    // Add new options
    question.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.className = 'btn btn-outline-primary w-100 option-btn';
      button.textContent = option;
      button.addEventListener('click', () => selectOption(index));
      optionsContainer.appendChild(button);
    });
    
    // Reset UI
    document.getElementById('explanation').classList.add('d-none');
    document.getElementById('confidence-rating').classList.add('d-none');
    document.getElementById('submit-btn').classList.remove('d-none');
    document.getElementById('next-btn').classList.add('d-none');
    selectedOption = null;
    
    // Update progress
    updateProgressBar();
  }
  
  function selectOption(index) {
    if (selectedOption !== null) {
      document.querySelectorAll('.option-btn')[selectedOption].classList.remove('selected');
    }
    selectedOption = index;
    document.querySelectorAll('.option-btn')[index].classList.add('selected');
  }
  
  async function submitAnswer() {
    if (selectedOption === null) {
      alert('Please select an answer');
      return;
    }
    
    const question = questions[currentQuestionIndex];
    const isCorrect = question.options[selectedOption] === question.answer;
    
    // Save user answer
    userAnswers.push({
      questionId: question.id,
      answer: question.options[selectedOption],
      isCorrect,
      confidence: isCorrect ? selectedConfidence : null
    });
    
    // Show explanation
    const explanationEl = document.getElementById('explanation');
    explanationEl.textContent = question.explanation || 'No explanation available';
    explanationEl.classList.remove('d-none');
    
    // Highlight correct/incorrect answers
    const correctIndex = question.options.findIndex(opt => opt === question.answer);
    document.querySelectorAll('.option-btn')[correctIndex].classList.add('correct');
    
    if (!isCorrect) {
      document.querySelectorAll('.option-btn')[selectedOption].classList.add('incorrect');
    }
    
    // Show confidence rating if correct
    if (isCorrect) {
      document.getElementById('confidence-rating').classList.remove('d-none');
    }
    
    // Update UI
    document.getElementById('submit-btn').classList.add('d-none');
    document.getElementById('next-btn').classList.remove('d-none');
    
    // Save progress to Firestore
    await saveProgress();
  }
  
  function nextQuestion() {
    currentQuestionIndex++;
    showQuestion();
  }
  
  function showResults() {
    const correctCount = userAnswers.filter(a => a.isCorrect).length;
    const percentage = Math.round((correctCount / questions.length) * 100);
    
    document.getElementById('results-stats').innerHTML = `
      <p>You answered ${correctCount} out of ${questions.length} questions correctly.</p>
      <p>Score: ${percentage}%</p>
    `;
    
    quizScreen.classList.add('d-none');
    resultsScreen.classList.remove('d-none');
  }
  
  function restartQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    resultsScreen.classList.add('d-none');
    quizScreen.classList.remove('d-none');
    showQuestion();
  }
  
  function updateProgressBar() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
    document.getElementById('progress-bar').setAttribute('aria-valuenow', progress);
  }
  
  async function saveProgress() {
    if (!currentUser) return;
    
    try {
      await db.collection('userProgress').doc(currentUser.uid).set({
        answers: userAnswers,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  }
  
  // Screen management
  function showAuthScreen() {
    authScreen.classList.remove('d-none');
    quizScreen.classList.add('d-none');
    resultsScreen.classList.add('d-none');
  }
  
  function showQuizScreen() {
    authScreen.classList.add('d-none');
    quizScreen.classList.remove('d-none');
    resultsScreen.classList.add('d-none');
  }
  
  // Initialize the app
  init();