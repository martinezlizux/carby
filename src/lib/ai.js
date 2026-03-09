/**
 * Carby AI Service
 * Uses Claude API (Anthropic) when VITE_ANTHROPIC_API_KEY is set,
 * falls back to Groq if only VITE_GROQ_API_KEY is available.
 */

const ANTHROPIC_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const fetchWithRetry = async (url, options, retries = 1) => {
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000);
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(timeout);
        return response;
    } catch (err) {
        if (retries > 0 && err.name !== 'AbortError') {
            return fetchWithRetry(url, options, retries - 1);
        }
        throw err;
    }
};

// ─── Text analysis (voice / chat) ───────────────────────────────────────────

export const analyzeFoodWithAI = async (userInput, userLanguage = 'English') => {
    console.log("DEBUG: Starting AI text analysis for:", userInput);

    const systemPrompt = `You are Carby AI, a professional nutrition assistant for people with diabetes.
Respond ONLY with a valid JSON object. No extra text.
Prioritize accurate nutritional estimation for calculating insulin doses.
JSON structure: { "food_name": "string", "carbs": number, "calories": number, "proteins": number, "fat": number, "sugars": number, "explanation": "string" }
The explanation should be short and in ${userLanguage}.`;

    // ── Claude (Anthropic) ──────────────────────────────────────────────────
    if (ANTHROPIC_KEY) {
        try {
            const response = await fetchWithRetry(ANTHROPIC_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-haiku-4-5-20251001',
                    max_tokens: 512,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userInput }]
                })
            });

            const data = await response.json();
            console.log("DEBUG: Claude text response:", data);

            if (data.error) {
                console.error("DEBUG: Claude API error:", data.error.message);
                return null;
            }

            const content = data.content?.[0]?.text;
            if (!content) return null;

            const cleanJson = content.replace(/```json|```/g, '').trim();
            return JSON.parse(cleanJson);

        } catch (error) {
            console.error("DEBUG: Claude text analysis error:", error);
            return null;
        }
    }

    // ── Groq fallback ───────────────────────────────────────────────────────
    if (!GROQ_KEY) {
        console.error("DEBUG: No API key found. Set VITE_ANTHROPIC_API_KEY or VITE_GROQ_API_KEY.");
        return null;
    }

    try {
        const response = await fetchWithRetry(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userInput }
                ],
                temperature: 0.3,
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        console.log("DEBUG: Groq text response:", data);

        if (data.error) { console.error("DEBUG: Groq error:", data.error.message); return null; }
        if (!data.choices?.length) return null;

        const content = data.choices[0].message.content;
        const cleanJson = content.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.error("DEBUG: Groq text analysis error:", error);
        return null;
    }
};

// ─── Image / vision analysis (scan) ─────────────────────────────────────────

export const analyzeImageWithAI = async (base64Image, userLanguage = 'English') => {
    console.log("DEBUG: Starting AI image analysis");

    const systemPrompt = `You are Carby AI, a clinical nutritionist specialized in diabetes management.
Your job is to analyze food photos and estimate nutritional values for insulin dose calculation — so accuracy matters.
Always estimate for the TOTAL PORTION visible in the image, not per 100g.
If it's a packaged product with a visible nutrition label, read values from the label directly.
If it's a home-cooked meal or restaurant dish, estimate based on visible portion size.
Respond ONLY with a valid JSON object. No extra text.
JSON structure: { "food_name": "string", "carbs": number, "calories": number, "proteins": number, "fat": number, "sugars": number, "explanation": "Brief reasoning in ${userLanguage}" }`;

    // ── Claude (Anthropic) ──────────────────────────────────────────────────
    if (ANTHROPIC_KEY) {
        try {
            // Anthropic requires raw base64, without the "data:image/jpeg;base64," prefix
            const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
            const mediaType = base64Image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';

            const response = await fetchWithRetry(ANTHROPIC_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': ANTHROPIC_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-6',
                    max_tokens: 512,
                    system: systemPrompt,
                    messages: [{
                        role: 'user',
                        content: [
                            {
                                type: 'image',
                                source: {
                                    type: 'base64',
                                    media_type: mediaType,
                                    data: base64Data
                                }
                            },
                            {
                                type: 'text',
                                text: 'Analyze this food image and return the nutritional values for the portion shown.'
                            }
                        ]
                    }]
                })
            });

            const data = await response.json();
            console.log("DEBUG: Claude vision response:", data);

            if (data.error) {
                console.error("DEBUG: Claude Vision API error:", data.error.message);
                return null;
            }

            const content = data.content?.[0]?.text;
            if (!content) return null;

            const cleanJson = content.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            if (!parsed.food_name) return null;
            return parsed;

        } catch (error) {
            console.error("DEBUG: Claude vision analysis error:", error);
            return null;
        }
    }

    // ── Groq fallback ───────────────────────────────────────────────────────
    if (!GROQ_KEY) {
        console.error("DEBUG: No API key found. Set VITE_ANTHROPIC_API_KEY or VITE_GROQ_API_KEY.");
        return null;
    }

    try {
        const response = await fetchWithRetry(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_KEY}`
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-4-scout-17b-16e-instruct',
                messages: [{
                    role: 'system',
                    content: systemPrompt
                }, {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Analyze this food image and return the nutritional values for the portion shown.' },
                        { type: 'image_url', image_url: { url: base64Image } }
                    ]
                }],
                temperature: 0.2,
                response_format: { type: 'json_object' }
            })
        });

        const data = await response.json();
        console.log("DEBUG: Groq vision response:", data);

        if (data.error) { console.error("DEBUG: Groq Vision error:", data.error.message); return null; }
        if (!data.choices?.length) return null;

        const content = data.choices[0].message?.content;
        if (!content) return null;

        const cleanJson = content.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        if (!parsed.food_name) return null;
        return parsed;

    } catch (error) {
        console.error("DEBUG: Groq vision analysis error:", error);
        return null;
    }
};
