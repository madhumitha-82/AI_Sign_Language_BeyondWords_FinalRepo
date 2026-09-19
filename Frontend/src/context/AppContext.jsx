import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { userApi, analyticsApi, learningApi } from "../lib/api";
import { getToken, setToken, getRefresh, setRefresh, getUser, setUser, clearAll } from "../lib/tokenStorage";

const AppContext = createContext();

const defaultUser = {
  name: "Guest",
  username: "guest",
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  streak: 0,
  accuracy: 0,
  joinedDate: new Date().toISOString().split("T")[0],
  avatar: null,
};


// Heatmap mock data generator
const generateHeatmapData = () => {
  return {};
};


const buildInitialState = (savedUser) => ({
  isAuthenticated: !!getToken(),
  authStep: "landing",
  user: savedUser || defaultUser,
  progress: {
    completedLessons: [],
    quizScores: {},
    expandedModules: [1],
    activeLesson: null,
  },
  history: {
    learning: [],
    quizAttempts: [],
    searches: [],
    speechSessions: [],
  },
  settings: {
    theme: "dark",
    notifications: true,
    soundEffects: true,
    language: "English",
  },
  heatmap: generateHeatmapData(),
  modules: [],
  levels: [],
  quizQuestions: [],
  quizCategories: [],
});

const initialAppState = buildInitialState(getUser());

const translations = {
  English: {
    // General / Sidebar
    dashboard: "Dashboard",
    practice: "Practice",
    recognition: "Sign Recognition",
    settings: "Settings",
    logout: "Log Out",
    learn: "Learn",
    speechHub: "Speech Hub",
    speechToText: "Speech to Text",
    textToSpeech: "Text to Speech",
    quiz: "Quiz",
    leaderboard: "Leaderboard",
    history: "History",
    searchPlaceholder: "Search lessons, modules, quizzes...",
    
    // Syllabus Page
    syllabus: "ASL Learning Syllabus",
    syllabusDesc: "Master American Sign Language step-by-step from foundations to fluid conversations.",
    continueLearning: "Continue Learning",
    recommended: "Recommended For You",
    struggledNumbers: "Because you struggled with Numbers...",
    popularWeek: "Popular This Week",
    lessonsProgress: "Lessons Progress",
    lessonsFinished: "lessons finished",
    reviewModule: "Review Module",
    startModule: "Start Module",
    locked: "Locked",
    activeCourse: "Active Course Module",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    module: "Module",
    lessons: "Lessons",
    hours: "hours",
    
    // Settings Page
    settingsTitle: "System Settings",
    settingsDesc: "Customize notifications, sound triggers, local language translation defaults, and account visibility.",
    accountTab: "Account",
    appearanceTab: "Appearance",
    notificationsTab: "Notifications",
    privacyTab: "Privacy",
    languageTab: "Language",
    accountCredentials: "Account Credentials",
    fullName: "Full Name",
    username: "Username",
    emailAddress: "Email Address",
    registeredDate: "Registered Date",
    interfaceAppearance: "Interface Appearance",
    colorTheme: "Color Theme",
    alertConfigs: "Alert Configurations",
    systemAlerts: "System Alerts",
    streakReminder: "Receive reminders for study streaks",
    hapticAudio: "Haptic & Audio Effects",
    clickFeedback: "Play click feedback on quiz answer choices",
    privacySettings: "Privacy Settings",
    leaderboardVisibility: "Public Leaderboard Visibility",
    leaderboardDesc: "Display your profile username on Arena ranks",
    localizationDefaults: "Localization Defaults",
    systemTranslation: "System translation",
    saveChanges: "Save Changes",
    settingsVersion: "Settings Page v1.0",
    
    // Quiz Page
    levelBasedQuiz: "Level-based Quiz",
    levelBasedQuizDesc: "Structured levels — unlock the next by mastering the last.",
    level: "Level",
    progress: "Progress",
    retry: "Retry",
    start: "Start",
    questions: "questions",
    questionProgress: "Question {current} of {total}",
    timer: "Timer",
    visualStimulus: "Visual Stimulus",
    nextQuestion: "Next Question",
    viewResults: "View Results",
    quizCompleted: "Quiz Completed!",
    quizCompletedDesc: "Fantastic job. You finished the quiz attempt.",
    xpEarned: "XP Earned",
    accuracy: "Accuracy",
    badgeUnlockedPerfect: "Badge Unlocked: Perfect 100",
    perfectScoreDesc: "Perfect score in ASL trivia",
    claimed: "Claimed",
    chooseAnotherLevel: "Choose Another Level",
    tryAgain: "Try Again",
    levelTitle1: "Alphabet Basics",
    levelTitle2: "Greetings",
    levelTitle3: "Numbers 1-10",
    levelTitle4: "Family",
    levelTitle5: "Colors",
    levelTitle6: "Numbers 11-20",
    levelTitle7: "Daily Actions",
    levelTitle8: "Food",
    levelTitle9: "Travel",
    levelTitle10: "Emergency",
    levelTitle11: "Medical",
    levelTitle12: "Conversation",

    // Dashboard Page
    welcomeBack: "Welcome back, {name}! 👋",
    streakDescription: "You have a {streak}-day streak going. Earn 100+ XP daily to maintain your streak! Keep up the momentum and reach your goals today.",
    streak: "Streak",
    plusToday: "+{count} today",
    levelN: "Level {n} — Expert",
    plusThisWeek: "+{percent}% this week",
    lessonsDone: "Lessons Done",
    countThisWeek: "{count} this week",
    levelProgression: "Level Progression",
    dailyGoal: "Daily Goal",
    dailyGoalDesc: "Finish 5 lessons or quizzes today",
    completedToday: "{completed} of {total} completed today",
    weeklyProgress: "Weekly Progress",
    daysGoal: "{current} / {total} days",
    aiRecommendations: "AI Recommendations",
    aiActive: "AI Active",
    recentActivity: "Recent Activity",
    viewHistory: "View History",
    noRecentActivity: "No recent activity. Start learning!",
    achievements: "Achievements",
    seeAll: "See All",
    dashboardLevelTitle1: "Foundations",
    dashboardLevelDesc1: "Mastered basic hand shapes",
    dashboardLevelTitle2: "Basic Signs",
    dashboardLevelDesc2: "Daily greetings and common objects",
    dashboardLevelTitle3: "Numbers & Letters",
    dashboardLevelDesc3: "Complete Level 2 to unlock",
    dashboardLevelTitle4: "Common Phrases",
    dashboardLevelDesc4: "Simple statements and question forms",
    recTitle1: "Fingerspelling J-M",
    recReason1: "Reinforces Hand Shapes Part 2",
    recTitle2: "Greetings Review",
    recReason2: "Recommended based on quiz accuracy",

    // Speech pages
    speechToTextTitle: "Speech to Text",
    speechToTextDesc: "Convert your spoken voice to live text formatting to practice vocal translations of sign patterns.",
    stopTranscription: "Tap button to stop transcription",
    startRecording: "Tap button to start recording",
    transcriptionFeed: "Transcription Feed",
    transcriptionPlaceholder: "A transcription of your spoken language will appear here word-by-word once you begin recording.",
    copied: "Copied",
    copy: "Copy",
    savedToHistory: "Saved to History",
    saveSession: "Save Session",
    textToSpeechTitle: "Text to Speech",
    textToSpeechDesc: "Type text or choose a recommended phrase to synthesize spoken audio. Match speech patterns with manual letters.",
    suggestedPhrases: "Suggested Phrases",
    typeHerePlaceholder: "Type English text to synthesize here...",
    voiceParams: "Voice Parameters",
    voiceSynthesizer: "Voice Synthesizer",
    speedRate: "Speed Rate",
    vocalPitch: "Vocal Pitch",
    resumeSpeech: "Resume Speech",
    speakText: "Speak Text",
    saveAudio: "Save Audio",
    wordsChars: "{words} words / {chars} characters",

    // Sign recognition page
    recognitionTitle: "Sign Recognition",
    recognitionDesc: "Practice gestures in front of your camera. Our AI computer vision system maps hand skeletal joint lines to verify accuracy.",
    cameraReady: "Camera Ready",
    islMode: "ISL Mode",
    recognitionConfidence: "Recognition Confidence",
    calculating: "Calculating...",
    startRecognition: "Start Testing",
    recognizingGestures: "Recognizing Gestures...",
    resetStatsTooltip: "Reset Stats",
    aiFeedback: "AI Feedback",
    aiFeedbackDesc: "Position your hand in frame and press \"Start Testing\" to begin.",
    lightingHelp: "Good lighting helps accuracy",
    handLevelHelp: "Keep hand at chest to face level",
    steadyHelp: "Steady movements work best",
    sessionStats: "Session Stats",
    liveSession: "Live Session",
    attempts: "Attempts",
    correct: "Correct",
    avgConfidence: "Avg Confidence",
    signsToPractice: "Signs to Practice",
    correctSignDetected: "Correct Sign Detected!",
    successBannerDesc: "\"{sign}\" recognized with {confidence}% confidence. +{xp} XP awarded.",
    recognitionMode: "Recognition Mode",
    switchToPracticeMode: "Switch to Practice Mode",
    switchToRecognitionMode: "Switch to Recognition Mode",
    detectSign: "Detect Sign",
    detected: "Detected",
    xpEarned: "XP Earned",

    // Lesson/Quiz pages
    lessonNotFound: "Lesson not found",
    returnToSyllabus: "Return to Syllabus",
    moduleTag: "MODULE {mId}",
    lessonProgressText: "Lesson {current} of {total} in \"{moduleTitle}\"",
    syllabusLink: "Syllabus",
    aslVideoDemo: "ASL SIGN VIDEO DEMO",
    lessonVideoDemoDesc: "Watch a professional tutor demonstrate the exact wrist angles and manual coordinates for \"{title}\".",
    signAsset: "Sign Asset",
    manualGesture: "Manual Gesture",
    definitionMeaning: "Definition & Meaning",
    phonetics: "Phonetics",
    exampleTranslation: "Example Translation",
    englishContextTranslation: "English context translation",
    aiLinguisticExplanation: "AI Linguistic Explanation",
    aiCoachTip: "Interactive Coach Tip: Position your hands centered relative to your torso for the best spatial accuracy reading.",
    previousLesson: "Previous Lesson",
    nextLesson: "Next Lesson",
    completedXpEarned: "Completed (+20 XP Claimed)",
    completeLessonXp: "Complete Lesson & Claim +20 XP",
    lessonActions: "Lesson Actions",
    lessonNotes: "Lesson Notes",
    autoSaved: "Auto-saved",
    lessonNotesPlaceholder: "Write down visual keypoints (e.g. wrist placement, facial gestures) to review later...",
    charCount: "Character count: {count}",
    saved: "Saved",
    moduleSyllabus: "Module Syllabus",
    bookmarked: "Bookmarked",
    bookmark: "Bookmark",
    quizFailed: "Quiz Failed",
    quizFailedDesc: "You ran out of hearts! Review the vocabulary and try again.",
    scoreLabel: "Score: {score} / {total} correct",
    xpEarnedAmount: "+{xp} XP Earned",
    continueToSyllabus: "Continue to Syllabus",
    finishQuiz: "Finish Quiz",
    continueLearning: "Continue Learning",
    aiCoach: "AI Coach",

    // History Page
    activityLogsTitle: "Activity Logs",
    activityLogsDesc: "Review detailed records of completed lessons, quiz scores, AI Coach logs, and vocal sessions.",
    tabLearning: "Learning",
    tabQuizzes: "Quiz Attempts",
    tabAiChat: "AI Chat",
    tabSpeech: "Speech Hub",
    tabSearches: "Search History",
    searchLessons: "Search lessons...",
    allModules: "All Modules",
    foundationsOfSign: "Foundations of Sign",
    everydayExpressions: "Everyday Expressions",
    conversationalPhrases: "Conversational Phrases",
    spentText: "spent",
    completed: "Completed",
    noLearningLogs: "No learning logs matched the search conditions.",
    noQuizLogs: "No quiz logs found. Choose a quiz from Practice!",
    aiCoachConversations: "AI Coach Conversations",
    aiCoachConversationsDesc: "Your chats with the AI Coach are ephemeral by default to protect privacy. Custom logs will appear as bookmarks.",
    wordsCount: "{count} words",
    noSpeechLogs: "No speech logs found. Go to the Speech Hub to test vocal prompts!",
    searchKeywords: "Search Keywords",
    clearAll: "Clear All",
    noSearchHistory: "No search history found.",
    takenTime: "taken",
    scoreText: "Score",

    // Profile Page
    profileMotto: "Passionate about bridging vocal and visual communication gaps.",
    editProfile: "Edit Profile",
    achievementsGallery: "Achievements Gallery",
    accountInformation: "Account Information",
    contactEmail: "Contact Email",
    profileUrl: "Profile URL",
    lastYear: "Last Year",
    totalXp: "Total XP",
    lessonsDone: "Lessons Done",
    quizzesDone: "Quizzes Done",

    // Progress Page
    progressAnalyticsTitle: "Progress & Analytics",
    progressAnalyticsDesc: "Review metrics, accuracy timelines, activity charts, and customized AI reports to optimize your study targets.",
    heatmapTitle: "Lesson completions heatmap",
    allYear: "All Year",
    weeklyStudyTime: "Weekly Study Time (Minutes)",
    monthlyLessonsCompleted: "Monthly Lessons Completed",
    signSkillsProfile: "Sign Skills Profile",
    strongestSkill: "Strongest Skill",
    weakestSkill: "Weakest Skill",
    needsImprovement: "Needs Improvement",
    fastLearnedTopics: "Fast Learned Topics",
    alphabetSpelling: "Alphabet Spelling",
    highestSpeedAccuracy: "Highest speed accuracy rating",
    directionalSignAngles: "Directional Sign Angles",
    lowScoresDirectional: "Low scores on directional quizzes",
    whQuestionFacial: "WH-Question Facial Posture",
    missedFacialPosturing: "Missed facial posturing keypoints",
    basicGreetings: "Basic Greetings",
    completedFirstAttempt: "Completed on first attempt",
    currentStreak: "Current streak",
    longestRecordedStreak: "Longest recorded streak",
    quizAccuracyTime: "Quiz Accuracy over time (%)",
    aiInsightEngine: "AI Insight Engine",
    coachFeedback: "Coach feedback",
    xpHistoryProgression: "XP History progression",
    verifiedBadge: "Verified",
    insightBullet1: "Your manual spelling speed is in the top 5% of your current level rank. Outstanding motor skills!",
    insightBullet2: "Average score accuracy drops by 12% on questions involving WH-pronouns. Focus on Module 3 facial markers.",
    insightBullet3: "Practicing vocabulary between 10 AM and Noon yields a 15% higher recall rate on spelling tasks.",

    // Leaderboard Page
    leaderboardTitle: "Sign Arena Leaderboard",
    leaderboardPageDesc: "Compete with students globally. Streaks and quiz accuracies determine weekly standings.",
    weekly: "Weekly",
    monthly: "Monthly",
    allTime: "All Time",
    rankCol: "Rank",
    studentCol: "Student",
    levelCol: "Level",
    xpPointsCol: "XP Points",
    accuracyCol: "Accuracy",
    streakCol: "Streak",
    youBadge: "YOU",
    daysText: "Days",
    currentLevel: "Current Level",
    studyDuration: "Study Duration",
    avgAccuracy: "Avg Accuracy",
    previous: "Previous",
    next: "Next",
  },
  Tamil: {
    // General / Sidebar
    dashboard: "டாஷ்போர்டு",
    practice: "பயிற்சி",
    recognition: "சைகை அங்கீகாரம்",
    settings: "அமைப்புகள்",
    logout: "வெளியேறு",
    learn: "கற்றுக்கொள்",
    speechHub: "பேச்சு மையம்",
    speechToText: "பேச்சிலிருந்து உரை",
    textToSpeech: "உரையிலிருந்து பேச்சு",
    quiz: "வினாடி வினா",
    leaderboard: "தரவரிசை பலகை",
    history: "வரலாறு",
    searchPlaceholder: "பாடங்கள், தொகுதிகள், வினாடி வினாக்களைத் தேடுங்கள்...",
    
    // Syllabus Page
    syllabus: "ASL கற்றல் பாடத்திட்டம்",
    syllabusDesc: "அடிப்படையில் இருந்து சரளமான உரையாடல்கள் வரை அமெரிக்க சைகை மொழியை படிப்படியாக மாஸ்டர் செய்யுங்கள்.",
    continueLearning: "கற்றலைத் தொடரவும்",
    recommended: "உங்களுக்காக பரிந்துரைக்கப்படுகிறது",
    struggledNumbers: "நீங்கள் எண்களுடன் போராடியதால்...",
    popularWeek: "இந்த வாரம் பிரபலம்",
    lessonsProgress: "பாடங்களின் முன்னேற்றம்",
    lessonsFinished: "பாடங்கள் முடிந்துவிட்டன",
    reviewModule: "தொகுதியை மதிப்பாய்வு செய்க",
    startModule: "தொகுதியைத் தொடங்கு",
    locked: "பூட்டப்பட்டது",
    activeCourse: "செயலில் உள்ள பாடநெறி தொகுதி",
    beginner: "தொடக்கநிலை",
    intermediate: "இடைநிலை",
    advanced: "மேம்பட்டநிலை",
    module: "தொகுதி",
    lessons: "பாடங்கள்",
    hours: "மணிநேரம்",
    
    // Settings Page
    settingsTitle: "அமைப்பு அமைப்புகள்",
    settingsDesc: "அறிவிப்புகள், ஒலி தூண்டுதல்கள், உள்ளூர் மொழி மொழிபெயர்ப்பு இயல்புநிலைகள் மற்றும் கணக்கு தெரிவுநிலை ஆகியவற்றைத் தனிப்பயனாக்குங்கள்.",
    accountTab: "கணக்கு",
    appearanceTab: "தோற்றம்",
    notificationsTab: "அறிவிப்புகள்",
    privacyTab: "தனியுரிமை",
    languageTab: "மொழி",
    accountCredentials: "கணக்கு சான்றுகள்",
    fullName: "முழு பெயர்",
    username: "பயனர் பெயர்",
    emailAddress: "மின்னஞ்சல் முகவரி",
    registeredDate: "பதிவு செய்யப்பட்ட தேதி",
    interfaceAppearance: "இடைமுக தோற்றம்",
    colorTheme: "வண்ண தீம்",
    alertConfigs: "எச்சரிக்கை உள்ளமைவுகள்",
    systemAlerts: "கணினி எச்சரிக்கைகள்",
    streakReminder: "கற்றல் தொடர்ச்சி நினைவூட்டல்களைப் பெறுங்கள்",
    hapticAudio: "ஒலி மற்றும் தொடு விளைவுகள்",
    clickFeedback: "பதில் தேர்வுகளில் ஒலி பின்னூட்டத்தை இயக்கு",
    privacySettings: "தனியுரிமை அமைப்புகள்",
    leaderboardVisibility: "பொது தரவரிசை தெரிவுநிலை",
    leaderboardDesc: "தரவரிசை பலகையில் உங்கள் பயனர் பெயரை காட்டு",
    localizationDefaults: "உள்ளூர்மயமாக்கல் இயல்புநிலைகள்",
    systemTranslation: "கணினி மொழிபெயர்ப்பு",
    saveChanges: "மாற்றங்களைச் சேமி",
    settingsSaved: "அமைப்புகள் சேமிக்கப்பட்டன",
    settingsVersion: "அமைப்புகள் பக்கம் v1.0",
    
    // Quiz Page
    levelBasedQuiz: "நிலை சார்ந்த வினாடி வினா",
    levelBasedQuizDesc: "கட்டமைக்கப்பட்ட நிலைகள் - முந்தையதை மாஸ்டர் செய்வதன் மூலம் அடுத்ததை திறக்கவும்.",
    level: "நிலை",
    progress: "முன்னேற்றம்",
    retry: "மீண்டும் முயற்சி",
    start: "தொடங்கு",
    questions: "கேள்விகள்",
    questionProgress: "கேள்வி {total}-இல் {current}",
    timer: "நேரம்",
    visualStimulus: "காட்சி தூண்டுதல்",
    nextQuestion: "அடுத்த கேள்வி",
    viewResults: "முடிவுகளைக் காண்க",
    quizCompleted: "வினாடி வினா முடிந்தது!",
    quizCompletedDesc: "அருமையான வேலை. வினாடி வினா முயற்சியை முடித்துவிட்டீர்கள்.",
    xpEarned: "ஈட்டிய XP",
    accuracy: "துல்லியம்",
    badgeUnlockedPerfect: "பேட்ஜ் திறக்கப்பட்டது: சரியான 100",
    perfectScoreDesc: "ASL வினாடி வினாவில் சரியான மதிப்பெண்",
    claimed: "பெறப்பட்டது",
    chooseAnotherLevel: "மற்றொரு நிலையைத் தேர்வுசெய்",
    tryAgain: "மீண்டும் முயற்சி செய்",
    levelTitle1: "அடிப்படை எழுத்துக்கள்",
    levelTitle2: "வாழ்த்துகள்",
    levelTitle3: "எண்கள் 1-10",
    levelTitle4: "குடும்பம்",
    levelTitle5: "வண்ணங்கள்",
    levelTitle6: "எண்கள் 11-20",
    levelTitle7: "தினசரி செயல்கள்",
    levelTitle8: "உணவு",
    levelTitle9: "பயணம்",
    levelTitle10: "அவசரநிலை",
    levelTitle11: "மருத்துவம்",
    levelTitle12: "உரையாடல்",

    // Dashboard Page
    welcomeBack: "மீண்டும் வருக, {name}! 👋",
    streakDescription: "உங்களுக்கு {streak} நாட்கள் தொடர்ச்சி உள்ளது. உங்கள் தொடர்ச்சியைத் தக்கவைக்க தினமும் 100+ XP ஈட்டுங்கள்! வேகத்தைத் தக்கவைத்து இன்று உங்கள் இலக்குகளை அடையுங்கள்.",
    streak: "தொடர்ச்சி",
    plusToday: "இன்று +{count}",
    levelN: "நிலை {n} — நிபுணர்",
    plusThisWeek: "இந்த வாரம் +{percent}%",
    lessonsDone: "முடித்த பாடங்கள்",
    countThisWeek: "இந்த வாரம் {count}",
    levelProgression: "நிலை முன்னேற்றம்",
    dailyGoal: "தினசரி இலக்கு",
    dailyGoalDesc: "இன்று 5 பாடங்கள் அல்லது வினாடி வினாக்களை முடிக்கவும்",
    completedToday: "இன்று {completed} / {total} முடிக்கப்பட்டது",
    weeklyProgress: "வாராந்திர முன்னேற்றம்",
    daysGoal: "{current} / {total} நாட்கள்",
    aiRecommendations: "AI பரிந்துரைகள்",
    aiActive: "AI செயலில் உள்ளது",
    recentActivity: "சமீபத்திய செயல்பாடு",
    viewHistory: "வரலாற்றைக் காண்க",
    noRecentActivity: "சமீபத்திய செயல்பாடுகள் இல்லை. கற்கத் தொடங்குங்கள்!",
    achievements: "சாதனைகள்",
    seeAll: "அனைத்தையும் பார்",
    dashboardLevelTitle1: "அடிப்படைகள்",
    dashboardLevelDesc1: "அடிப்படை கை வடிவங்களில் தேர்ச்சி",
    dashboardLevelTitle2: "அடிப்படை சைகைகள்",
    dashboardLevelDesc2: "தினசரி வாழ்த்துகள் மற்றும் பொதுவான பொருட்கள்",
    dashboardLevelTitle3: "எண்கள் மற்றும் எழுத்துக்கள்",
    dashboardLevelDesc3: "திறக்க நிலை 2 ஐ முடிக்கவும்",
    dashboardLevelTitle4: "பொதுவான சொற்றொடர்கள்",
    dashboardLevelDesc4: "எளிய அறிக்கைகள் மற்றும் கேள்வி படிவங்கள்",
    recTitle1: "கை விரல் எழுத்துக்கூட்டல் J-M",
    recReason1: "கை வடிவங்கள் பகுதி 2 ஐ வலுப்படுத்துகிறது",
    recTitle2: "வாழ்த்துகள் மதிப்பாய்வு",
    recReason2: "வினாடி வினா துல்லியத்தின் அடிப்படையில் பரிந்துரைக்கப்படுகிறது",

    // Speech pages
    speechToTextTitle: "பேச்சிலிருந்து உரை",
    speechToTextDesc: "சைகை வடிவங்களின் குரல் மொழிபெயர்ப்புகளைப் பயிற்சி செய்ய உங்கள் பேச்சு குரலை நேரடி உரையாக மாற்றவும்.",
    stopTranscription: "டிரான்ஸ்கிரிப்ஷனை நிறுத்த பொத்தானைத் தட்டவும்",
    startRecording: "பதிவு செய்யத் தொடங்க பொத்தானைத் தட்டவும்",
    transcriptionFeed: "டிரான்ஸ்கிரிப்ஷன் ஊட்டம்",
    transcriptionPlaceholder: "நீங்கள் பதிவு செய்யத் தொடங்கியதும் உங்கள் பேச்சின் டிரான்ஸ்கிரிப்ஷன் வார்த்தைக்கு வார்த்தை இங்கே தோன்றும்.",
    copied: "நகலெடுக்கப்பட்டது",
    copy: "நகலெடு",
    savedToHistory: "வரலாற்றில் சேமிக்கப்பட்டது",
    saveSession: "அமர்வைச் சேமி",
    textToSpeechTitle: "உரையிலிருந்து பேச்சு",
    textToSpeechDesc: "பேசும் ஆடியோவை ஒருங்கிணைக்க உரையைத் தட்டச்சு செய்யவும் அல்லது பரிந்துரைக்கப்பட்ட சொற்றொடரைத் தேர்ந்தெடுக்கவும்.",
    suggestedPhrases: "பரிந்துரைக்கப்பட்ட சொற்றொடர்கள்",
    typeHerePlaceholder: "இங்கே ஒருங்கிணைக்க ஆங்கில உரையைத் தட்டச்சு செய்க...",
    voiceParams: "குரல் அளவுருக்கள்",
    voiceSynthesizer: "குரல் தொகுப்பான்",
    speedRate: "வேகம்",
    vocalPitch: "குரல் சுருதி",
    resumeSpeech: "பேச்சைத் தொடரவும்",
    speakText: "உரையைப் பேசு",
    saveAudio: "ஆடியோவைச் சேமி",
    wordsChars: "{words} வார்த்தைகள் / {chars} எழுத்துக்கள்",

    // Sign recognition page
    recognitionTitle: "சைகை அங்கீகாரம்",
    recognitionDesc: "உங்கள் கேமராவுக்கு முன்னால் சைகைகளைப் பயிற்சி செய்யுங்கள். எங்கள் AI கணினி பார்வை அமைப்பு துல்லியத்தை சரிபார்க்க கையின் எலும்புக்கூடு கூட்டு வரிகளை வரைகிறது.",
    cameraReady: "கேமரா தயார்",
    islMode: "ISL முறை",
    recognitionConfidence: "அங்கீகார நம்பிக்கை",
    calculating: "கணக்கிடப்படுகிறது...",
    startRecognition: "சோதனையைத் தொடங்கு",
    recognizingGestures: "சைகைகளை அங்கீகரிக்கிறது...",
    resetStatsTooltip: "புள்ளிவிவரங்களை மீட்டமை",
    aiFeedback: "AI பின்னூட்டம்",
    aiFeedbackDesc: "உங்கள் கையை சட்டத்தில் வைத்து தொடங்க \"சோதனையைத் தொடங்கு\" என்பதை அழுத்தவும்.",
    lightingHelp: "நல்ல வெளிச்சம் துல்லியத்திற்கு உதவுகிறது",
    handLevelHelp: "கையை நெஞ்சு முதல் முகம் வரை வையுங்கள்",
    steadyHelp: "நிலையான அசைவுகள் சிறப்பாக செயல்படும்",
    sessionStats: "அமர்வு புள்ளிவிவரங்கள்",
    liveSession: "நேரடி அமர்வு",
    attempts: "முயற்சிகள்",
    correct: "சரி",
    avgConfidence: "சராசரி நம்பிக்கை",
    signsToPractice: "பயிற்சி செய்ய வேண்டிய சைகைகள்",
    correctSignDetected: "சரியான சைகை கண்டறியப்பட்டது!",
    successBannerDesc: "\"{sign}\" சைகை {confidence}% நம்பிக்கையுடன் அங்கீகரிக்கப்பட்டது. +{xp} XP வழங்கப்பட்டது.",
    recognitionMode: "அங்கீகார முறை",
    switchToPracticeMode: "பயிற்சி முறைக்கு மாறவும்",
    switchToRecognitionMode: "அங்கீகார முறைக்கு மாறவும்",
    detectSign: "சைகையை கண்டறி",
    detected: "கண்டறியப்பட்டது",
    xpEarned: "ஈட்டப்பட்ட XP",

    // Lesson/Quiz pages
    lessonNotFound: "பாடம் கண்டறியப்படவில்லை",
    returnToSyllabus: "பாடத்திட்டத்திற்குத் திரும்பு",
    moduleTag: "தொகுதி {mId}",
    lessonProgressText: "\"{moduleTitle}\"-இல் {total} பாடங்களில் பாடம் {current}",
    syllabusLink: "பாடத்திட்டம்",
    aslVideoDemo: "ASL சைகை வீடியோ விளக்கம்",
    lessonVideoDemoDesc: "\"{title}\" சைகைக்கான சரியான மணிக்கட்டு கோணங்கள் மற்றும் கை சைகை ஒருங்கிணைப்புகளை ஒரு தொழில்முறை ஆசிரியர் விளக்குவதை பாருங்கள்.",
    signAsset: "சைகை சொத்து",
    manualGesture: "கை சைகை",
    definitionMeaning: "வரையறை மற்றும் பொருள்",
    phonetics: "ஒலியியல்",
    exampleTranslation: "உதாரண மொழிபெயர்ப்பு",
    englishContextTranslation: "ஆங்கில சூழல் மொழிபெயர்ப்பு",
    aiLinguisticExplanation: "AI மொழியியல் விளக்கம்",
    aiCoachTip: "ஊடாடும் பயிற்சியாளர் உதவிக்குறிப்பு: சிறந்த இடஞ்சார்ந்த துல்லிய வாசிப்புக்கு உங்கள் கைகளை உங்கள் உடற்பகுதிக்கு மையமாக வைக்கவும்.",
    previousLesson: "முந்தைய பாடம்",
    nextLesson: "அடுத்த பாடம்",
    completedXpEarned: "முடிக்கப்பட்டது (+20 XP பெறப்பட்டது)",
    completeLessonXp: "பாடத்தை முடித்து +20 XP பெறுக",
    lessonActions: "பாடச் செயல்கள்",
    lessonNotes: "பாடக் குறிப்புகள்",
    autoSaved: "தானாகச் சேமிக்கப்பட்டது",
    lessonNotesPlaceholder: "பின்னர் மதிப்பாய்வு செய்ய காட்சி முக்கிய புள்ளிகளை (எ.கா. மணிக்கட்டு வைப்பு, முக சைகைகள்) எழுதுங்கள்...",
    charCount: "எழுத்துக்கள் எண்ணிக்கை: {count}",
    saved: "சேமிக்கப்பட்டது",
    moduleSyllabus: "தொகுதி பாடத்திட்டம்",
    bookmarked: "புத்தகக்குறியிடப்பட்டது",
    bookmark: "புத்தகக்குறி",
    quizFailed: "வினாடி வினா தோல்வியடைந்தது",
    quizFailedDesc: "உங்களிடம் உள்ள இதயங்கள் தீர்ந்துவிட்டன! சொற்களஞ்சியத்தை மதிப்பாய்வு செய்து மீண்டும் முயற்சிக்கவும்.",
    scoreLabel: "மதிப்பெண்: {score} / {total} சரி",
    xpEarnedAmount: "+{xp} XP ஈட்டப்பட்டது",
    continueToSyllabus: "பாடத்திட்டத்திற்குத் தொடரவும்",
    finishQuiz: "வினாடி வினாவை முடிக்கவும்",
    continueLearning: "கற்றலைத் தொடரவும்",
    aiCoach: "AI பயிற்சியாளர்",

    // History Page
    activityLogsTitle: "செயல்பாட்டு பதிவுகள்",
    activityLogsDesc: "முடிக்கப்பட்ட பாடங்கள், வினாடி வினா மதிப்பெண்கள், AI பயிற்சியாளர் பதிவுகள் மற்றும் குரல் அமர்வுகளின் விரிவான பதிவுகளை மதிப்பாய்வு செய்யவும்.",
    tabLearning: "கற்றல்",
    tabQuizzes: "வினாடி வினா முயற்சிகள்",
    tabAiChat: "AI அரட்டை",
    tabSpeech: "பேச்சு மையம்",
    tabSearches: "தேடல் வரலாறு",
    searchLessons: "பாடங்களைத் தேடு...",
    allModules: "அனைத்து தொகுதிகள்",
    foundationsOfSign: "அடிப்படை சைகை",
    everydayExpressions: "தினசரி வெளிப்பாடுகள்",
    conversationalPhrases: "உரையாடல் சொற்றொடர்கள்",
    spentText: "செலவிடப்பட்டது",
    completed: "முடிக்கப்பட்டது",
    noLearningLogs: "தேடல் நிபந்தனைகளுடன் பொருந்தக்கூடிய கற்றல் பதிவுகள் எதுவும் இல்லை.",
    noQuizLogs: "வினாடி வினா பதிவுகள் எதுவும் இல்லை. பயிற்சியிலிருந்து ஒரு வினாடி வினாவைத் தேர்ந்தெடுக்கவும்!",
    aiCoachConversations: "AI பயிற்சியாளர் உரையாடல்கள்",
    aiCoachConversationsDesc: "தனியுரிமையைப் பாதுகாக்க உங்கள் AI பயிற்சியாளர் அரட்டைகள் இயல்பாகவே தற்காலிகமானவை. தனிப்பயன் பதிவுகள் புக்மார்க்குகளாகத் தோன்றும்.",
    wordsCount: "{count} வார்த்தைகள்",
    noSpeechLogs: "குரல் பதிவுகள் எதுவும் இல்லை. குரல் தூண்டுதல்களை சோதிக்க பேச்சு மையத்திற்கு செல்லவும்!",
    searchKeywords: "தேடல் முக்கிய வார்த்தைகள்",
    clearAll: "அனைத்தையும் அழி",
    noSearchHistory: "தேடல் வரலாறு எதுவும் இல்லை.",
    takenTime: "எடுக்கப்பட்டது",
    scoreText: "மதிப்பெண்",

    // Profile Page
    profileMotto: "Passionate about bridging vocal and visual communication gaps.",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    achievementsGallery: "சாதனைகள் தொகுப்பு",
    accountInformation: "கணக்கு விவரங்கள்",
    contactEmail: "தொடர்பு மின்னஞ்சல்",
    profileUrl: "சுயவிவர முகவரி",
    lastYear: "கடந்த ஆண்டு",
    totalXp: "மொத்த XP",
    lessonsDone: "முடித்த பாடங்கள்",
    quizzesDone: "முடித்த வினாடி வினாக்கள்",

    // Progress Page
    progressAnalyticsTitle: "முன்னேற்றம் மற்றும் பகுப்பாய்வு",
    progressAnalyticsDesc: "உங்கள் ஆய்வு இலக்குகளை மேம்படுத்த புள்ளிவிவரங்கள், துல்லிய காலக்கோடுகள், செயல்பாட்டு வரைபடங்கள் மற்றும் தனிப்பயனாக்கப்பட்ட AI அறிக்கைகளை மதிப்பாய்வு செய்யவும்.",
    heatmapTitle: "பாடம் முடித்த வெப்ப வரைபடம்",
    allYear: "முழு ஆண்டு",
    weeklyStudyTime: "வாராந்திர ஆய்வு நேரம் (நிமிடங்கள்)",
    monthlyLessonsCompleted: "மாதாந்திர பாடங்கள் முடித்தல்",
    signSkillsProfile: "சைகை திறன் சுயவிவரம்",
    strongestSkill: "மிக வலுவான திறன்",
    weakestSkill: "மிக பலவீனமான திறன்",
    needsImprovement: "மேம்பாடு தேவைப்படுகிறது",
    fastLearnedTopics: "வேகமாக கற்ற தலைப்புகள்",
    alphabetSpelling: "எழுத்துக்கள் எழுத்துக்கூட்டல்",
    highestSpeedAccuracy: "அதிகபட்ச வேகம் மற்றும் துல்லிய மதிப்பீடு",
    directionalSignAngles: "திசை சைகை கோணங்கள்",
    lowScoresDirectional: "திசை வினாடி வினாக்களில் குறைந்த மதிப்பெண்கள்",
    whQuestionFacial: "கேள்வி முக பாவனை",
    missedFacialPosturing: "முக பாவனையின் முக்கிய புள்ளிகள் தவறவிடப்பட்டன",
    basicGreetings: "அடிப்படை வாழ்த்துகள்",
    completedFirstAttempt: "முதல் முயற்சியிலேயே முடிக்கப்பட்டது",
    currentStreak: "தற்போதைய தொடர்ச்சி",
    longestRecordedStreak: "நீண்ட பதிவு செய்யப்பட்ட தொடர்ச்சி",
    quizAccuracyTime: "வினாடி வினா துல்லியம் (%)",
    aiInsightEngine: "AI நுண்ணறிவு இயந்திரம்",
    coachFeedback: "பயிற்சியாளர் கருத்து",
    xpHistoryProgression: "XP வரலாற்று முன்னேற்றம்",
    verifiedBadge: "சரிபார்க்கப்பட்டது",
    insightBullet1: "உங்கள் கை எழுத்துக்கூட்டல் வேகம் தற்போதைய நிலையில் முதல் 5%-க்குள் உள்ளது. சிறந்த மோட்டார் திறன்கள்!",
    insightBullet2: "கேள்விகளில் முக பாவனைகளின் துல்லியம் 12% குறைகிறது. தொகுதி 3 முகக் குறிகளில் கவனம் செலுத்துங்கள்.",
    insightBullet3: "காலை 10 மணி முதல் நண்பகல் வரை பயிற்சி செய்வது 15% அதிக நினைவூட்டல் விகிதத்தைத் தருகிறது.",

    // Leaderboard Page
    leaderboardTitle: "சைகை அரங்க தரவரிசை பலகை",
    leaderboardPageDesc: "உலகளவில் மாணவர்களுடன் போட்டியிடுங்கள். தொடர்ச்சிகள் மற்றும் துல்லியங்கள் வாராந்திர நிலைகளை தீர்மானிக்கின்றன.",
    weekly: "வாராந்திர",
    monthly: "மாதாந்திர",
    allTime: "எல்லா நேரமும்",
    rankCol: "தரவரிசை",
    studentCol: "மாணவர்",
    levelCol: "நிலை",
    xpPointsCol: "XP புள்ளிகள்",
    accuracyCol: "துல்லியம்",
    streakCol: "தொடர்ச்சி",
    youBadge: "நீ",
    daysText: "நாட்கள்",
    currentLevel: "தற்போதைய நிலை",
    studyDuration: "ஆய்வு காலம்",
    avgAccuracy: "சராசரி துல்லியம்",
    previous: "முந்தைய",
    next: "அடுத்த",
  }
};

export function AppContextProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = window.localStorage.getItem("beyondwords_app_state");
      let appState = { ...initialAppState };
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === "object") {
            // CRITICAL FIX: Do not load stale user or progress data from localStorage
            delete parsed.user;
            delete parsed.progress;
            
            appState = { ...initialAppState, ...parsed };
            // FORCE isAuthenticated to match the actual token existence to prevent infinite 401 reload loops
            appState.isAuthenticated = !!getToken();
            if (!appState.isAuthenticated) {
              appState.authStep = "landing";
            }
          }
        } catch (e) {
          console.error("Error parsing beyondwords_app_state", e);
        }
      }
      
      // Initialize formatDuration helper
      const formatDuration = (totalMins) => {
        if (totalMins >= 60) {
          const hrs = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
        }
        return `${totalMins} min`;
      };

      const getOptionKey = (optionsArray, correctAnswerText) => {
        const index = optionsArray.indexOf(correctAnswerText);
        if (index === 0) return "A";
        if (index === 1) return "B";
        if (index === 2) return "C";
        if (index === 3) return "D";
        return "A";
      };

      // Clear old stale mock data that causes fake quizzes to appear
      window.localStorage.removeItem("beyondwords_admin_data");
      let adminDataStr = null;

      if (!adminDataStr) {
        // Build initial ASL Course from defaults
        const defaultCourse = {
          id: 1,
          title: "American Sign Language (ASL) Course",
          description: "Learn the fundamentals, everyday expressions, and conversational structures of ASL.",
          difficulty: "Beginner",
          status: "published",
          thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=640",
          modules: [].map(mod => {
            const lessons = (mod.lessons || []).filter(l => l.type === "lesson").map(l => ({
              id: l.id,
              moduleId: mod.id,
              title: l.title,
              description: l.meaning || "",
              videoUrl: l.videoUrl || "",
              durationMinutes: l.durationMinutes || 15,
              order: l.order || 1,
              status: l.status || "locked",
              aiExplanation: l.aiExplanation || "",
              exampleSentence: l.exampleSentence || "",
            }));

            const quizItem = (mod.lessons || []).find(l => l.type === "quiz");
            const quizzes = [];
            if (quizItem) {
              quizzes.push({
                id: 900 + mod.id,
                moduleId: mod.id,
                title: quizItem.title || `Module ${mod.id} Quiz`,
                xpReward: 250,
                timeLimitSeconds: 30,
                passPercent: 70,
                questions: (defaultQuizQuestions[mod.id] || []).map((q, idx) => ({
                  id: 9000 + mod.id * 100 + idx,
                  text: q.question,
                  signImageUrl: q.image || "",
                  options: {
                    A: q.options[0] || "",
                    B: q.options[1] || "",
                    C: q.options[2] || "",
                    D: q.options[3] || "",
                  },
                  correctAnswer: getOptionKey(q.options, q.answer),
                }))
              });
            }

            return {
              id: mod.id,
              courseId: 1,
              title: mod.title,
              description: mod.description || "",
              order: mod.id,
              status: mod.unlocked ? "unlocked" : "locked",
              durationMinutes: lessons.reduce((sum, l) => sum + (l.durationMinutes || 0), 0),
              xpReward: mod.xpReward || 500,
              lessons,
              quizzes,
            };
          })
        };

        window.localStorage.setItem("beyondwords_admin_data", JSON.stringify([defaultCourse]));
        adminDataStr = JSON.stringify([defaultCourse]);
      }

      let loadedModules = [];
      let loadedQuizQuestions = {};
      if (adminDataStr) {
        try {
          const parsedCourses = JSON.parse(adminDataStr);
          const activeModules = [];
          const activeQuizQuestions = {};
          
          parsedCourses.forEach(course => {
            if (course.status === "published") {
              course.modules.forEach(mod => {
                const totalDurationMinutes = (mod.lessons || []).reduce((sum, les) => sum + (les.durationMinutes || 0), 0);
                const totalXp = (mod.lessons || []).length * 20 + (mod.quizzes || []).reduce((sum, qz) => sum + (qz.xpReward || 0), 0);

                activeModules.push({
                  id: parseInt(mod.id) || mod.id,
                  courseId: course.id,
                  title: mod.title,
                  description: mod.description || "",
                  order: mod.order,
                  unlocked: mod.status === "unlocked",
                  completionPercent: 0,
                  duration: formatDuration(totalDurationMinutes),
                  xpReward: totalXp,
                  lessons: [
                    ...(mod.lessons || []).map(les => ({
                      id: parseInt(les.id) || les.id,
                      title: les.title,
                      type: "lesson",
                      videoUrl: les.videoUrl || "",
                      meaning: les.description || "",
                      aiExplanation: les.aiExplanation || "",
                      exampleSentence: les.exampleSentence || "",
                      status: les.status || "locked",
                      durationMinutes: les.durationMinutes,
                    })),
                    ...(mod.quizzes || []).map(qz => ({
                      id: qz.id,
                      title: qz.title,
                      type: "quiz",
                      status: "locked",
                    }))
                  ]
                });

                mod.quizzes.forEach(qz => {
                  activeQuizQuestions[mod.id] = (qz.questions || []).map((q, idx) => ({
                    id: parseInt(q.id) || q.id || idx,
                    question: q.text,
                    image: q.signImageUrl || "",
                    options: [q.options.A, q.options.B, q.options.C, q.options.D],
                    answer: q.correctAnswer === "A" ? q.options.A : q.correctAnswer === "B" ? q.options.B : q.correctAnswer === "C" ? q.options.C : q.options.D
                  }));
                });
              });
            }
          });

          if (activeModules.length > 0) {
            loadedModules = activeModules;
            loadedQuizQuestions = activeQuizQuestions;
          }
        } catch (e) {
          console.error("Error parsing beyondwords_admin_data", e);
        }
      }

      // Load quiz categories data
      let quizCategoriesStr = window.localStorage.getItem("beyondwords_quiz_categories");
      let loadedCategories = [];
      if (quizCategoriesStr) {
        try {
          loadedCategories = JSON.parse(quizCategoriesStr);
        } catch (e) {
          console.error("Error parsing beyondwords_quiz_categories", e);
        }
      }
      
      if (!loadedCategories || loadedCategories.length < 70) {
        loadedCategories = [];
        
      }

      appState.modules = loadedModules;
      appState.levels = [];
      appState.quizQuestions = loadedQuizQuestions;
      appState.quizCategories = loadedCategories;
      
      // Enforce truth based on actual token existence
      appState.isAuthenticated = !!getToken();
      return appState;
    } catch (err) {
      return {
        ...initialAppState,
      };
    }
  });

  useEffect(() => {
    // Listen for 401 Unauthorized API responses
    const handleAuthExpired = () => {
      setState(prev => ({
        ...prev,
        isAuthenticated: false,
        authStep: "landing",
        user: defaultUser
      }));
    };
    window.addEventListener("auth-expired", handleAuthExpired);

    // Attempt to fetch profile on initial load if token exists
    const initializeSession = async () => {
      const token = getToken();
      if (token) {
        try {
          // 1. Fetch fresh user profile (xp, streak, level)
          const profileRes = await userApi.get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } }); 
          try { 
            const siteSettingsRes = await userApi.get("/api/users/site-settings", { headers: { Authorization: `Bearer ${token}` } }); 
            if (siteSettingsRes.data) { 
              setState(prev => ({ ...prev, settings: { ...prev.settings, ...siteSettingsRes.data } })); 
            } 
          } catch (e) { console.warn("Failed to load site settings", e); }
          
          try {
            const userSettingsRes = await userApi.get("/api/users/me/settings", { headers: { Authorization: `Bearer ${token}` } });
            if (userSettingsRes.data) {
              let backendLang = userSettingsRes.data.language || "English";
              if (backendLang === "en") backendLang = "English";
              if (backendLang === "ta") backendLang = "Tamil";
              setState(prev => ({ ...prev, settings: { ...prev.settings, ...userSettingsRes.data, language: backendLang } }));
            }
          } catch (e) { console.warn("Failed to load user settings", e); }
          _applyUserSession(token, null, profileRes.data);

          // 2. Reload completed lesson IDs from analytics-service
          //    This fixes the "completed course reverts to Start Learning on refresh" bug.
          try {
            const historyRes = await analyticsApi.get("/api/progress/history/learning", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const completedIds = (historyRes.data || []).map(r => r.lessonId).filter(Boolean);
            
            // 3. Reload quiz scores from learning-service
            const scoresRes = await learningApi.get("/api/quizzes/scores/me", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const quizScores = scoresRes.data || {};

            // 4. Reload heatmap from analytics-service
            const heatmapRes = await analyticsApi.get("/api/progress/heatmap", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const heatmapData = heatmapRes.data || {};
            // Convert heatmap to array of objects
            const heatmapArray = Object.entries(heatmapData).map(([date, count]) => ({ date, count }));

            setState(prev => ({
              ...prev,
              progress: {
                ...prev.progress,
                completedLessons: completedIds.length > 0 ? completedIds : prev.progress.completedLessons,
                quizScores: quizScores,
              },
              heatmap: heatmapArray.length > 0 ? heatmapArray : prev.heatmap,
            }));
          } catch (historyErr) {
            console.warn("Could not reload progress data from backend:", historyErr);
          }
        } catch (err) {
          console.error("Failed to restore session from backend", err);
        }
      }
    };
    initializeSession();

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    try {
      const stateToSave = { ...state };
      delete stateToSave.modules;
      delete stateToSave.levels;
      delete stateToSave.quizQuestions;
      delete stateToSave.quizCategories;
      window.localStorage.setItem("beyondwords_app_state", JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving state to localStorage:", error);
    }
  }, [state]);

  useEffect(() => {
    if (state.modules && state.levels && state.quizQuestions) {
      try {
        const dataToSave = {
          modules: state.modules,
          levels: state.levels,
          quizQuestions: state.quizQuestions,
        };
        window.localStorage.setItem("beyondwords_data", JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving beyondwords_data to localStorage:", error);
      }
    }
  }, [state.modules, state.levels, state.quizQuestions]);

  useEffect(() => {
    const theme = state.settings?.theme || "dark";
    if (theme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  }, [state.settings?.theme]);

  const addXP = (amount) => {
    setState((prev) => {
      const newXp = prev.user.xp + amount;
      let newLevel = prev.user.level;
      let newXpToNextLevel = prev.user.xpToNextLevel;

      // Handle level up
      if (newXp >= newXpToNextLevel) {
        newLevel += 1;
        newXpToNextLevel = newLevel * 1000; // Level 13 = 13000 XP max (scaled appropriately)
      }

      // Record heatmap activity
      const todayStr = new Date().toISOString().split("T")[0];
      const currentHeatmap = { ...prev.heatmap };
      currentHeatmap[todayStr] = (currentHeatmap[todayStr] || 0) + 1;

      return {
        ...prev,
        user: {
          ...prev.user,
          xp: newXp,
          level: newLevel,
          xpToNextLevel: newXpToNextLevel,
        },
        heatmap: currentHeatmap,
      };
    });
  };

  const completeLesson = async (lessonId, moduleId, lessonTitle, moduleTitle, timeSpentMinutes) => {
    // Optimistic UI Update
    setState((prev) => {
      if (prev.progress.completedLessons.includes(lessonId)) {
        return prev; // already completed
      }

      const newCompleted = [...prev.progress.completedLessons, lessonId];
      const xpEarned = 20;
      const newXp = prev.user.xp + xpEarned;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const newXpToNextLevel = newLevel * 1000;

      const todayStr = new Date().toISOString().split("T")[0];
      const currentHeatmap = { ...prev.heatmap };
      currentHeatmap[todayStr] = (currentHeatmap[todayStr] || 0) + 1;

      const newHistoryItem = {
        id: Date.now(),
        type: "lesson",
        lessonId,
        moduleId,
        title: lessonTitle,
        moduleTitle,
        date: new Date().toISOString(),
        timeSpent: `${timeSpentMinutes} mins`,
        xpEarned,
      };

      return {
        ...prev,
        user: { ...prev.user, xp: newXp, level: newLevel, xpToNextLevel: newXpToNextLevel },
        progress: { ...prev.progress, completedLessons: newCompleted },
        history: { ...prev.history, learning: [newHistoryItem, ...(prev.history?.learning || [])] },
        heatmap: currentHeatmap,
      };
    });

    try {
      // Background Sync
      await analyticsApi.post(`/api/progress/lessons/${lessonId}/complete`);
      
      analyticsApi.post("/api/progress/activity", {
        activityType: "LESSON_COMPLETE",
        detail: lessonTitle || `Lesson ${lessonId}`,
      }).catch((e) => console.error("Activity logging failed", e));
    } catch (err) {
      console.error("Background sync failed:", err);
      // Suppressed popup as requested by user
    }
  };

  const submitQuiz = async (levelId, levelName, score, totalQuestions, accuracy, timeTakenStr) => {
    // Optimistic UI Update
    setState((prev) => {
      const xpEarned = 30; // 30 XP per quiz pass — backend persists the authoritative value
      const newXp = prev.user.xp + xpEarned;
      let newLevel = prev.user.level;
      let newXpToNextLevel = prev.user.xpToNextLevel;

      if (newXp >= newXpToNextLevel) {
        newLevel += 1;
        newXpToNextLevel = newLevel * 1000;
      }

      const currentScores = { ...prev.progress.quizScores };
      const existingScoreObj = currentScores[levelId];
      const existingScore = typeof existingScoreObj === 'object' && existingScoreObj !== null ? existingScoreObj.score : (existingScoreObj || 0);
      currentScores[levelId] = {
        score: Math.max(existingScore, score),
        passed: (existingScore >= Math.ceil(totalQuestions * 0.7) || score >= Math.ceil(totalQuestions * 0.7)) // We optimistically set it
      };

      const totalPastAttempts = prev.history?.quizAttempts?.length || 0;
      const currentAvgAccuracy = prev.user.accuracy || 0;
      const newAvgAccuracy = Math.round(
        (currentAvgAccuracy * totalPastAttempts + accuracy) / (totalPastAttempts + 1)
      );

      const todayStr = new Date().toISOString().split("T")[0];
      const currentHeatmap = { ...prev.heatmap };
      currentHeatmap[todayStr] = (currentHeatmap[todayStr] || 0) + 1;

      const newAttempt = { id: Date.now(), levelName, score, totalQuestions, accuracy, xpEarned, date: new Date().toISOString(), timeTaken: timeTakenStr };

      return {
        ...prev,
        user: { ...prev.user, xp: newXp, level: newLevel, xpToNextLevel: newXpToNextLevel, accuracy: newAvgAccuracy },
        progress: { ...prev.progress, quizScores: currentScores },
        history: { ...prev.history, quizAttempts: [newAttempt, ...(prev.history?.quizAttempts || [])] },
        heatmap: currentHeatmap,
      };
    });

    try {
      // Submit to learning-service in the background
      await learningApi.post(`/api/quizzes/levels/${levelId}/submit`, {
        score,
        totalQuestions,
        timeTakenStr,
      });
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      // Suppressed popup as requested by user
    }
  };

  const addSearch = (query) => {
    if (!query.trim()) return;
    setState((prev) => {
      // Remove query if it exists to put it at the front
      const filtered = prev.history.searches.filter((q) => q.toLowerCase() !== query.toLowerCase());
      return {
        ...prev,
        history: {
          ...prev.history,
          searches: [query, ...filtered].slice(0, 10), // Limit to 10 searches
        },
      };
    });
  };

  const removeSearch = (query) => {
    setState((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        searches: prev.history.searches.filter((q) => q !== query),
      },
    }));
  };

  const clearAllSearches = () => {
    setState((prev) => ({
      ...prev,
      history: {
        ...prev.history,
        searches: [],
      },
    }));
  };

  const addSpeechSession = (type, durationSec, wordCount, content) => {
    setState((prev) => {
      const newSession = {
        id: Date.now(),
        type,
        timestamp: new Date().toISOString(),
        duration: `${durationSec}s`,
        wordCount,
        content,
      };
      
      const todayStr = new Date().toISOString().split("T")[0];
      const currentHeatmap = { ...prev.heatmap };
      currentHeatmap[todayStr] = (currentHeatmap[todayStr] || 0) + 1;

      return {
        ...prev,
        history: {
          ...prev.history,
          speechSessions: [newSession, ...prev.history.speechSessions],
        },
        heatmap: currentHeatmap,
      };
    });
  };

  const toggleModuleExpanded = (moduleId) => {
    setState((prev) => {
      const expanded = prev.progress.expandedModules.includes(moduleId)
        ? prev.progress.expandedModules.filter((id) => id !== moduleId)
        : [...prev.progress.expandedModules, moduleId];
      return {
        ...prev,
        progress: {
          ...prev.progress,
          expandedModules: expanded,
        },
      };
    });
  };

  const getRegisteredUsers = () => {
    const data = window.localStorage.getItem("beyondwords_registered_users");
    if (!data) {
      const defaultUsers = [
        { name: "Rahul", email: "rahul@gmail.com", username: "rahul", password: "Password123!" },
        { name: "Admin", email: "admin@beyondwords.com", username: "admin", password: "Password123!" }
      ];
      window.localStorage.setItem("beyondwords_registered_users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    try {
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  };

  const verifyLoginCredentials = (emailOrUsername, password) => {
    const users = getRegisteredUsers();
    const cleanInput = emailOrUsername.trim().toLowerCase();
    const found = users.find(u => 
      (u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput) && 
      u.password === password
    );
    if (found) {
      setState(prev => ({ ...prev, tempLoginUser: found }));
      return found;
    }
    return null;
  };

  // ── Auth state helpers ────────────────────────────────────────────────────
  const setAuthStep = (step) => {
    setState((prev) => ({ ...prev, authStep: step }));
  };

  const _applyUserSession = (accessToken, refreshToken, profile) => {
    setToken(accessToken);
    if (refreshToken) setRefresh(refreshToken);
    const userProfile = {
      name: profile.fullName || profile.name || "Student",
      email: profile.email || "",
      username: (profile.email || "").split("@")[0],
      role: profile.role || "STUDENT",
      xp: profile.xp ?? 0,
      streak: profile.streak ?? 0,
      level: Math.floor((profile.xp || 0) / 1000) + 1,
      xpToNextLevel: (Math.floor((profile.xp || 0) / 1000) + 1) * 1000,
      accuracy: 0, // Accuracy is now fetched dynamically by Dashboard via APIs
      avatarUrl: profile.avatarUrl || null,
      bio: profile.bio || "",
      joinedDate: profile.createdAt ? profile.createdAt.split("T")[0] : new Date().toISOString().split("T")[0],
    };
    setUser(userProfile);
    setState((prev) => ({
      ...buildInitialState(userProfile),
      // keep UI data loaded during the session
      modules: prev.modules,
      levels: prev.levels,
      quizQuestions: prev.quizQuestions,
      quizCategories: prev.quizCategories,
      settings: { ...buildInitialState(userProfile).settings, ...prev.settings },
      history: prev.history,
      progress: {
        ...buildInitialState(userProfile).progress,
        ...prev.progress,
      },
      heatmap: prev.heatmap,
      isAuthenticated: true,
      authStep: "success",
    }));
  };

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    const { data } = await userApi.post("/api/auth/login", { email, password });
    // Fetch full profile
    const profileRes = await userApi.get("/api/users/me", {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    _applyUserSession(data.accessToken, data.refreshToken, profileRes.data);
  };

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  const signup = async (name, email, password) => {
    const { data } = await userApi.post("/api/auth/register", {
      fullName: name,
      email,
      password,
    });
    // Register auto-logs in — apply session directly
    const profileRes = await userApi.get("/api/users/me", {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    _applyUserSession(data.accessToken, data.refreshToken, profileRes.data);
  };

  // ── VERIFY OTP (password reset flow) ─────────────────────────────────────
  const verifyOtp = (code) => {
    // OTP screen is only for password-reset in this app.
    // After verifying, proceed to reset-password page.
    setState((prev) => ({ ...prev, authStep: "success" }));
  };

  // ── GOOGLE LOGIN (mock — keeps existing behaviour) ────────────────────────
  // ── GOOGLE LOGIN ────────────────────────────────────────────────────────
  const loginWithGoogle = async (googleAccessToken) => {
    try {
      // Fetch user info from Google using the access token
      const userInfoRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });
      
      const googleUser = userInfoRes.data;

      // Send to our backend
      const { data } = await userApi.post("/api/auth/google", {
        token: googleAccessToken,
        name: googleUser.name || "Student",
        email: googleUser.email,
        googleId: googleUser.sub
      });
      
      // Use the returned JWT tokens from our backend to fetch our actual profile
      const profileRes = await userApi.get("/api/users/me", {
        headers: { Authorization: `Bearer ${data.accessToken}` }
      });
      
      _applyUserSession(data.accessToken, data.refreshToken, profileRes.data);
    } catch (err) {
      console.error("Google Auth Error", err);
      throw err;
    }
  };

  // ── COMPLETE AUTH (called by LoginSuccess page) ───────────────────────────
  const completeAuthAndLogin = () => {
    setState((prev) => ({ ...prev, isAuthenticated: true, authStep: "landing" }));
  };

  const addModule = (newMod) => {
    setState((prev) => {
      const currentModules = prev.modules || [];
      const newId = currentModules.length > 0 ? Math.max(...currentModules.map(m => m.id)) + 1 : 1;
      const mod = {
        ...newMod,
        id: newId,
        completionPercent: 0,
        lessons: newMod.lessons || []
      };
      return {
        ...prev,
        modules: [...currentModules, mod]
      };
    });
  };

  const editModule = (moduleId, updatedMod) => {
    setState((prev) => {
      const currentModules = prev.modules || [];
      const updatedModules = currentModules.map((m) => {
        if (m.id === moduleId) {
          return { ...m, ...updatedMod };
        }
        return m;
      });
      return {
        ...prev,
        modules: updatedModules
      };
    });
  };

  const deleteModule = (moduleId) => {
    setState((prev) => {
      const currentModules = prev.modules || [];
      return {
        ...prev,
        modules: currentModules.filter((m) => m.id !== moduleId)
      };
    });
  };

  const addLesson = (moduleId, newLesson) => {
    setState((prev) => {
      const currentModules = prev.modules || [];
      const updatedModules = currentModules.map((m) => {
        if (m.id === moduleId) {
          let maxId = 0;
          currentModules.forEach(mod => {
            const lessonsList = mod.lessons || [];
            lessonsList.forEach(l => {
              if (l.id > maxId) maxId = l.id;
            });
          });
          const newId = maxId + 1;
          const lesson = {
            ...newLesson,
            id: newId
          };
          return {
            ...m,
            lessons: [...(m.lessons || []), lesson]
          };
        }
        return m;
      });
      return {
        ...prev,
        modules: updatedModules
      };
    });
  };

  const editLesson = (moduleId, lessonId, updatedLesson) => {
    setState((prev) => {
      const currentModules = prev.modules || [];
      const updatedModules = currentModules.map((m) => {
        if (m.id === moduleId) {
          const lessonsList = m.lessons || [];
          const updatedLessons = lessonsList.map((l) => {
            if (l.id === lessonId) {
              return { ...l, ...updatedLesson };
            }
            return l;
          });
          return {
            ...m,
            lessons: updatedLessons
          };
        }
        return m;
      });
      return {
        ...prev,
        modules: updatedModules
      };
    });
  };

  const deleteLesson = (moduleId, lessonId) => {
    setState((prev) => {
      const currentModules = prev.modules || [];
      const updatedModules = currentModules.map((m) => {
        if (m.id === moduleId) {
          const lessonsList = m.lessons || [];
          return {
            ...m,
            lessons: lessonsList.filter((l) => l.id !== lessonId)
          };
        }
        return m;
      });
      return {
        ...prev,
        modules: updatedModules
      };
    });
  };

  const addQuizLevel = (newLevel, questions) => {
    setState((prev) => {
      const currentLevels = prev.levels || [];
      const newId = currentLevels.length > 0 ? Math.max(...currentLevels.map(l => l.id)) + 1 : 1;
      const level = {
        ...newLevel,
        id: newId,
        questionsCount: questions.length
      };
      const updatedQuestions = {
        ...(prev.quizQuestions || {}),
        [newId]: questions
      };
      return {
        ...prev,
        levels: [...currentLevels, level],
        quizQuestions: updatedQuestions
      };
    });
  };

  const saveQuizLevel = (levelId, updatedLevel, questions) => {
    setState((prev) => {
      const currentLevels = prev.levels || [];
      const updatedLevels = currentLevels.map((l) => {
        if (l.id === levelId) {
          return { ...l, ...updatedLevel, questionsCount: questions.length };
        }
        return l;
      });
      const updatedQuestions = {
        ...(prev.quizQuestions || {}),
        [levelId]: questions
      };
      return {
        ...prev,
        levels: updatedLevels,
        quizQuestions: updatedQuestions
      };
    });
  };

  const deleteQuizLevel = (levelId) => {
    setState((prev) => {
      const currentLevels = prev.levels || [];
      const updatedQuestions = { ...(prev.quizQuestions || {}) };
      delete updatedQuestions[levelId];
      return {
        ...prev,
        levels: currentLevels.filter((l) => l.id !== levelId),
        quizQuestions: updatedQuestions
      };
    });
  };

  const updateSettings = (newSettings) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings,
      },
    }));
  };

  const logout = () => {
    clearAll(); // wipe JWT + user from localStorage
    window.localStorage.removeItem("beyondwords_app_state");
    setState(buildInitialState(null));
  };


  const updateCoursesData = (newCourses) => {
    window.localStorage.setItem("beyondwords_admin_data", JSON.stringify(newCourses));

    const formatDuration = (totalMins) => {
      if (totalMins >= 60) {
        const hrs = Math.floor(totalMins / 60);
        const mins = totalMins % 60;
        return mins > 0 ? `${hrs}h ${mins}min` : `${hrs}h`;
      }
      return `${totalMins} min`;
    };

    const activeModules = [];
    const activeQuizQuestions = { ...state.quizQuestions };

    newCourses.forEach(course => {
      if (course.status === "published") {
        course.modules.forEach(mod => {
          const totalDurationMinutes = (mod.lessons || []).reduce((sum, les) => sum + (les.durationMinutes || 0), 0);
          const totalXp = (mod.lessons || []).length * 20 + (mod.quizzes || []).reduce((sum, qz) => sum + (qz.xpReward || 0), 0);

          activeModules.push({
            id: parseInt(mod.id) || mod.id,
            courseId: course.id,
            title: mod.title,
            description: mod.description || "",
            order: mod.order,
            unlocked: mod.status === "unlocked",
            completionPercent: 0,
            duration: formatDuration(totalDurationMinutes),
            xpReward: totalXp,
            lessons: [
              ...(mod.lessons || []).map(les => ({
                id: parseInt(les.id) || les.id,
                title: les.title,
                type: "lesson",
                videoUrl: les.videoUrl || "",
                meaning: les.description || "",
                aiExplanation: les.aiExplanation || "",
                exampleSentence: les.exampleSentence || "",
                status: les.status || "locked",
                durationMinutes: les.durationMinutes,
              })),
              ...(mod.quizzes || []).map(qz => ({
                id: qz.id,
                title: qz.title,
                type: "quiz",
                status: "locked",
              }))
            ]
          });

          mod.quizzes.forEach(qz => {
            activeQuizQuestions[mod.id] = (qz.questions || []).map((q, idx) => ({
              id: parseInt(q.id) || q.id || idx,
              question: q.text,
              image: q.signImageUrl || "",
              options: [q.options.A, q.options.B, q.options.C, q.options.D],
              answer: q.correctAnswer === "A" ? q.options.A : q.correctAnswer === "B" ? q.options.B : q.correctAnswer === "C" ? q.options.C : q.options.D
            }));
          });
        });
      }
    });

    setState(prev => ({
      ...prev,
      modules: activeModules,
      quizQuestions: activeQuizQuestions
    }));
  };

  const updateQuizCategories = (newCategories) => {
    window.localStorage.setItem("beyondwords_quiz_categories", JSON.stringify(newCategories));
    setState(prev => ({
      ...prev,
      quizCategories: newCategories
    }));
  };

  const t = (key) => {
    const lang = state.settings?.language || "English";
    return translations[lang]?.[key] || translations["English"]?.[key] || key;
  };

  return (
    <AppContext.Provider
      value={{
        state,
        t,
        addXP,
        completeLesson,
        submitQuiz,
        addSearch,
        removeSearch,
        clearAllSearches,
        addSpeechSession,
        toggleModuleExpanded,
        updateSettings,
        logout,
        setAuthStep,
        login,
        signup,
        verifyOtp,
        loginWithGoogle,
        getRegisteredUsers,
        verifyLoginCredentials,
        completeAuthAndLogin,
        addModule,
        editModule,
        deleteModule,
        addLesson,
        editLesson,
        deleteLesson,
        addQuizLevel,
        saveQuizLevel,
        deleteQuizLevel,
        updateCoursesData,
        updateQuizCategories,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppContextProvider");
  }
  return context;
}

