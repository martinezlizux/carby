import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { mode, userInput, base64Image, userLanguage = 'English' } = await req.json()

        const systemPromptText = `You are Carby AI, a professional nutrition assistant for people with diabetes.
Respond ONLY with a valid JSON object. No extra text.
Prioritize accurate nutritional estimation for calculating insulin doses.
JSON structure: { "food_name": "string", "carbs": number, "calories": number, "proteins": number, "fat": number, "sugars": number, "explanation": "string" }
The explanation should be short and in ${userLanguage}.`

        const systemPromptVision = `You are Carby AI, a clinical nutritionist specialized in diabetes management.
Your job is to analyze food photos and estimate nutritional values for insulin dose calculation.
Always estimate for the TOTAL PORTION visible in the image.
Respond ONLY with a valid JSON object. No extra text.
JSON structure: { "food_name": "string", "carbs": number, "calories": number, "proteins": number, "fat": number, "sugars": number, "explanation": "Brief reasoning in ${userLanguage}" }`

        if (mode === 'text') {
            // Try Anthropic first
            if (ANTHROPIC_API_KEY) {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-haiku-20241022',
                        max_tokens: 512,
                        system: systemPromptText,
                        messages: [{ role: 'user', content: userInput }]
                    })
                })
                const data = await response.json()
                const content = data.content?.[0]?.text
                if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            // Fallback to Groq
            if (GROQ_API_KEY) {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.3-70b-versatile',
                        messages: [
                            { role: 'system', content: systemPromptText },
                            { role: 'user', content: userInput }
                        ],
                        temperature: 0.3,
                        response_format: { type: 'json_object' }
                    })
                })
                const data = await response.json()
                const content = data.choices?.[0]?.message?.content
                if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }
        }

        if (mode === 'image') {
            if (ANTHROPIC_API_KEY) {
                const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
                const mediaType = base64Image.startsWith('data:image/png') ? 'image/png' : 'image/jpeg'

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 512,
                        system: systemPromptVision,
                        messages: [{
                            role: 'user',
                            content: [
                                { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
                                { type: 'text', text: 'Analyze this food portions.' }
                            ]
                        }]
                    })
                })
                const data = await response.json()
                const content = data.content?.[0]?.text
                if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }

            // Groq Vision Fallback
            if (GROQ_API_KEY) {
                const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'llama-3.2-11b-vision-preview',
                        messages: [
                            { role: 'system', content: systemPromptVision },
                            {
                                role: 'user', content: [
                                    { type: 'text', text: 'Analyze this food portions.' },
                                    { type: 'image_url', image_url: { url: base64Image } }
                                ]
                            }
                        ],
                        response_format: { type: 'json_object' }
                    })
                })
                const data = await response.json()
                const content = data.choices?.[0]?.message?.content
                if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
            }
        }

        return new Response(JSON.stringify({ error: 'No response from AI models' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
