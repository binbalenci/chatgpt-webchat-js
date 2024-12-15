import { Schema, model } from "mongoose";

const conversationSchema = new Schema({
  name: { type: String, required: true }, // e.g., 'session-123'
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }], // Array of message references
  createdAt: { type: Date, default: Date.now },
});

const ConversationModel = model("Conversation", conversationSchema);

export default ConversationModel;
