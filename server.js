import { config } from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { OpenAI } from "openai";
import path from "path";
import ConversationModel from "./models/ConversationModel.js";

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

// Connect to OpenAI
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// Middleware to parse JSON and serve static files
app.use(express.static("public"));
app.use(express.json());

// Endpoint to handle user input and interact with ChatGPT
app.post("/api/chat", async (req, res) => {
  const { conversationHistory } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or use 'gpt-3.5-turbo' based on your requirement
      messages: conversationHistory,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get response from ChatGPT" });
  }
});

// Save a conversation
app.post("/api/conversations", async (req, res) => {
  const { name, messages } = req.body;

  try {
    let conversation = await Conversation.findOne({ name });

    if (conversation) {
      conversation.messages = messages;
    } else {
      conversation = new Conversation({ name, messages });
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
    const conversation = await Conversation.findOne({ name });
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
