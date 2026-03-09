import { supabase } from './supabase';

// ─── Text analysis (voice / chat) ───────────────────────────────────────────
export const analyzeFoodWithAI = async (userInput, userLanguage = 'English') => {
    console.log("DEBUG: Requesting AI text analysis via Supabase...");

    try {
        const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: {
                mode: 'text',
                userInput,
                userLanguage
            }
        });

        if (error) throw error;

        console.log("DEBUG: AI response received:", data);
        return data;

    } catch (error) {
        console.error("DEBUG: AI analysis error:", error);
        return null;
    }
};

// ─── Image / vision analysis (scan) ─────────────────────────────────────────
export const analyzeImageWithAI = async (base64Image, userLanguage = 'English') => {
    console.log("DEBUG: Requesting AI image analysis via Supabase...");

    try {
        const { data, error } = await supabase.functions.invoke('analyze-food', {
            body: {
                mode: 'image',
                base64Image,
                userLanguage
            }
        });

        if (error) throw error;

        console.log("DEBUG: AI vision response received:", data);
        return data;

    } catch (error) {
        console.error("DEBUG: AI vision analysis error:", error);
        return null;
    }
};
