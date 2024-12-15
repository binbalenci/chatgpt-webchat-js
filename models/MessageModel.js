import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  role: { type: String, required: true }, // 'user' or 'assistant'
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const MessageModel = model("Message", messageSchema);

export default MessageModel;
