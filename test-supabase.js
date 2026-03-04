import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testInsert() {
    const { data, error } = await supabase
        .from('food_database')
        .insert([{ food_name: 'test_item_calories', carbs: 10, calories: 100 }])
        .select('*');

    console.log('Error:', error);
    console.log('Data:', data);
    process.exit(0);
}
testInsert();
