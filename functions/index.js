const {onRequest} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/params");
const OpenAI = require("openai");

const openaiApiKey = defineSecret("OPENAI_API_KEY");

exports.generateStory = onRequest(
    {secrets: [openaiApiKey], cors: true, timeoutSeconds: 180},
    async (req, res) => {
      const openai = new OpenAI({
        apiKey: openaiApiKey.value(),
      });

      try {
        const prompt =
        req.body.prompt ||
        "Create a story about a brave knight.";

        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {role: "system", content: "You are a creative storyteller."},
            {role: "user", content: prompt},
          ],
        });

        console.log("OpenAI API Key in use");

        const rawStory = response.choices[0]?.message?.content?.trim();

        let formattedStory;
        try {
          const cleanedStory = rawStory.replace(/```json|```/g, "").trim();
          formattedStory = JSON.parse(cleanedStory);
          res.status(200).send({story: formattedStory});
        } catch (jsonError) {
          console.warn(
              "Failed to parse JSON. Returning raw content.",
              jsonError.message,
          );
          res.status(200).send({
            story: rawStory,
            warning: "Story returned as plain text due to JSON parse error.",
          });
        }
      } catch (error) {
        console.error("Error generating story:", error.message);
        res.status(500).send({error: "Failed to generate story."});
      }
    },
);

exports.generateImages = onRequest(
    {secrets: [openaiApiKey], cors: true, timeoutSeconds: 180},
    async (req, res) => {
      const openai = new OpenAI({apiKey: openaiApiKey.value()});
      const {prompts} = req.body;

      if (!Array.isArray(prompts) || prompts.length === 0) {
        return res
            .status(400)
            .send({error: "Prompts must be a non-empty array."});
      }
      try {
        const imageUrls = [];
        for (const prompt of prompts) {
          const response = await openai.images.generate({
            prompt,
            n: 1,
            size: "1024x1024",
            model: "dall-e-3",
          });
          imageUrls.push(response.data[0].url);
        }
        res.status(200).send({images: imageUrls});
      } catch (error) {
        console.error("Error generating images:", error.message);
        res.status(500).send({error: "Failed to generate images."});
      }
    },
);
