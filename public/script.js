const chatBox = document.getElementById("chat-box");
const messageInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const exportBtn = document.getElementById("export-btn"); // Reference to the Export button
const thinkingMessage = document.getElementById("thinking-message");

// Function to display the chat messages
function displayMessage(message, sender) {
  const messageDiv = document.createElement("div");
  messageDiv.classList.add("message");
  const senderSpan = document.createElement("span");
  senderSpan.classList.add(sender === "You" ? "user-message" : "chatgpt-message");
  senderSpan.textContent = `${sender}: `;
  const messageText = document.createElement("span");
  messageText.innerHTML = sender === "You" ? `<p>${message}</p>` : message;

  messageDiv.appendChild(senderSpan);
  messageDiv.appendChild(messageText);
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to the bottom
}

// Function to format and highlight code replies
function formatCode(reply) {
  // Parse the markdown content with marked.js
  const html = marked.parse(reply);
  // Highlight the code using highlight.js
  document.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });
  return html;
}

// Handle send button click
sendBtn.addEventListener("click", async () => {
  const userMessage = messageInput.value.trim();

  if (!userMessage) return;

  // Display the user's message
  displayMessage(userMessage, "You");

  // Show "Thinking..." message
  thinkingMessage.style.display = "block";

  // Clear the input field
  messageInput.value = "";

  try {
    // Send the message to the backend (which calls OpenAI)
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage }),
    });

    const data = await response.json();

    // Hide the "Thinking..." message
    thinkingMessage.style.display = "none";

    // Format and display the response from ChatGPT
    if (data.reply) {
      const formattedReply = formatCode(data.reply); // Format any code blocks
      displayMessage(formattedReply, "ChatGPT");
    } else {
      displayMessage("Sorry, something went wrong.", "ChatGPT");
    }
  } catch (error) {
    // Hide the "Thinking..." message and display an error
    thinkingMessage.style.display = "none";
    displayMessage("Error: Failed to connect to server", "ChatGPT");
  }
});

// Handle Enter key press to send message
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent the default action (new line)
    sendBtn.click(); // Trigger the send button click
  }
});

// Function to export chat log to a .txt file
exportBtn.addEventListener("click", () => {
  let chatLog = "";

  // Loop through all messages and add to the chat log
  const messages = document.querySelectorAll(".message");
  messages.forEach((message) => {
    const sender = message.querySelector("span").textContent;
    const messageText = message.querySelector("span + span").textContent;
    chatLog += `${sender}: ${messageText}\n\n`;
  });

  // Create a Blob object from the chat log text
  const blob = new Blob([chatLog], { type: "text/plain" });

  // Create a link element and trigger a download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat_log.txt"; // Name of the file to download
  link.click();
});
