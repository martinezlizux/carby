import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import styles from './EditProfile.module.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const { userData, updateUserData, t } = useWizard();
    const fileInputRef = useRef(null);

    const [name, setName] = useState(userData.name || '');
    const [age, setAge] = useState(userData.age || '');
    const [gender, setGender] = useState(userData.gender || '');
    const [height, setHeight] = useState(userData.height || '');
    const [weight, setWeight] = useState(userData.weight || '');
    const [unit, setUnit] = useState('metric');
    const [avatar, setAvatar] = useState(userData.avatar || null);

    const [hasCondition, setHasCondition] = useState(userData.hasCondition || false);
    const [diabetesType, setDiabetesType] = useState(userData.diabetesType || 'Type 1');
    const [takesMedication, setTakesMedication] = useState(userData.takesMedication || false);
    const [medications, setMedications] = useState(
        userData.medications?.length > 0 ? userData.medications.map(m => typeof m === 'string' ? { id: Date.now(), name: m, timing: 'Morning' } : { ...m, id: m.id || Date.now() + Math.random() }) : []
    );
    const [useCarbRatio, setUseCarbRatio] = useState(userData.useCarbRatio || false);
    const [carbRatio, setCarbRatio] = useState(userData.carbRatio || 10);

    const handleHeightImperialChange = (type, value) => {
        if (value === '') return;
        const totalInches = Math.round(Number(height || 170) / 2.54);
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
            const totalInches = Math.round((Number(height) || 0) / 2.54);
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
                        value={weight === '' ? '' : Math.round(Number(weight) * 2.20462)}
                        onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value) / 2.20462)}
                    />
                    <span className={styles.unit}>lbs</span>
                </div>
            );
        }
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result);
            reader.readAsDataURL(file);
        }
    };

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

    const handleSave = () => {
        const activeMedications = takesMedication
            ? medications.filter(m => m.name.trim() !== '')
            : [];

        updateUserData('name', name);
        updateUserData('age', age);
        updateUserData('gender', gender);
        updateUserData('height', height);
        updateUserData('weight', weight);
        updateUserData('avatar', avatar);
        updateUserData('hasCondition', hasCondition);
        updateUserData('diabetesType', hasCondition ? diabetesType : null);
        updateUserData('takesMedication', hasCondition ? takesMedication : false);
        updateUserData('medications', hasCondition ? activeMedications : []);
        updateUserData('useCarbRatio', hasCondition ? useCarbRatio : false);
        updateUserData('carbRatio', hasCondition ? carbRatio : 10);
        updateUserData('profileEdited', true);

        navigate('/dashboard');
    };

    const getInitials = (n) => {
        if (!n) return 'MD';
        const names = n.trim().split(' ');
        if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        return n.slice(0, 2).toUpperCase();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>{t('profile') || 'Profile'}</h1>
                <button className={styles.closeBtn} onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </header>

            <div className={styles.scrollableContent}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarPreview} onClick={handleAvatarClick}>
                        {avatar ? (
                            <img src={avatar} alt="Profile" className={styles.avatarImage} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                <span className={styles.avatarInitials}>{getInitials(name)}</span>
                            </div>
                        )}
                        <div className={styles.uploadOverlay}>Edit</div>
                    </div>
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>{t('wizNameAgeTitle')}</label>
                    <div className={styles.formGroup}>
                        <p className={styles.subLabel}>{t('wizNameLabel')}</p>
                        <input type="text" className={styles.textInput} value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className={styles.formGroup}>
                        <p className={styles.subLabel}>{t('wizAgeLabel')}</p>
                        <input type="number" className={styles.textInput} value={age} onChange={(e) => setAge(e.target.value)} />
                    </div>
                </div>

                <div className={styles.section}>
                    <label className={styles.label}>{t('wizGenderTitle')}</label>
                    <div className={styles.toggleGroup}>
                        {['female', 'male', 'other'].map(g => (
                            <button
                                key={g}
                                className={`${styles.toggleBtn} ${gender === g ? styles.active : ''}`}
                                onClick={() => setGender(g)}
                            >
                                {g === 'female' ? t('wizGenderFemale') : g === 'male' ? t('wizGenderMale') : t('wizGenderOther')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.flexBetween}>
                        <label className={styles.label} style={{ margin: 0 }}>{t('wizHeightWeightTitle')}</label>
                        <div className={styles.unitToggle}>
                            <button
                                className={`${styles.toggleButton} ${unit === 'metric' ? styles.toggleActive : ''}`}
                                onClick={() => setUnit('metric')}
                            >
                                cm/kg
                            </button>
                            <button
                                className={`${styles.toggleButton} ${unit === 'imperial' ? styles.toggleActive : ''}`}
                                onClick={() => setUnit('imperial')}
                            >
                                ft/lbs
                            </button>
                        </div>
                    </div>
                    <div className={styles.formGroup} style={{ marginTop: '16px' }}>
                        <p className={styles.subLabel}>{t('wizHeightLabel')}</p>
                        {renderHeightInput()}
                    </div>
                    <div className={styles.formGroup}>
                        <p className={styles.subLabel}>{t('wizWeightLabel')}</p>
                        {renderWeightInput()}
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.flexBetween}>
                        <label className={styles.label} style={{ margin: 0 }}>{t('wizManageDiabetesQuestion')}</label>
                        <label className={styles.switch}>
                            <input type="checkbox" checked={hasCondition} onChange={(e) => setHasCondition(e.target.checked)} />
                            <span className={styles.sliderRound}></span>
                        </label>
                    </div>
                </div>

                {hasCondition && (
                    <>
                        <div className={`${styles.section} ${styles.animateFadeIn}`}>
                            <label className={styles.label}>{t('wizManageDiabetesType')}</label>
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

                        <div className={`${styles.section} ${styles.animateFadeIn}`}>
                            <div className={styles.flexBetween}>
                                <label className={styles.label} style={{ margin: 0 }}>{t('wizManageMedicationQuestion')}</label>
                                <label className={styles.switch}>
                                    <input type="checkbox" checked={takesMedication} onChange={(e) => setTakesMedication(e.target.checked)} />
                                    <span className={styles.sliderRound}></span>
                                </label>
                            </div>
                        </div>
                    </>
                )}

                {hasCondition && takesMedication && (
                    <div className={`${styles.section} ${styles.animateFadeIn}`}>
                        <label className={styles.label}>{t('wizManageWhichMedication')}</label>
                        <div className={styles.medicationList}>
                            {medications.map((med, index) => (
                                <div key={med.id || index} className={styles.medicationItem}>
                                    <div className={styles.medicationHeader}>
                                        <span className={styles.medNumber}>{t('wizManageMedicationName')} {index + 1}</span>
                                        <button className={styles.removeBtn} onClick={() => removeMedication(med.id)}><i className="fa-regular fa-trash-can"></i></button>
                                    </div>
                                    <input type="text" className={styles.textInput} placeholder={t('wizManageMedicationPlaceholder')} value={med.name} onChange={(e) => updateMedication(med.id, 'name', e.target.value)} />
                                    <div className={styles.timingGroup}>
                                        <label className={styles.subLabel}>{t('wizManageWhenTake')}</label>
                                        <div className={styles.chipsContainer}>
                                            {['Morning', 'Afternoon', 'Night', 'With Meals', 'Weekly'].map(timing => (
                                                <button key={timing} className={`${styles.chip} ${med.timing === timing ? styles.chipActive : ''}`} onClick={() => updateMedication(med.id, 'timing', timing)}>
                                                    {timing}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={styles.addMedicationBtn} onClick={addMedication}>
                            {t('wizManageAddMedication')}
                        </button>
                    </div>
                )}

                {hasCondition && takesMedication && (
                    <div className={`${styles.section} ${styles.animateFadeIn}`}>
                        <div className={styles.flexBetween}>
                            <label className={styles.label} style={{ margin: 0 }}>{t('wizManageUseCarbRatio')}</label>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={useCarbRatio} onChange={(e) => setUseCarbRatio(e.target.checked)} />
                                <span className={styles.sliderRound}></span>
                            </label>
                        </div>
                        {useCarbRatio && (
                            <div className={styles.animateFadeIn} style={{ marginTop: '24px' }}>
                                <div className={styles.labelRow}>
                                    <label className={styles.label}>{t('wizManageYourRatio')}</label>
                                    <span className={styles.tag}>1U / {carbRatio}g</span>
                                </div>
                                <div className={styles.counterControl}>
                                    <button className={styles.counterBtn} onClick={() => setCarbRatio(Math.max(1, carbRatio - 1))}>-</button>
                                    <span className={styles.counterValue}>{carbRatio}</span>
                                    <button className={styles.counterBtn} onClick={() => setCarbRatio(carbRatio + 1)}>+</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <footer className={styles.footer}>
                <button onClick={handleSave} className={styles.saveBtn}>
                    {t('saveProfile') || 'Guardar'}
                </button>
            </footer>
        </div>
    );
};
export default EditProfile;
