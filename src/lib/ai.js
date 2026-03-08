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
                model: "llama-3.3-70b-versatile", // Modelo gratuito, inteligente y rápido de Groq
                messages: [
                    {
                        role: "system",
                        content: `You are Carby AI, a professional nutrition assistant for people with diabetes. 
                        Respond ONLY with a valid JSON object.
                        Prioritize accurate nutritional estimation for calculating insulin doses.
                        JSON structure: { "food_name": "string", "carbs": number, "calories": number, "proteins": number, "fat": number, "explanation": "string" }
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

export const analyzeImageWithAI = async (base64Image, userLanguage = 'English') => {
    console.log("DEBUG: Starting AI Image analysis");

    if (!API_KEY) {
        console.error("DEBUG: API_KEY is missing in import.meta.env");
        return null;
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.2-90b-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `You are Carby AI, a nutritionist. Look at this product image. 
Identify the product and estimate its nutritional values per 100g/ml if possible.
Respond ONLY with a valid JSON object.
JSON structure: { "food_name": "Product Name", "carbs": number, "calories": number, "proteins": number, "fat": number, "sugars": number, "explanation": "Brief reasoning in ${userLanguage}" }`
                            },
                            {
                                type: "image_url",
                                image_url: { url: base64Image }
                            }
                        ]
                    }
                ],
                temperature: 0.2,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        console.log("DEBUG: Raw API Vision Data:", data);

        if (data.error) {
            console.error("DEBUG: Groq Vision API error:", data.error.message);
            return null;
        }

        const content = data.choices[0]?.message?.content;
        const cleanJson = content ? content.replace(/```json|```/g, '').trim() : "{}";
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("DEBUG: AI Vision Analysis Error:", error);
        return null;
    }
};
