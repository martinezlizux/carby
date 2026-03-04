import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WizardLayout from '../components/WizardLayout';
import { useWizard } from '../contexts/WizardContext';
import { supabase } from '../lib/supabase';
import styles from './Insuline.module.css';

const Insuline = () => {
    const navigate = useNavigate();
    const { userData, updateUserData } = useWizard();

    const [diabetesType, setDiabetesType] = useState(userData.diabetesType || 'Type 1');
    const [takesMedication, setTakesMedication] = useState(userData.takesMedication !== undefined ? userData.takesMedication : true);

    // Instead of a single string, we'll store medications as an array of objects
    // Example: [{ id: 1, name: 'Lantus', timing: 'Night' }]
    const [medications, setMedications] = useState(
        userData.medications || [{ id: Date.now(), name: '', timing: 'Morning' }]
    );

    const [useCarbRatio, setUseCarbRatio] = useState(userData.useCarbRatio !== undefined ? userData.useCarbRatio : false);
    const [carbRatio, setCarbRatio] = useState(userData.carbRatio || 10);
    const [isSaving, setIsSaving] = useState(false);

    const addMedication = () => {
        setMedications([...medications, { id: Date.now(), name: '', timing: 'Morning' }]);
    };

    const updateMedication = (id, field, value) => {
        setMedications(medications.map(med =>
            med.id === id ? { ...med, [field]: value } : med
        ));
    };

    const removeMedication = (id) => {
        setMedications(medications.filter(med => med.id !== id));
    };

    const handleNext = async () => {
        // Prepare medication payload for database (as a JSON array)
        const activeMedications = takesMedication
            ? medications.filter(m => m.name.trim() !== '')
            : [];

        // Save to context
        updateUserData('diabetesType', diabetesType);
        updateUserData('takesMedication', takesMedication);
        updateUserData('medications', activeMedications);
        updateUserData('useCarbRatio', useCarbRatio);
        updateUserData('carbRatio', carbRatio);

        setIsSaving(true);
        try {
            const { error } = await supabase.from('profiles').insert([{
                name: userData.name,
                age: parseInt(userData.age, 10),
                gender: userData.gender,
                height: userData.height,
                weight: userData.weight,
                diabetes_type: diabetesType,
                takes_medication: takesMedication,
                medications: activeMedications, // Stored as JSONB in DB
                use_carb_ratio: useCarbRatio,
                carb_ratio: carbRatio
            }]);

            if (error) {
                console.error('Error saving user data:', error);
                // Optionally, we could show a toast here. For now we will proceed.
            }
        } catch (e) {
            console.error('Error during Supabase interaction:', e);
        } finally {
            setIsSaving(false);
            navigate('/thanks');
        }
    };

    return (
        <WizardLayout
            title="How do you manage it?"
            currentStep={4}
            totalSteps={4}
            onNext={handleNext}
            nextLabel={isSaving ? "Saving..." : "Finish Registration"}
            disabled={isSaving}
        >
            <div className={styles.section}>
                <label className={styles.label}>Diabetes Type</label>
                <div className={styles.toggleGroup}>
                    {['Type 1', 'Type 2', 'Gestational'].map(type => (
                        <button
                            key={type}
                            className={`${styles.toggleBtn} ${diabetesType === type ? styles.active : ''}`}
                            onClick={() => setDiabetesType(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.flexBetween}>
                    <label className={styles.label}>Do you take any medication?</label>
                    <label className={styles.switch}>
                        <input
                            type="checkbox"
                            checked={takesMedication}
                            onChange={(e) => setTakesMedication(e.target.checked)}
                        />
                        <span className={styles.sliderRound}></span>
                    </label>
                </div>
            </div>

            {takesMedication && (
                <div className={`${styles.section} ${styles.animateFadeIn}`}>
                    <label className={styles.label}>Which medication(s) do you take?</label>
                    <p className={styles.helperText}>
                        E.g. Lantus, Humalog, Metformin, Ozempic...
                    </p>

                    <div className={styles.medicationList}>
                        {medications.map((med, index) => (
                            <div key={med.id} className={styles.medicationItem}>
                                <div className={styles.medicationHeader}>
                                    <span className={styles.medNumber}>Medication {index + 1}</span>
                                    {medications.length > 1 && (
                                        <button
                                            className={styles.removeBtn}
                                            onClick={() => removeMedication(med.id)}
                                            aria-label="Remove medication"
                                            title="Remove medication"
                                        >
                                            <i className="fa-regular fa-trash-can"></i>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className={styles.textInput}
                                    placeholder="Type medication name..."
                                    value={med.name}
                                    onChange={(e) => updateMedication(med.id, 'name', e.target.value)}
                                />
                                <div className={styles.timingGroup}>
                                    <label className={styles.subLabel}>When do you take it?</label>
                                    <div className={styles.chipsContainer}>
                                        {['Morning', 'Afternoon', 'Night', 'With Meals', 'Weekly'].map(timing => (
                                            <button
                                                key={timing}
                                                className={`${styles.chip} ${med.timing === timing ? styles.chipActive : ''}`}
                                                onClick={() => updateMedication(med.id, 'timing', timing)}
                                            >
                                                {timing}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className={styles.addMedicationBtn} onClick={addMedication}>
                        + Add another medication
                    </button>
                </div>
            )}

            {takesMedication && (
                <div className={`${styles.section} ${styles.animateFadeIn}`}>
                    <div className={styles.flexBetween}>
                        <label className={styles.label}>Use an Insulin-to-Carb Ratio?</label>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={useCarbRatio}
                                onChange={(e) => setUseCarbRatio(e.target.checked)}
                            />
                            <span className={styles.sliderRound}></span>
                        </label>
                    </div>
                    {useCarbRatio && (
                        <div className={styles.animateFadeIn} style={{ marginTop: '24px' }}>
                            <div className={styles.labelRow}>
                                <label className={styles.label}>Your Ratio</label>
                                <span className={styles.tag}>1U / {carbRatio}g</span>
                            </div>
                            <p className={styles.helperText}>
                                How many grams of carbohydrates does 1 unit of insulin cover for you?
                            </p>
                            <div className={styles.counterControl}>
                                <button className={styles.counterBtn} onClick={() => setCarbRatio(Math.max(1, carbRatio - 1))}>-</button>
                                <span className={styles.counterValue}>{carbRatio}</span>
                                <button className={styles.counterBtn} onClick={() => setCarbRatio(carbRatio + 1)}>+</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </WizardLayout>
    );
};

export default Insuline;
