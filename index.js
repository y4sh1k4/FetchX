const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 600 });


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

app.get("/tweets/:username", async (req, res) => {
  const { username } = req.params;
  const cachedTweets = cache.get(username);

  if (cachedTweets) {
    return res.json(cachedTweets);
  }
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
    console.log(userId)
    const tweetsRes = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=5&tweet.fields=created_at&exclude=retweets,replies&expansions=attachments.media_keys&media.fields=url,preview_image_url`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );
    cache.set(username, tweetsRes.data);
    res.json(tweetsRes.data);
  } catch (error) {
    console.error("Twitter API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch tweets" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
