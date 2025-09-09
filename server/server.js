import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); // allow all origins
app.use(express.json());

// Root endpoint to check server status
app.get("/", (req, res) => {
  res.send("🚀 Server is live! Ready to generate images.");
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await fetch(process.env.HF_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: prompt }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("HF API error:", err);
      return res.status(500).json({ error: "Image generation failed", details: err });
    }

    const contentType = response.headers.get("content-type");

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(500).json({ error: "HF returned JSON", details: data });
    } else {
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;
      return res.json({ image: base64Image });
    }
  } catch (error) {
    console.error("Error generating image:", error);
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
