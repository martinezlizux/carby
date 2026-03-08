import { supabase } from './supabase';

/**
 * Ensures a user is authenticated (signs in anonymously if necessary)
 */
const ensureAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user;

    const { data: { user: newUser }, error } = await supabase.auth.signInAnonymously();
    if (error) {
        if (error.message.includes('disabled')) {
            console.error('Supabase Error: Anonymous sign-ins are disabled. Please enable them in your Supabase Dashboard (Authentication > Providers > Anonymous).');
        }
        throw error;
    }
    return newUser;
};

/**
 * Saves a meal entry to the meal_history table.
 * @param {Object} meal - The meal data ({ food_name, carbs, calories, source })
 * @returns {Promise<{data: any, error: any}>}
 */
export const saveMeal = async (meal) => {
    try {
        const user = await ensureAuth();

        const { data, error } = await supabase
            .from('food_logs')
            .insert([{
                ...meal,
                user_id: user.id,
                created_at: new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return { data: data[0], error: null };
    } catch (error) {
        console.error('Error saving meal:', error);
        return { data: null, error };
    }
};

/**
 * Retrieves all meals from the history.
 */
export const getMealHistory = async () => {
    try {
        const { data, error } = await supabase
            .from('food_logs')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching meal history:', error);
        return { data: [], error };
    }
};

/**
 * Updates an existing meal entry.
 */
export const updateMeal = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('food_logs')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { data: data[0], error: null };
    } catch (error) {
        console.error('Error updating meal:', error);
        return { data: null, error };
    }
};

/**
 * Deletes a meal from history.
 */
export const deleteMeal = async (id) => {
    try {
        const { error } = await supabase
            .from('food_logs')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error deleting meal:', error);
        return { error };
    }
};
