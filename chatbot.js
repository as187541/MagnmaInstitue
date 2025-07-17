// --- Modern Chatbot Logic ---

document.addEventListener("DOMContentLoaded", function () {
  // --- Element References ---
  const chatBubble = document.getElementById("chat-bubble");
  const chatWindow = document.getElementById("chat-window");
  const chatClose = document.getElementById("chat-close");
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const chatSend = document.getElementById("chat-send");

  // --- Data for Responses & Quick Replies ---
  // EASY TO CUSTOMIZE: Add or change keywords and responses here
  const chatResponses = {
    courses:
      "We have several popular programs, including MBBS, B.Tech, and MBA. You can see them all in our <a href='#courses' onclick='closeChat()'>Courses Section</a>. Which one interests you most?",
    colleges:
      "We partner with many prestigious institutions. You can see them in our <a href='#college' onclick='closeChat()'>Colleges Section</a>. You can also ask me about a specific one like 'IQ City' or 'Harvard'.",
    services:
      "We offer Academic Research, International Admissions, Education Funding, and Career Coaching. Find details in our <a href='#services' onclick='closeChat()'>Services Section</a>.",
    contact:
      "You can reach us through the form in our <a href='#contact' onclick='closeChat()'>Contact Section</a> or visit one of our offices. Which city are you in?",
    fee: "Fee structures vary by college and course. For precise details, it's best to book a free session via our <a href='#contact' onclick='closeChat()'>Contact Page</a>.",
    admission:
      "Our admission process is straightforward. We recommend booking a free counselling session on our <a href='#contact' onclick='closeChat()'>Contact Page</a> to get started!",
    hello:
      "Hello! How can I help you? You can ask me about courses, colleges, or services.",
    hi: "Hi there! What information are you looking for today?",
    thanks: "You're welcome! Is there anything else I can help with?",
    "thank you": "You're welcome! Feel free to ask more questions.",
  };

  // EASY TO CUSTOMIZE: These buttons appear at the start of the chat
  const quickReplies = [
    { text: "View Courses", value: "courses" },
    { text: "See Colleges", value: "colleges" },
    { text: "Contact Us", value: "contact" },
  ];

  // --- In chatbot.js, replace the old appendMessage function with this ---

  const appendMessage = (text, type, hasReplies = false) => {
    const messageContainer = document.createElement("div");
    messageContainer.className = `message-line ${type}-line`;

    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${type}-message`;
    messageDiv.innerHTML = text; // Use innerHTML to render links

    if (type === "bot") {
      const avatarImg = document.createElement("img");
      avatarImg.src = "chatbot3.png"; // Path to your avatar
      avatarImg.alt = "Bot Avatar";
      avatarImg.className = "bot-avatar";
      messageContainer.appendChild(avatarImg); // Add avatar first
    }

    messageContainer.appendChild(messageDiv); // Then add the message bubble
    chatBody.appendChild(messageContainer);

    if (hasReplies) {
      // Quick replies are still added at the end of the chat body
      appendQuickReplies();
    }
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const appendQuickReplies = () => {
    const repliesContainer = document.createElement("div");
    repliesContainer.className = "quick-replies";

    quickReplies.forEach((reply) => {
      const button = document.createElement("button");
      button.className = "quick-reply-btn";
      button.textContent = reply.text;
      button.onclick = () => handleQuickReply(reply.value);
      repliesContainer.appendChild(button);
    });
    chatBody.appendChild(repliesContainer);
    chatBody.scrollTop = chatBody.scrollHeight;
  };

  const handleQuickReply = (value) => {
    appendMessage(value, "user");
    generateBotResponse(value);
  };

  const generateBotResponse = (userInput) => {
    userInput = userInput.toLowerCase().trim();
    let response =
      "I'm sorry, I'm not sure how to answer that. You can try asking about 'courses', 'colleges', or 'services'."; // Default response

    // 1. Check for keyword matches
    for (const keyword in chatResponses) {
      if (userInput.includes(keyword)) {
        response = chatResponses[keyword];
        break;
      }
    }

    // 2. Check for specific college names from college-data.js
    if (typeof colleges !== "undefined") {
      for (const collegeId in colleges) {
        const collegeName = colleges[collegeId].name.toLowerCase();
        if (
          userInput.includes(collegeName) ||
          userInput.includes(collegeId.replace("-", " "))
        ) {
          response = `Yes, we are partnered with ${colleges[collegeId].name}. You can <a href="college-template.html?id=${collegeId}" target="_blank">view all the details here</a>.`;
          break;
        }
      }
    }

    setTimeout(() => appendMessage(response, "bot"), 600);
  };

  const handleUserMessage = () => {
    const userInput = chatInput.value.trim();
    if (userInput === "") return;
    appendMessage(userInput, "user");
    chatInput.value = "";
    generateBotResponse(userInput);
  };

  const toggleChatWindow = () => {
    chatWindow.classList.toggle("active");
    chatBubble.classList.toggle("hidden");
  };

  // Make close function globally accessible for onclick attributes in links
  window.closeChat = () => {
    chatWindow.classList.remove("active");
    chatBubble.classList.remove("hidden");
  };

  // --- Event Listeners ---
  chatBubble.addEventListener("click", toggleChatWindow);
  chatClose.addEventListener("click", toggleChatWindow);
  chatSend.addEventListener("click", handleUserMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserMessage();
  });

  // --- Initial Greeting ---
  setTimeout(() => {
    appendMessage(
      "Hello! I'm MagnmaBot. How can I assist you today?",
      "bot",
      true
    );
  }, 1000);
});
