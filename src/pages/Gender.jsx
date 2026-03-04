import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import { useWizard } from '../contexts/WizardContext';
import styles from './Gender.module.css';
import { User, Activity } from 'lucide-react';

const Gender = () => {
    const navigate = useNavigate();
    const { userData, updateUserData } = useWizard();
    const [selected, setSelected] = useState(userData.gender);

    const handleNext = () => {
        updateUserData('gender', selected);
        navigate('/height-weight');
    };

    const options = [
        { id: 'female', label: 'Female', icon: <User size={24} /> },
        { id: 'male', label: 'Male', icon: <User size={24} /> },
        { id: 'other', label: 'Other', icon: <User size={24} /> },
    ];

    return (
        <WizardLayout
            title="What's your biological sex?"
            currentStep={2}
            totalSteps={4}
            onNext={handleNext}
            disabled={!selected}
        >
            <p className={styles.description}>
                This helps us calculate your macro requirements more accurately.
            </p>

            <div className={styles.optionsContainer}>
                {options.map(option => (
                    <button
                        key={option.id}
                        className={`${styles.optionCard} ${selected === option.id ? styles.selected : ''}`}
                        onClick={() => setSelected(option.id)}
                    >
                        <div className={styles.iconWrapper}>
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

export default Gender;
