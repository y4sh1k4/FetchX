const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

app.get("/tweets/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const userRes = await axios.get(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );
    const userId = userRes.data.data.id;

    const tweetsRes = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    res.json(tweetsRes.data);
  } catch (error) {
    console.error("Twitter API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch tweets" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
