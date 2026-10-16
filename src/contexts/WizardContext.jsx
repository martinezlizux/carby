import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { translations } from '../lib/translations';

const WizardContext = createContext();

export const WizardProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    const initialUserData = {
        name: '',
        age: '',
        gender: '',
        height: null,
        weight: null,
        hasCondition: undefined,
        diabetesType: '',
        takesMedication: undefined,
        useCarbRatio: undefined,
        carbRatio: null,
        avatar: null,
        medications: [],
        language: 'English',
        notificationsEnabled: true,
        profileEdited: false,
        achievements: {
            badge1: true,
            badge2: true,
            badge3: false,
            badge4: false,
            badge5: false,
            badge6: false,
            badge7: false,
            badge8: false,
            badge9: false,
            badge10: false,
            badge11: false,
            badge12: true,
            badge13: false,
            badge14: false,
            badge15: false,
            badge16: false,
            badge17: false,
            badge18: false,
        }
    };

    const [userData, setUserData] = useState(() => {
        try {
            const saved = localStorage.getItem('carby_local_profile');
            return saved ? JSON.parse(saved) : initialUserData;
        } catch {
            return initialUserData;
        }
    });

    const updateUserData = (key, value) => {
        setUserData((prev) => {
            const updated = { ...prev, [key]: value };
            try {
                localStorage.setItem('carby_local_profile', JSON.stringify(updated));
            } catch (e) {
                console.error('Error saving local profile:', e);
            }
            return updated;
        });
    };

    // Load profile from Supabase profiles table
    const loadProfileFromSupabase = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error loading profile from Supabase:', error);
                return;
            }

            const authUser = (await supabase.auth.getUser()).data?.user;
            if (data) {
                const loaded = {
                    name: data.name || authUser?.user_metadata?.name || '',
                    age: data.age || '',
                    gender: data.gender || '',
                    height: data.height || null,
                    weight: data.weight || null,
                    hasCondition: data.diabetes_type ? true : false,
                    diabetesType: data.diabetes_type || '',
                    takesMedication: data.takes_medication || false,
                    medications: Array.isArray(data.medications) ? data.medications : [],
                    useCarbRatio: data.use_carb_ratio || false,
                    carbRatio: data.carb_ratio || 10,
                    avatar: null,
                    language: 'Spanish',
                    notificationsEnabled: true,
                    profileEdited: true
                };
                setUserData((prev) => {
                    const merged = { ...prev, ...loaded };
                    try {
                        localStorage.setItem('carby_local_profile', JSON.stringify(merged));
                    } catch {}
                    return merged;
                });
            } else if (authUser?.user_metadata?.name) {
                setUserData((prev) => {
                    const updated = { ...prev, name: authUser.user_metadata.name };
                    try {
                        localStorage.setItem('carby_local_profile', JSON.stringify(updated));
                    } catch {}
                    return updated;
                });
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    }, []);

    // Save profile to Supabase profiles table
    const saveProfileToSupabase = async (overrideData = null) => {
        const dataToSave = overrideData || userData;
        const currentUser = user || (await supabase.auth.getUser()).data?.user;

        if (!currentUser) return { error: 'No user logged in' };

        try {
            const payload = {
                id: currentUser.id,
                name: dataToSave.name || '',
                age: dataToSave.age ? Number(dataToSave.age) : null,
                gender: dataToSave.gender || '',
                height: dataToSave.height ? Number(dataToSave.height) : null,
                weight: dataToSave.weight ? Number(dataToSave.weight) : null,
                diabetes_type: dataToSave.hasCondition ? dataToSave.diabetesType : null,
                takes_medication: dataToSave.hasCondition ? dataToSave.takesMedication : false,
                medications: dataToSave.hasCondition ? dataToSave.medications : [],
                use_carb_ratio: dataToSave.hasCondition ? dataToSave.useCarbRatio : false,
                carb_ratio: dataToSave.hasCondition ? Number(dataToSave.carbRatio) : 10,
                updated_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('profiles')
                .upsert(payload, { onConflict: 'id' })
                .select();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Error saving profile to Supabase:', error);
            return { data: null, error };
        }
    };

    // Auth methods
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error };
        setUser(data.user);
        await loadProfileFromSupabase(data.user.id);
        return { session: data.session, user: data.user, error: null };
    };

    const signup = async (email, password, name = '') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });
        if (error) return { error };

        if (data.user) {
            setUser(data.user);
            if (name) updateUserData('name', name);
            if (data.session) {
                await saveProfileToSupabase({ ...userData, name });
            }
        }
        return { session: data.session, user: data.user, error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setUserData(initialUserData);
        try {
            localStorage.removeItem('carby_local_profile');
        } catch {}
    };

    // Modal controls
    const openAuthModal = () => setIsAuthModalOpen(true);
    const closeAuthModal = () => setIsAuthModalOpen(false);

    // Initial session check & listener
    useEffect(() => {
        let mounted = true;

        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!mounted) return;
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) {
                loadProfileFromSupabase(currentUser.id);
            }
            setAuthLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (!mounted) return;
            const currentUser = session?.user || null;
            setUser(currentUser);
            if (currentUser) {
                await loadProfileFromSupabase(currentUser.id);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [loadProfileFromSupabase]);

    // Translation function
    const t = (key) => {
        const lang = userData.language || 'English';
        return translations[lang]?.[key] || key;
    };

    return (
        <WizardContext.Provider value={{
            userData,
            updateUserData,
            t,
            user,
            isGuest: !user,
            authLoading,
            isAuthModalOpen,
            openAuthModal,
            closeAuthModal,
            login,
            signup,
            logout,
            saveProfileToSupabase,
            loadProfileFromSupabase
        }}>
            {children}
        </WizardContext.Provider>
    );
};

export const useWizard = () => useContext(WizardContext);
