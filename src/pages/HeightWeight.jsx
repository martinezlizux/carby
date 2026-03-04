import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import { useWizard } from '../contexts/WizardContext';
import styles from './HeightWeight.module.css';

const HeightWeight = () => {
    const navigate = useNavigate();
    const { userData, updateUserData, t } = useWizard();

    const [height, setHeight] = useState(userData.height || 170);
    const [weight, setWeight] = useState(userData.weight || 70);
    const [unit, setUnit] = useState('metric');

    const handleHeightImperialChange = (type, value) => {
        if (value === '') return;
        const totalInches = Math.round(height / 2.54);
        let feet = Math.floor(totalInches / 12);
        let inches = totalInches % 12;

        if (type === 'feet') feet = Number(value);
        if (type === 'inches') inches = Number(value);

        const newTotalInches = (feet * 12) + inches;
        setHeight(Math.round(newTotalInches * 2.54));
    };

    const renderHeightInput = () => {
        if (unit === 'metric') {
            return (
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        className={styles.valueInput}
                        value={height}
                        onChange={(e) => setHeight(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <span className={styles.unit}>cm</span>
                </div>
            );
        } else {
            const totalInches = Math.round((height || 0) / 2.54);
            const feet = Math.floor(totalInches / 12);
            const inches = totalInches % 12;

            return (
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        className={styles.imperialInput}
                        value={feet === 0 && height === '' ? '' : feet}
                        onChange={(e) => handleHeightImperialChange('feet', e.target.value)}
                    />
                    <span className={styles.imperialUnit}>'</span>
                    <input
                        type="number"
                        className={styles.imperialInput}
                        value={feet === 0 && height === '' ? '' : inches}
                        onChange={(e) => handleHeightImperialChange('inches', e.target.value)}
                    />
                    <span className={styles.imperialUnit}>"</span>
                </div>
            );
        }
    };

    const renderWeightInput = () => {
        if (unit === 'metric') {
            return (
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        className={styles.valueInput}
                        value={weight}
                        onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    />
                    <span className={styles.unit}>kg</span>
                </div>
            );
        } else {
            return (
                <div className={styles.inputWrapper}>
                    <input
                        type="number"
                        className={styles.valueInput}
                        value={weight === '' ? '' : Math.round(weight * 2.20462)}
                        onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value) / 2.20462)}
                    />
                    <span className={styles.unit}>lbs</span>
                </div>
            );
        }
    };

    const heightProps = {
        min: unit === 'metric' ? 100 : 39,
        max: unit === 'metric' ? 250 : 98,
        value: unit === 'metric' ? height : Math.round(height / 2.54),
        onChange: (e) => {
            const v = Number(e.target.value);
            setHeight(unit === 'metric' ? v : Math.round(v * 2.54));
        }
    };

    const weightProps = {
        min: unit === 'metric' ? 30 : 66,
        max: unit === 'metric' ? 200 : 440,
        value: unit === 'metric' ? weight : Math.round(weight * 2.20462),
        onChange: (e) => {
            const v = Number(e.target.value);
            setWeight(unit === 'metric' ? v : Math.round(v / 2.20462));
        }
    };

    const handleNext = () => {
        updateUserData('height', height);
        updateUserData('weight', weight);
        navigate('/insuline');
    };

    const handleSkip = () => {
        navigate('/thanks');
    };

    return (
        <WizardLayout
            title={t('wizHeightWeightTitle')}
            currentStep={4}
            totalSteps={5}
            onNext={handleNext}
            onSkip={handleSkip}
            skipLabel={t('wizardSkip')}
            nextLabel={t('wizardContinue')}
            disabled={!height || !weight}
        >
            <div className={styles.unitToggle}>
                <button
                    className={`${styles.toggleButton} ${unit === 'metric' ? styles.toggleActive : ''}`}
                    onClick={() => {
                        setUnit('metric');
                        if (height === '') setHeight(170);
                        if (weight === '') setWeight(70);
                    }}
                >
                    Metric (cm/kg)
                </button>
                <button
                    className={`${styles.toggleButton} ${unit === 'imperial' ? styles.toggleActive : ''}`}
                    onClick={() => {
                        setUnit('imperial');
                        if (height === '') setHeight(170);
                        if (weight === '') setWeight(70);
                    }}
                >
                    Imperial (ft/lbs)
                </button>
            </div>

            <div className={styles.section}>
                <div className={styles.labelRow}>
                    <label className={styles.label}>{t('wizHeightLabel').split(' ')[0]}</label>
                    {renderHeightInput()}
                </div>
                <input
                    type="range"
                    min={heightProps.min}
                    max={heightProps.max}
                    value={heightProps.value}
                    onChange={heightProps.onChange}
                    className={styles.slider}
                />
                <div className={styles.sliderScale}>
                    <span>{unit === 'metric' ? '100cm' : "3'3\""}</span>
                    <span>{unit === 'metric' ? '250cm' : "8'2\""}</span>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.labelRow}>
                    <label className={styles.label}>{t('wizWeightLabel').split(' ')[0]}</label>
                    {renderWeightInput()}
                </div>
                <input
                    type="range"
                    min={weightProps.min}
                    max={weightProps.max}
                    value={weightProps.value}
                    onChange={weightProps.onChange}
                    className={styles.slider}
                />
                <div className={styles.sliderScale}>
                    <span>{unit === 'metric' ? '30kg' : '66lbs'}</span>
                    <span>{unit === 'metric' ? '200kg' : '440lbs'}</span>
                </div>
            </div>
        </WizardLayout>
    );
};

export default HeightWeight;
