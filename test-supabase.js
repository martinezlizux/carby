
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    console.log("Testing Supabase connection...");
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log("Current user:", user);

    if (!user) {
        console.log("Attempting anonymous sign in...");
        const { data, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) {
            console.error("Sign in error:", signInError);
        } else {
            console.log("Signed in anonymously:", data.user.id);
        }
    }

    console.log("Fetching food_logs...");
    const { data: logs, error: logsError } = await supabase.from('food_logs').select('*').limit(1);
    if (logsError) {
        console.error("Logs error:", logsError);
    } else {
        console.log("Logs fetched:", logs);
    }
}

test();
