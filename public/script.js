let conversationHistory = [{ role: "system", content: "You are a helpful assistant who answers questions about programming and web development and machine learning." }];

const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const exportBtn = document.getElementById("export-btn"); // Reference to the Export button
const thinkingMessage = document.getElementById("thinking-message");
const items = document.querySelectorAll(".conversation-item");
let params = new URLSearchParams(window.location.search);

// Function to display the chat messages
// function displayMessage(message, sender) {
//   const messageDiv = document.createElement("div");
//   messageDiv.classList.add("message");

//   const senderSpan = document.createElement("span");
//   senderSpan.classList.add(sender === "You" ? "user-message" : "chatgpt-message");
//   senderSpan.textContent = `${sender}: `;

//   const messageText = document.createElement("span");
//   messageText.innerHTML = formatCode(message); // Always format the message

//   messageDiv.appendChild(senderSpan);
//   messageDiv.appendChild(messageText);
//   chatBox.appendChild(messageDiv);
//   chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to the bottom
// }

function displayMessage(message, sender, typeEffect = false) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");

  const senderSpan = document.createElement("span");
  senderSpan.classList.add(sender === "You" ? "user-message" : "chatgpt-message");
  senderSpan.textContent = `${sender}: `;

  const messageText = document.createElement("span");
  messageDiv.appendChild(senderSpan);
  messageDiv.appendChild(messageText);
  chatBox.appendChild(messageDiv);

  if (typeEffect) {
    // Initialize Typed.js with the message
    new Typed(messageText, {
      strings: [formatCode(message)], // Message to type
      typeSpeed: 0, // Speed of typing (ms per character)
      backSpeed: 0, // Speed of backspacing (optional)
      backDelay: 50, // Delay before starting to delete (optional)
      showCursor: false, // Hide the cursor (optional)
      onTyping: function () {
        chatBox.scrollTop = chatBox.scrollHeight; // Keep scrolling down while typing
      },
      onComplete: function () {
        chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom after typing is complete
        highlightCode(messageText); // Apply syntax highlighting after typing
      },
    });
  } else {
    messageText.innerHTML = formatCode(message);
    chatBox.scrollTop = chatBox.scrollHeight;
    highlightCode(messageText); // Apply syntax highlighting
  }
}

function formatCode(content) {
  return marked.parse(content); // Parse markdown to HTML
}

function highlightCode(element) {
  // Delay to ensure elements are in the DOM
  setTimeout(() => {
    element.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block); // Apply syntax highlighting
    });
  }, 0);
}

// Handle send button click
sendBtn.addEventListener("click", async () => {
  const userMessage = messageInput.value.trim();

  if (!userMessage) return;

  const conversationName = document.querySelector(".conversation-item.active")?.dataset.chatSession || "default-session";

  displayMessage(userMessage, "You"); // Display the user's message
  conversationHistory.push({ role: "user", content: userMessage }); // Add user's message to conversation history
  thinkingMessage.style.display = "block"; // Show "Thinking..." message
  messageInput.value = ""; // Clear the input field

  try {
    // Send the message to the backend (which calls OpenAI)
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversationName, conversationHistory }),
    });

    const data = await response.json();
    thinkingMessage.style.display = "none"; // Hide the "Thinking..." message

    // Format and display the response from ChatGPT
    if (data.reply) {
      displayMessage(data.reply, "ChatGPT", true);
      conversationHistory.push({ role: "assistant", content: data.reply });
    } else {
      displayMessage("Sorry, something went wrong.", "ChatGPT", true);
    }
  } catch (error) {
    // Hide the "Thinking..." message and display an error
    thinkingMessage.style.display = "none";
    displayMessage("Error: Failed to connect to server", "ChatGPT");
  }
});

// Handle Enter key press to send message
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault(); // Prevent the default action (new line)
    sendBtn.click(); // Trigger the send button click
  }
});

// Function to export chat log to a .txt file
// exportBtn.addEventListener("click", () => {
//   let chatLog = "";

//   // Loop through all messages and add to the chat log
//   const messages = document.querySelectorAll(".message");
//   messages.forEach((message) => {
//     const sender = message.querySelector("span").textContent;
//     const messageText = message.querySelector("span + span").textContent;
//     chatLog += `${sender}: ${messageText}\n\n`;
//   });

//   // Create a Blob object from the chat log text
//   const blob = new Blob([chatLog], { type: "text/plain" });

//   // Create a link element and trigger a download
//   const link = document.createElement("a");
//   link.href = URL.createObjectURL(blob);
//   link.download = "chat_log.txt"; // Name of the file to download
//   link.click();
// });

// Handle conversation item clicks
items.forEach((item) => {
  item.addEventListener("click", () => {
    const selectedSession = item.dataset.chatSession;
    params.set("conversation", selectedSession);

    // Remove active class from all items
    items.forEach((el) => el.classList.remove("active"));
    // Add active class to the clicked item
    item.classList.add("active");

    loadConversationFromDB(selectedSession);
  });
});

async function saveConversationToDB(conversationName) {
  try {
    await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: conversationName, messages: conversationHistory }),
    });
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

async function loadConversationFromDB(name) {
  chatBox.innerHTML = "";

  try {
    const response = await fetch(`/api/conversations/${name}`);
    if (response.ok) {
      conversationHistory = await response.json();
      // chatBox.innerHTML = ""; // Clear current conversation

      conversationHistory.forEach((message) => {
        const formattedContent = message.role === "assistant" ? formatCode(message.content) : message.content;
        displayMessage(formattedContent, message.role === "user" ? "You" : "ChatGPT");
      });
    } else {
      displayMessage("No saved conversation found.", "ChatGPT");
    }
  } catch (error) {
    console.error("Error loading conversation:", error);
  }
}

// Call this when the page loads
window.addEventListener("load", () => {
  loadConversationFromDB("session-1"); // Replace 'session-1' with your session identifier
});
