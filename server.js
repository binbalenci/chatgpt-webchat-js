import { config } from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import path from "path";
import ConversationModel from "./models/ConversationModel.js";
import MessageModel from "./models/MessageModel.js";

// Load environment variables from the .env file
config();

/**
 * Connects to the MongoDB database using the connection string from environment variables.
 */
const mongo_db_connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB || "");
    console.log("Connected to the database: chatgpt_conversations");
  } catch (error) {
    console.log(error);
  }
};

// Create an Express app
const app = express();
const port = 3000;

// OpenAPI setup
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Middleware to parse JSON and serve static files
app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Handle user input and get ChatGPT response
app.post("/api/chat", async (req, res) => {
  const { conversationName, conversationHistory } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: conversationHistory,
    });

    const replyContent = response.choices[0].message.content;

    // Save the user's message
    const userMessage = new MessageModel({ role: "user", content: conversationHistory.at(-1).content });
    await userMessage.save();

    // Save the assistant's reply
    const assistantMessage = new MessageModel({ role: "assistant", content: replyContent });
    await assistantMessage.save();

    // Find or create the conversation
    let conversation = await ConversationModel.findOne({ name: conversationName });
    if (!conversation) {
      conversation = new ConversationModel({ name: conversationName, messages: [] });
    }

    // Add message references to the conversation
    conversation.messages.push(userMessage._id, assistantMessage._id);
    await conversation.save();

    res.json({ reply: replyContent });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get response from ChatGPT" });
  }
});

// Save a conversation
app.post("/api/conversations", async (req, res) => {
  const { name, messages } = req.body;

  try {
    let conversation = await ConversationModel.findOne({ name });

    if (conversation) {
      conversation.messages = messages;
    } else {
      conversation = new ConversationModel({ name, messages });
    }

    await conversation.save();
    res.json({ message: "Conversation saved successfully" });
  } catch (error) {
    console.error("Error saving conversation:", error);
    res.status(500).json({ error: "Failed to save conversation" });
  }
});

// Fetch a conversation by name
app.get("/api/conversations/:name", async (req, res) => {
  try {
    const conversation = await ConversationModel.findOne({ name: req.params.name }).populate("messages");
    if (conversation) {
      res.json(conversation.messages);
    } else {
      res.status(404).json({ error: "Conversation not found" });
    }
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// Serve the frontend HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Set up the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Connect to the MongoDB chatgpt_conversations
mongo_db_connect();
