import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import { useWizard } from '../contexts/WizardContext';
import styles from './Gender.module.css';
import { User, Activity } from 'lucide-react';

const Gender = () => {
    const navigate = useNavigate();
    const { userData, updateUserData, t } = useWizard();
    const [selected, setSelected] = useState(userData.gender);

    const handleNext = () => {
        updateUserData('gender', selected);
        navigate('/height-weight');
    };

    const options = [
        { id: 'female', label: t('wizGenderFemale'), icon: <User size={24} /> },
        { id: 'male', label: t('wizGenderMale'), icon: <User size={24} /> },
        { id: 'other', label: t('wizGenderOther'), icon: <User size={24} /> },
    ];

    return (
        <WizardLayout
            title={t('wizGenderTitle')}
            currentStep={3}
            totalSteps={5}
            onNext={handleNext}
            nextLabel={t('wizardContinue')}
            disabled={!selected}
        >
            <p className={styles.description}>
                {t('wizGenderDesc')}
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
