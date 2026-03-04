import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import { useWizard } from '../contexts/WizardContext';
import styles from './Language.module.css';

const Language = () => {
    const navigate = useNavigate();
    const { userData, updateUserData } = useWizard();
    const [selected, setSelected] = useState(userData.language || 'English');

    const handleNext = () => {
        updateUserData('language', selected);
        navigate('/name-age');
    };

    const options = [
        { id: 'English', label: 'English', icon: '🇺🇸' },
        { id: 'Español', label: 'Español', icon: '🇲🇽' },
    ];

    return (
        <WizardLayout
            title="Choose your language"
            currentStep={1}
            totalSteps={5}
            onNext={handleNext}
            disabled={!selected}
        >
            <p className={styles.description}>
                Select the language you want to use in Carby.
            </p>

            <div className={styles.optionsContainer}>
                {options.map(option => (
                    <button
                        key={option.id}
                        className={`${styles.optionCard} ${selected === option.id ? styles.selected : ''}`}
                        onClick={() => setSelected(option.id)}
                    >
                        <div className={styles.iconWrapper} style={{ fontSize: '24px' }}>
                            {option.icon}
                        </div>
                        <span className={styles.optionLabel}>{option.label}</span>
                        <div className={styles.radioIndicator}>
                            <div className={styles.radioInner} />
                        </div>
                    </button>
                ))}
            </div>
        </WizardLayout>
    );
};

export default Language;
