import express from "express";
import { config } from "dotenv";
import { OpenAI } from "openai";
import path from "path";

config();

const app = express();
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

app.use(express.static("public"));
app.use(express.json());

// Endpoint to handle user input and interact with ChatGPT
app.post("/api/chat", async (req, res) => {
  const { userMessage } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or use 'gpt-3.5-turbo' based on your requirement
      messages: [{ role: "user", content: userMessage }],
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Failed to get response from ChatGPT" });
  }
});

// Serve the frontend HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Set up the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
