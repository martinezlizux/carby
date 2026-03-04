import React, { createContext, useContext, useState } from 'react';
import { translations } from '../lib/translations';

const WizardContext = createContext();

export const WizardProvider = ({ children }) => {
    const [userData, setUserData] = useState({
        name: '',
        age: '',
        gender: '',
        height: 170,
        weight: 70,
        diabetesType: 'Type 1',
        usesInsulin: true,
        useCarbRatio: true,
        carbRatio: 10, // 1 unit for every 10g of carbs
        avatar: null, // Base64 or URL
        medications: [{ name: 'Insulin', timing: 'Morning' }],
        language: 'English',
        notificationsEnabled: true,
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
    });

    const updateUserData = (key, value) => {
        setUserData((prev) => ({ ...prev, [key]: value }));
    };

    // Translation function
    const t = (key) => {
        const lang = userData.language || 'English';
        return translations[lang][key] || key;
    };

    return (
        <WizardContext.Provider value={{ userData, updateUserData, t }}>
            {children}
        </WizardContext.Provider>
    );
};

export const useWizard = () => useContext(WizardContext);
