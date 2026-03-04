import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import { useWizard } from '../contexts/WizardContext';
import styles from './NameAge.module.css';

const NameAge = () => {
    const navigate = useNavigate();
    const { userData, updateUserData } = useWizard();
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
            title="Let's get to know you"
            currentStep={1}
            totalSteps={4}
            onNext={handleNext}
            disabled={!isFormValid}
        >
            <p className={styles.description}>
                Please enter your name and age to personalize your experience.
            </p>

            <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="name">What is your name?</label>
                <input
                    id="name"
                    type="text"
                    className={styles.inputField}
                    placeholder="e.g. Alex"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="age">How old are you?</label>
                <input
                    id="age"
                    type="number"
                    className={styles.inputField}
                    placeholder="e.g. 25"
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
