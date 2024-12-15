import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  role: { type: String, required: true }, // 'user' or 'assistant'
  content: { type: String, required: true },
});

const conversationSchema = new Schema({
  name: { type: String, required: true }, // For identifying conversations (e.g., 'session-123')
  messages: [messageSchema],
  createdAt: { type: Date, default: Date.now },
});

const ConversationModel = model("Conversation", conversationSchema);

export default ConversationModel;
