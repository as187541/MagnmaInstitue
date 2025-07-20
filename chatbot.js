// --- Modern Chatbot Logic ---
// Final Version: Corrected to navigate to #college. Includes course system and auto-reset timer.

document.addEventListener("DOMContentLoaded", function () {
  // --- Element References ---
  const chatBubble = document.getElementById("chat-bubble");
  const chatWindow = document.getElementById("chat-window");
  const chatClose = document.getElementById("chat-close");
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");

  // Variable to hold the ID of our reset timer
  let resetTimerId = null;

  // --- Data Store 1: Specific Course Information ---
  const courseInfo = {
    'cse': "Computer Science and Engineering (CSE) is a very popular choice. We have partnerships with top engineering colleges for this branch.",
    'cse aiml': "CSE with a specialization in AI & Machine Learning is a high-demand field. We can guide you on the best colleges with strong AI programs.",
    'cse data science': "CSE in Data Science is an excellent career choice. We offer expert counseling for universities known for their data science curriculum.",
    'cse cyber security': "CSE in Cyber Security is crucial in today's world. We can help you find colleges with specialized labs and faculty for this stream.",
    'robotics': "Robotics and Automation is an exciting, hands-on field. We can connect you with colleges that have excellent robotics labs and faculty.",
    'it': "Information Technology (IT) is a core branch with wide applications. We provide counseling for top IT programs in various universities.",
    'ece': "Electronics and Communication Engineering (ECE) is a fundamental branch with great scope. We can help you explore top ECE colleges.",
    'mechanical': "Mechanical Engineering is a classic branch with diverse opportunities. We can help you find the best universities for it.",
    'civil': "Civil Engineering is all about building the future. We provide guidance for top colleges in this field.",
    'aerospace': "Aerospace Engineering is a dream for many. We can guide you on the specialized institutions offering this course.",
    'biotechnology': "Biotechnology is a fascinating mix of biology and technology. We have partner institutions with strong biotech departments.",
    'biomedical': "Biomedical Engineering combines medicine with engineering to solve healthcare challenges. It's a noble and growing field.",
    'mbbs': "MBBS (Bachelor of Medicine, Bachelor of Surgery) is the path to becoming a doctor. We provide comprehensive guidance for medical school admissions, both domestic and abroad.",
    'mbbs surgeon': "To become a surgeon, you first complete your MBBS and then pursue a Master of Surgery (MS). We can guide you through the entire pathway.",
    'bds': "BDS (Bachelor of Dental Surgery) is the primary degree for a career in dentistry. We can help you navigate the admissions process for top dental colleges.",
    'bams': "BAMS (Bachelor of Ayurvedic Medicine and Surgery) is a wonderful traditional system of medicine. We can guide you on the best Ayurvedic colleges.",
    'bvsc & ah': "BVSc & AH is the path to becoming a veterinarian. We assist with admissions to colleges known for their veterinary science programs.",
    'bhms': "BHMS (Bachelor of Homeopathic Medicine and Surgery) is a popular alternative medicine field. We can provide information on leading homeopathic institutions."
  };

  const otherCourses = [
    'cse iot blockchain', 'csbs', 'csit', 'cse design', 'cse cloud computing', 'cse communication',
    'cse network', 'cse ai&ds', 'ecse', 'eee', 'eie', 'ece ds', 'ece vlsi design',
    'automobile', 'mechatronics', 'electrical', 'petroleum', 'chemical',
    'nanotechnology', 'agricultural'
  ];

  otherCourses.forEach(course => {
    const formattedName = course.toUpperCase();
    courseInfo[course.toLowerCase()] = `Yes, we provide counseling for ${formattedName}. We can help you explore the best colleges and career opportunities for this specific field.`;
  });

  // UPDATED: This loop now generates links pointing to the 'college' section ID.
  const linkToCollegeSection = ` You can explore relevant institutions in our <a href="#" onclick="navigateAndClose('college')">Colleges Section</a>.`;
  for (const courseKey in courseInfo) {
    courseInfo[courseKey] += linkToCollegeSection;
  }

  // --- Data Store 2: General Intents ---
  const intentResponses = {
    greeting: {
      keywords: ["hello", "hi", "hey", "helo", "yo", "greetings"],
      response: "Hello! I'm MagnmaBot. You can ask about a specific course like 'CSE' or 'MBBS', or about our 'services'."
    },
    coursesAndLevels: {
      keywords: ["courses", "course", "program", "programs", "major", "btech", "b.tech", "b tech"],
      response: "We offer guidance on a wide range of courses like CSE, ECE, MBBS, and more.",
      value: "courses"
    },
    services: {
      keywords: ["services", "what you do", "help", "support", "offer"],
      response: "We offer end-to-end support including Academic Research, International Admissions, Education Funding, and Career Coaching.",
      value: "services"
    },
    applicationProcess: {
      keywords: ["application", "apply", "admission", "admissions", "process", "how to apply", "intake", "deadline"],
      response: "Our admission process is designed to be smooth and straightforward. We handle everything from shortlisting universities to submitting your final application.",
      value: "contact"
    },
    visa: {
      keywords: ["visa", "visas", "immigration", "study permit", "post study work", "psw"],
      response: "We provide complete student visa assistance, from filling out forms to preparing you for the visa interview. This is one of the final and most crucial steps!",
      value: "contact"
    },
    contact: {
      keywords: ["contact", "phone", "email", "address", "location", "talk to", "speak to", "counselor", "appointment"],
      response: "You can reach us through our contact form, book a free appointment, or find our office addresses there.",
      value: "contact"
    },
    // UPDATED: The 'value' now correctly points to 'college' (singular).
    colleges: {
      keywords: ["college", "colleges", "universities", "university", "institution", "collge", "clg", "universty"],
      response: "We partner with many prestigious institutions. You can also ask me about a specific one like 'IQ City' or 'Heritage'.",
      value: "college"
    }
  };

  const quickReplies = [{
    text: "View Courses",
    value: "courses"
  }, {
    // UPDATED: The value for the quick reply is now 'college' (singular).
    text: "View Colleges",
    value: "college"
  }, {
    text: "Contact Us",
    value: "contact"
  }];

  // --- Helper & UI Functions ---

  const removeAllQuickReplies = () => {
    const allReplies = chatBody.querySelectorAll(".quick-replies");
    allReplies.forEach(reply => reply.remove());
  };

  const formatCourseName = (key) => {
    return key.split(' ').map(word => word.length <= 4 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const appendMessage = (text, type) => {
    const messageContainer = document.createElement("div");
    messageContainer.className = `message-line ${type}-line`;
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${type}-message`;
    messageDiv.innerHTML = text;
    if (type === "bot") {
      const avatarImg = document.createElement("img");
      avatarImg.src = "chatbot3.png";
      avatarImg.alt = "Bot Avatar";
      avatarImg.className = "bot-avatar";
      messageContainer.appendChild(avatarImg);
    }
    messageContainer.appendChild(messageDiv);
    chatBody.appendChild(messageContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const appendInitialQuickReplies = () => {
    removeAllQuickReplies();
    const repliesContainer = document.createElement("div");
    repliesContainer.className = "quick-replies";
    quickReplies.forEach((reply) => {
      const button = document.createElement("button");
      button.className = "quick-reply-btn";
      button.textContent = reply.text;
      button.onclick = () => handleQuickReply(reply.value, reply.text);
      repliesContainer.appendChild(button);
    });
    chatBody.appendChild(repliesContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  // --- Chatbot's Brain: The Logic Center ---

  const generateBotResponse = (userInput) => {
    const normalizedInput = userInput.toLowerCase().trim();
    if (normalizedInput.length === 0) {
      return;
    }

    // Pass 1: Check for a specific course match
    for (const courseKey in courseInfo) {
      const regex = new RegExp(`\\b${courseKey}\\b`);
      if (regex.test(normalizedInput)) {
        setTimeout(() => appendMessage(courseInfo[courseKey], "bot"), 600);
        return;
      }
    }

    // Pass 2: Check for general intents and dynamically add navigation links
    for (const intentName in intentResponses) {
      const intent = intentResponses[intentName];
      for (const keyword of intent.keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`);
        if (regex.test(normalizedInput)) {
          let finalResponse = intent.response;

          if (intent.value) {
            const sectionName = intent.value.charAt(0).toUpperCase() + intent.value.slice(1);
            const link = ` You can see more in our <a href="#" onclick="navigateAndClose('${intent.value}')">${sectionName} Section</a>.`;
            finalResponse += link;
          }

          setTimeout(() => appendMessage(finalResponse, "bot"), 600);
          return;
        }
      }
    }

    // Pass 3: Check for a partial course match
    for (const courseKey in courseInfo) {
      if (courseKey.includes(normalizedInput) && courseKey.length > normalizedInput.length + 1) {
        askCourseConfirmation(courseKey);
        return;
      }
    }

    // Fallback: If nothing matches
    const fallbackResponse = "I'm sorry, I don't quite understand. You can ask about a specific course like 'CSE' or 'MBBS', or ask about our 'services'.";
    setTimeout(() => appendMessage(fallbackResponse, "bot"), 600);
  };

  const askCourseConfirmation = (courseKey) => {
    const formattedName = formatCourseName(courseKey);
    const confirmationText = `Hey, did you mean '<strong>${formattedName}</strong>'?`;
    appendMessage(confirmationText, "bot");

    const repliesContainer = document.createElement("div");
    repliesContainer.className = "quick-replies";
    const yesButton = document.createElement("button");
    yesButton.textContent = "Yes";
    yesButton.className = "quick-reply-btn";
    yesButton.onclick = () => handleCourseConfirmation('yes', courseKey);
    const noButton = document.createElement("button");
    noButton.textContent = "No";
    noButton.className = "quick-reply-btn";
    noButton.onclick = () => handleCourseConfirmation('no', null);
    repliesContainer.appendChild(yesButton);
    repliesContainer.appendChild(noButton);
    chatBody.appendChild(repliesContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const handleCourseConfirmation = (answer, courseKey) => {
    removeAllQuickReplies();
    if (answer === 'yes') {
      appendMessage("Yes", "user");
      const response = courseInfo[courseKey];
      setTimeout(() => appendMessage(response, "bot"), 600);
    } else {
      appendMessage("No", "user");
      const response = "My mistake. Could you please rephrase or be more specific about the course you're interested in?";
      setTimeout(() => appendMessage(response, "bot"), 600);
    }
  };

  // --- Core Functions & Event Handlers ---

  const showInitialGreeting = () => {
    setTimeout(() => {
      appendMessage("Hello! I'm MagnmaBot. How can I assist you today?", "bot");
      appendInitialQuickReplies();
    }, 500);
  };

  const resetChat = () => {
    console.log("Chat has been reset due to inactivity.");
    chatBody.innerHTML = '';
    showInitialGreeting();
  };

  const handleUserMessage = () => {
    const userInput = chatInput.value.trim();
    if (userInput === "") return;
    removeAllQuickReplies();
    appendMessage(userInput, "user");
    chatInput.value = "";
    generateBotResponse(userInput);
  };

  const handleQuickReply = (value, text) => {
    removeAllQuickReplies();
    appendMessage(text, "user");
    generateBotResponse(value);
  };

  const toggleChatWindow = () => {
    const isOpening = !chatWindow.classList.contains("active");
    if (isOpening) {
      if (resetTimerId) {
        clearTimeout(resetTimerId);
        resetTimerId = null;
      }
    } else {
      resetTimerId = setTimeout(resetChat, 30000);
    }
    chatWindow.classList.toggle("active");
    chatBubble.classList.toggle("hidden");
  };

  // This globally accessible function handles navigation and closing the chat.
  window.navigateAndClose = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    setTimeout(() => {
      chatWindow.classList.remove("active");
      chatBubble.classList.remove("hidden");
      if (!resetTimerId) {
        resetTimerId = setTimeout(resetChat, 30000);
      }
    }, 500);
  };

  // --- Event Listeners ---
  chatBubble.addEventListener("click", toggleChatWindow);
  chatClose.addEventListener("click", toggleChatWindow);
  chatSend.addEventListener("click", handleUserMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleUserMessage();
    }
  });

  // --- Initial Chat Load ---
  showInitialGreeting();
});
