/**
 * Carby AI Service
 * Handles communication with Groq (Free alternative) to analyze food and calculate carbs.
 */

// Usaremos esta llave como la de Groq para que sea rápido de cambiar
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY; 

export const analyzeFoodWithAI = async (userInput, userLanguage = 'English') => {
    console.log("DEBUG: Starting AI analysis for:", userInput);

    if (!API_KEY) {
        console.error("DEBUG: API_KEY is missing in import.meta.env");
        return null;
    }

    try {
        // Usamos la API de Groq que es 100% gratis y compatible con el formato de OpenAI
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama3-8b-8192", // Modelo de Llama 3 (Gratis y ultra rápido)
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
                temperature: 0.3,
                // Groq soporta la respuesta en formato JSON directamente
                response_format: { type: "json_object" } 
            })
        });

        const data = await response.json();
        console.log("DEBUG: Raw API Data:", data);

        if (data.error) {
            console.error("DEBUG: Groq API returned an error:", data.error.message);
            return null;
        }

        if (!data.choices || data.choices.length === 0) {
            console.error("DEBUG: No choices returned from AI");
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
