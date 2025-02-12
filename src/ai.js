// ai.js
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page.
`;

// Initialize Google Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048,
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];


async function getRecipeFromGemini(ingredientsArr) {
    const ingredientsString = ingredientsArr.join(", ");
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
        console.error('Gemini API key is not set');
        throw new Error('API key not configured');
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `${SYSTEM_PROMPT} I have ${ingredientsString}. Please give me a recipe you'd recommend I make!`;

      const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
            safetySettings,
      });

      const response = await result.response;
      const text = response.text();

      return text;

    } catch (error) {
        console.error('Error from Gemini API:', error);
        throw new Error('Failed to generate recipe: ' + error.message);
    }
}

export async function getRecipeFromChefClaude(ingredients) {
    try {
        // First try using Gemini
        return await getRecipeFromGemini(ingredients);
    } catch (error) {
        // Fallback response if API fails
        return `# Simple Recipe with ${ingredients[0]}

Here's a basic recipe using your ingredients:

## Ingredients
${ingredients.map(ing => `* ${ing}`).join('\n')}

## Instructions
1. Combine ingredients in a suitable way
2. Cook until done
3. Enjoy your meal!

Note: This is a fallback recipe as we couldn't connect to our recipe service. Please try again later.`;
    }
}