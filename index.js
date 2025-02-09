const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

app.use(express.json());

const MAX_CACHE_SIZE = process.env.MAX_CACHE_SIZE;
let cache = {};

// Home route to display available routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Customizable Caching API!",
    availableRoutes: {
      "POST /cache":
        "Stores a key-value pair in the cache. Expects a JSON body with 'key' and 'value'.",
      "GET /cache/{key}":
        "Retrieves the value for a specific key from the cache.",
      "DELETE /cache/{key}":
        "Removes a specific key-value pair from the cache.",
    },
    instructions:
      "Use the endpoints above to interact with the cache. Make sure to send the correct 'key' and 'value' in your requests.",
  });
});

//POST /cache → Stores a key-value pair.
function storeInCache(key, value) {
  if (!key || !value) {
    return { error: "Key and value are required." };
  }
  if (Object.keys(cache).length >= MAX_CACHE_SIZE) {
    return { error: "Cache is full." };
  }
  cache[key] = value;
  return { message: "Cache stored successfully.", cache };
}

app.post("/cache", (req, res) => {
  try {
    const { key, value } = req.body;
    const result = storeInCache(key, value);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    return res.status(201).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//GET /cache/{key} → Retrieves a value (if exists).
function getCacheValueFromKey(key) {
  if (!(key in cache)) {
    return { error: "Key not found." };
  }
  return { value: cache[key] };
}

app.get("/cache/:key", (req, res) => {
  try {
    const key = req.params.key;
    const result = getCacheValueFromKey(key);
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    return res.status(200).json({ value: result.value });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//DELETE /cache/{key} → Remove from cache.
function deleteCache(key) {
  const keys = Object.keys(cache);
  for (let i = 0; i < keys.length; i++) {
    if (keys[i] === key) {
      delete cache[keys[i]];
      return { message: "Deleted successfully" };
    }
  }
  return { error: "Key not found" };
}

app.delete("/cache/:key", (req, res) => {
  try {
    const key = req.params.key;
    const result = deleteCache(key);
    if (result.error) {
      return res.status(404).json(result.error);
    }
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = app;
