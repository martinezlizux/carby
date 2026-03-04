import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import { useWizard } from '../contexts/WizardContext';
import styles from './NameAge.module.css';

const NameAge = () => {
    const navigate = useNavigate();
    const { userData, updateUserData, t } = useWizard();
    const [name, setName] = useState(userData.name || '');
    const [age, setAge] = useState(userData.age || '');

    const handleNext = () => {
        updateUserData('name', name);
        updateUserData('age', age);
        navigate('/gender');
    };

    const isFormValid = name.trim().length > 0 && age > 0;

    return (
        <WizardLayout
            title={t('wizNameAgeTitle')}
            currentStep={2}
            totalSteps={5}
            onNext={handleNext}
            nextLabel={t('wizardContinue')}
            disabled={!isFormValid}
        >
            <p className={styles.description}>
                {t('wizNameAgeDesc')}
            </p>

            <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">{t('wizNameLabel')}</label>
                <input
                    id="name"
                    type="text"
                    className={styles.inputField}
                    placeholder={t('wizNamePlaceholder')}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="age">{t('wizAgeLabel')}</label>
                <input
                    id="age"
                    type="number"
                    className={styles.inputField}
                    placeholder={t('wizAgePlaceholder')}
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="1"
                    max="120"
                />
            </div>
        </WizardLayout>
    );
};

export default NameAge;
