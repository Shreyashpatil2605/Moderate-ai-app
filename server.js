const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

const API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;
const API_URL = "https://api.anthropic.com/v1/messages";

// Route to handle API calls
app.post("/api/messages", async (req, res) => {
  try {
    if (!API_KEY) {
      console.error("❌ API key not configured");
      return res.status(500).json({ error: "API key not configured" });
    }

    const { system, messages, max_tokens } = req.body;

    console.log("📤 Sending request to Anthropic API");
    console.log("  Model: claude-3-5-sonnet-20241022");
    console.log("  Messages:", messages.length);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: max_tokens || 300,
        system,
        messages,
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`❌ API Error ${response.status}:`, responseText);
      return res.status(response.status).json({ error: responseText });
    }

    console.log("✅ Response received from Anthropic");
    const data = JSON.parse(responseText);
    res.json(data);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", apiKeyConfigured: !!API_KEY });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`✓ API proxy listening for requests`);
  console.log(`✓ API Key configured: ${API_KEY ? "YES" : "NO"}`);
});
