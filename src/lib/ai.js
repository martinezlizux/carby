/**
 * Carby AI Service
 * Handles communication with OpenAI to analyze food and calculate carbs.
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const analyzeFoodWithAI = async (userInput, userLanguage = 'English') => {
    console.log("DEBUG: Starting AI analysis for:", userInput);

    if (!OPENAI_API_KEY) {
        console.error("DEBUG: OPENAI_API_KEY is missing in import.meta.env");
        return null;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are Carby AI, a professional nutrition assistant for people with diabetes. 
                        Respond ONLY with a valid JSON object.
                        JSON structure: { "food_name": "string", "carbs": number, "explanation": "string" }
                        The explanation should be short and in ${userLanguage}.`
                    },
                    {
                        role: "user",
                        content: userInput
                    }
                ],
                temperature: 0.3
            })
        });

        const data = await response.json();
        console.log("DEBUG: Raw API Data:", data);

        if (data.error) {
            console.error("DEBUG: OpenAI API returned an error:", data.error.message);
            return null;
        }

        if (!data.choices || data.choices.length === 0) {
            console.error("DEBUG: No choices returned from OpenAI");
            return null;
        }

        const content = data.choices[0].message.content;
        console.log("DEBUG: Content from AI:", content);

        const cleanJson = content.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("DEBUG: AI Analysis Error:", error);
        return null;
    }
};
