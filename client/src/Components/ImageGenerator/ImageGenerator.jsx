import React, { useRef, useState } from "react";
import "./ImageGenerator.css";
import default_image from "../Assets/default_image.svg";

const ImageGenerator = () => {
  const [image_url, setImage_url] = useState(default_image);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef(null);

  const imageGenerator = async () => {
   if (!inputRef.current.value) return;

  setLoading(true);
  setError("");
  setImage_url(default_image);

  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: inputRef.current.value }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, details: ${errText}`);
    }

    const data = await response.json();

    if (data?.image) {
      setImage_url(data.image);
    } else if (data?.error?.includes("exceeded")) {
      // 💡 Detect Hugging Face credit limit error
      setError(
        "Monthly credits exceeded. Please try again next month or upgrade to Hugging Face PRO."
      );
      console.warn("Hugging Face credit limit reached:", data.details);
    } else {
      setError(data?.error || "Prediction failed");
      console.error("Prediction failed:", data);
    }
  } catch (err) {
    setError("Server error: " + err.message);
    console.error("Error generating image:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="ai-image-generator">
      <div className="header">
        AI image <span>generator</span>
      </div>

      <div className="img-loading">
        <div className="image">
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <img src={image_url} alt="generated" />
          )}
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="searchBox">
        <input
          type="text"
          ref={inputRef}
          className="search-input"
          placeholder="Describe what you want to see..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputRef.current.value.trim() !== "") {
              imageGenerator();
            }
          }}
        />
        <div className="generate-btn" onClick={imageGenerator}>
          {loading ? "Generating..." : "Generate"}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
