const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const fetch = require("node-fetch");

const openaiApiKey = defineSecret("OPENAI_API_KEY");

exports.openaiProxy = onRequest(
    {secrets: [openaiApiKey]},
    async (req, res) => {
      try {
        const apiKey = openaiApiKey.value();
        const response = await fetch("https://api.openai.com/v1/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`,
          },
          body: JSON.stringify(req.body),
        });

        const data = await response.json();
        res.status(200).send(data);
      } catch (error) {
        console.error("Error communicating with OpenAI:", error);
        res.status(500).send({error: "Failed to communicate with OpenAI API"});
      }
    },
);
