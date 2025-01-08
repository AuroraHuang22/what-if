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

      const generateStoryAttempt = async (retryCount = 0) => {
        try {
          const prompt =
          req.body.prompt || "Create a story about a brave knight.";

          const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {role: "system", content: "You are a creative storyteller."},
              {role: "user", content: prompt},
            ],
          });

          console.log(`OpenAI API Key in use (Attempt ${retryCount + 1})`);

          const rawStory = response.choices[0]?.message?.content?.trim();

          let formattedStory;
          try {
            const cleanedStory = rawStory.replace(/```json|```/g, "").trim();
            formattedStory = JSON.parse(cleanedStory);
            return {success: true, story: formattedStory};
          } catch (jsonError) {
            console.warn(
                `Failed to parse JSON on attempt ${retryCount + 1}:`,
                jsonError.message,
            );
            if (retryCount < 1) {
              console.log("Retrying story generation...");
              return await generateStoryAttempt(retryCount + 1);
            } else {
              console.warn("Exhausted retries. Returning raw content.");
              return {success: false, story: rawStory};
            }
          }
        } catch (error) {
          console.error("Error generating story:", error.message);
          throw error;
        }
      };

      try {
        const result = await generateStoryAttempt();
        if (result.success) {
          res.status(200).send({story: result.story});
        } else {
          res.status(400).send({
            story: result.story,
            warning: "Story returned as plain text due to JSON parse error.",
          });
        }
      } catch (error) {
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
        const imagePromises = prompts.map(async (prompt) => {
          const response = await openai.images.generate({
            prompt,
            n: 1,
            size: "1024x1024",
            model: "dall-e-3",
            response_format: "b64_json",
          });
          return response.data[0].b64_json;
        });

        const imageB64Array = await Promise.all(imagePromises);
        res.status(200).send({images: imageB64Array});
      } catch (error) {
        console.error("Error generating images:", error.message);
        res.status(500).send({error: "Failed to generate images."});
      }
    },
);
