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

        const systemPromptText = `Nutritionist (Diabetes). Respond ONLY JSON: { "food_name": "string", "carbs": number, "calories": number, "proteins": number, "fat": number, "sugars": number, "explanation": "Short, in ${userLanguage}" }`
        const systemPromptVision = `Nutritionist (Diabetes). Analyze TOTAL PORTION. Respond ONLY JSON: { "food_name": "string", "carbs": number, "calories": number, "proteins": number, "fat": number, "sugars": number, "explanation": "Short reasoning, in ${userLanguage}" }`

        if (mode === 'text') {
            let error = null

            // Try Groq first (Low Cost / High Speed)
            if (GROQ_API_KEY) {
                try {
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${GROQ_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
                            messages: [
                                { role: 'system', content: systemPromptText },
                                { role: 'user', content: userInput }
                            ],
                            temperature: 0.3,
                            response_format: { type: 'json_object' }
                        })
                    })
                    const data = await response.json()
                    if (data.error) throw new Error(`Groq error: ${data.error.message || JSON.stringify(data.error)}`)
                    const content = data.choices?.[0]?.message?.content
                    if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                } catch (e) {
                    error = e.message
                    console.error("Groq failed, trying Anthropic fallback:", e)
                }
            }

            // Fallback to Anthropic
            if (ANTHROPIC_API_KEY) {
                try {
                    const response = await fetch('https://api.anthropic.com/v1/messages', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-api-key': ANTHROPIC_API_KEY,
                            'anthropic-version': '2023-06-01'
                        },
                        body: JSON.stringify({
                            model: 'claude-3-5-haiku-20241022',
                            max_tokens: 300,
                            system: systemPromptText,
                            messages: [{ role: 'user', content: userInput }]
                        })
                    })
                    const data = await response.json()
                    if (data.error) throw new Error(`Anthropic error: ${JSON.stringify(data.error)}`)
                    const content = data.content?.[0]?.text
                    if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                } catch (e) {
                    error = (error ? error + ' | ' : '') + e.message
                    console.error("Anthropic fallback failed:", e)
                }
            }
            throw new Error(error || 'All AI models failed or both API keys are missing')
        }

        if (mode === 'image') {
            let error = null

            // Groq Vision First (Low Cost)
            if (GROQ_API_KEY) {
                try {
                    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${GROQ_API_KEY}`
                        },
                        body: JSON.stringify({
                            model: 'meta-llama/Llama-4-Scout-17B-16E-Instruct',
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
                    if (data.error) throw new Error(`Groq Vision error: ${data.error.message || JSON.stringify(data.error)}`)
                    const content = data.choices?.[0]?.message?.content
                    if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                } catch (e) {
                    error = e.message
                    console.error("Groq vision failed, trying Anthropic fallback:", e)
                }
            }

            // Anthropic Vision Fallback (High Precision)
            if (ANTHROPIC_API_KEY) {
                try {
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
                            max_tokens: 300,
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
                    if (data.error) {
                        const msg = data.error.message?.includes('credit balance')
                            ? "Anthropic credits exhausted. Please recharge at console.anthropic.com"
                            : data.error.message || JSON.stringify(data.error)
                        throw new Error(`Anthropic Vision error: ${msg}`)
                    }
                    const content = data.content?.[0]?.text
                    if (content) return new Response(content, { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
                } catch (e) {
                    error = (error ? error + ' | ' : '') + e.message
                    console.error("Anthropic fallback vision failed:", e)
                }
            }
            throw new Error(error || 'All Vision models failed or both API keys are missing')
        }

        return new Response(JSON.stringify({ error: 'Invalid mode' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        let availableModels = []
        if (GROQ_API_KEY) {
            try {
                const modelResp = await fetch('https://api.groq.com/openai/v1/models', {
                    headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` }
                })
                const modelData = await modelResp.json()
                availableModels = modelData.data?.map((m: any) => m.id) || []
            } catch (e) {
                console.error("Could not fetch Groq models")
            }
        }

        return new Response(JSON.stringify({
            error: error.message,
            diag: {
                anthropic: !!ANTHROPIC_API_KEY,
                groq: !!GROQ_API_KEY,
                groqModels: availableModels
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
