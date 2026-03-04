import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import styles from './EditProfile.module.css';

const EditProfile = () => {
    const navigate = useNavigate();
    const { userData, updateUserData } = useWizard();
    const fileInputRef = useRef(null);

    // Local state for the form, initialized from context
    const [formData, setFormData] = useState({
        name: userData.name || '',
        age: userData.age || '',
        gender: userData.gender || 'Female',
        height: userData.height || 165,
        weight: userData.weight || 60,
        diabetesType: userData.diabetesType || 'Type 1',
        avatar: userData.avatar || null,
        // Ensure medications are handles as objects with name property
        medications: userData.medications?.length > 0
            ? userData.medications.map(m => typeof m === 'string' ? { name: m } : m)
            : [{ name: 'Insulin' }],
    });

    const [newMed, setNewMed] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addMedication = () => {
        if (newMed.trim()) {
            setFormData(prev => ({
                ...prev,
                medications: [...prev.medications, { name: newMed.trim(), timing: 'With Meals' }]
            }));
            setNewMed('');
        }
    };

    const removeMedication = (index) => {
        setFormData(prev => ({
            ...prev,
            medications: prev.medications.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        // Bulk update context
        Object.keys(formData).forEach(key => {
            updateUserData(key, formData[key]);
        });
        navigate('/dashboard');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Edit Profile</h1>
                <button className={styles.closeBtn} onClick={() => navigate(-1)}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </header>

            <div className={styles.scrollableContent}>
                <div className={styles.avatarSection}>
                    <div className={styles.avatarPreview} onClick={handleAvatarClick}>
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Profile" className={styles.avatarImage} />
                        ) : (
                            <div className={styles.avatarPlaceholder}>
                                <i className="fa-solid fa-camera"></i>
                            </div>
                        )}
                        <div className={styles.uploadOverlay}>Edit</div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>

                <div className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Medications</label>
                        <div className={styles.medList}>
                            {formData.medications.map((med, index) => (
                                <div key={index} className={styles.medTag}>
                                    {med.name}
                                    <button onClick={() => removeMedication(index)} className={styles.removeMed}>
                                        <i className="fa-solid fa-circle-xmark"></i>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.addMedRow}>
                            <input
                                type="text"
                                placeholder="Add medication..."
                                value={newMed}
                                onChange={(e) => setNewMed(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addMedication()}
                                className={styles.input}
                                style={{ flex: 1 }}
                            />
                            <button onClick={addMedication} className={styles.addMedBtn}>
                                <i className="fa-solid fa-plus"></i>
                            </button>
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Diabetes Type</label>
                        <select
                            name="diabetesType"
                            value={formData.diabetesType}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value="Type 1">Type 1</option>
                            <option value="Type 2">Type 2</option>
                            <option value="Gestational">Gestational</option>
                        </select>
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <button onClick={handleSave} className={styles.saveBtn}>
                    Save Changes
                </button>
            </footer>
        </div>
    );
};

export default EditProfile;
