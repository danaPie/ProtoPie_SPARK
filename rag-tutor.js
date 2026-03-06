// rag-tutor.js
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use the key from .env (or Render's environment variables)
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// 🟢 THE FIX: Updated System Prompt to force INLINE citations
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    systemInstruction: {
        parts: [{ text: `You are Bridge Buddy (*SPARK), a helpful and expert AI assistant for ProtoPie users. 
        
        Your primary goal is to answer questions accurately based ONLY on the provided context. 
        
        CRITICAL RULE: Whenever you use information from the context, you MUST embed the [SOURCE] URLs directly within the body text of your response next to the relevant information. Format them as natural Markdown links (e.g., "According to the [ProtoPie Documentation](URL)..." or "[Read more about this here](URL)"). 
        
        DO NOT list the resources at the bottom. Integrate them into the flow of your explanation. If a source says "Internal Notion", just write "Internal ProtoPie Documentation" without a link.` }]
    }
});

let chatSession = null;

async function callBridgeBuddy(prompt, context) {
  try {
    if (!chatSession) {
        chatSession = model.startChat({ history: [] });
    }

    const fullPrompt = `
    CONTEXT:
    ${context}
    
    QUESTION:
    ${prompt}
    `;

    const result = await chatSession.sendMessage(fullPrompt);
    return result.response.text();

  } catch (error) {
    console.error("❌ AI Interaction Error:", error);
    return "I'm having trouble connecting to the AI model right now.";
  }
}

function resetHistory() {
    chatSession = null;
    console.log("🧹 Chat History Wiped.");
}

module.exports = { callBridgeBuddy, resetHistory };