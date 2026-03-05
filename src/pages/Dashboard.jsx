import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useWizard } from '../contexts/WizardContext';
import carbyCharacter from '../assets/carby-character.png';

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData, t } = useWizard();

    // Default values if none provided
    const displayName = userData.name || 'Markus Dominguez';
    const mainMed = userData.medications?.[0] || { name: t('none'), timing: '' };

    // Check if the user skipped the wizard (incomplete profile), unless they explicitly saved the profile later.
    const isProfileComplete = userData.profileEdited || (userData.height && userData.weight && userData.hasCondition !== undefined);

    const getInitials = (name) => {
        if (!name) return 'MD';
        const names = name.trim().split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const initials = getInitials(displayName);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('dashboardTitle')}</h1>
                <p className={styles.subtitle}>{t('dashboardSubtitle')}</p>
            </header>

            <div className={styles.characterContainer}>
                <img src={carbyCharacter} alt="Carby Character" className={styles.character} />
            </div>

            <main className={styles.main}>
                <button
                    className={styles.logMealBtn}
                    onClick={() => navigate('/chat')}
                >
                    <i className="fa-solid fa-utensils"></i>
                    <span>{t('logMeal')}</span>
                </button>

                <div className={styles.profileSection}>
                    <div className={styles.sectionHeader}>
                        <h2>{t('profile')}</h2>
                        <button className={styles.editBtn} onClick={() => navigate('/profile/edit')}>
                            <i className="fa-solid fa-pencil"></i>
                        </button>
                    </div>
                    <div className={styles.profileCard}>
                        <div className={styles.profilePhoto}>
                            {userData.avatar ? (
                                <img src={userData.avatar} alt="Avatar" className={styles.avatarImage} />
                            ) : (
                                <div className={styles.avatarPlaceholder}>
                                    <span className={styles.avatarInitials}>{initials}</span>
                                </div>
                            )}
                        </div>
                        <div className={styles.profileInfo}>
                            <h3 className={styles.profileName}>{displayName}</h3>
                            {isProfileComplete ? (
                                <div className={styles.profileDetailsRow}>
                                    <div className={styles.profileDetailsCol}>
                                        <p>{t('age')}: {userData.age || '30'}</p>
                                        <p>{t('gender')}: {userData.gender === 'male' ? t('wizGenderMale') : userData.gender === 'female' ? t('wizGenderFemale') : userData.gender || 'Female'}</p>
                                        <p>{t('height')}: {userData.height || '--'} cm</p>
                                        <p>{t('weight')}: {userData.weight || '--'} kg</p>
                                    </div>
                                    <div className={styles.profileDetailsCol}>
                                        <p>{t('diabetes')}: {userData.hasCondition ? (userData.diabetesType || 'Type 1') : t('none')}</p>
                                        <p>{t('med')}: {userData.hasCondition && userData.takesMedication ? mainMed.name : t('none')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.incompleteProfile}>
                                    <p className={styles.incompleteMsg}>{t('completeProfileMsg')}</p>
                                    <button
                                        className={styles.completeProfileBtn}
                                        onClick={() => navigate('/profile/edit')}
                                    >
                                        <i className="fa-solid fa-file-pen" style={{ marginRight: '8px' }}></i>
                                        {t('completeProfileBtn')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isProfileComplete && userData.hasCondition && (
                    <div className={styles.metricsWrapper}>
                        {userData.diabetesType && (
                            <div className={styles.metricCard}>
                                <h3>{t('diabetes')}</h3>
                                <p className={styles.metricValue}>{userData.diabetesType}</p>
                            </div>
                        )}

                        {userData.useCarbRatio && (
                            <div className={styles.metricCard}>
                                <h3>{t('ratio')}</h3>
                                <p className={styles.metricValue}>1:{userData.carbRatio || '10'}</p>
                            </div>
                        )}

                        {userData.medications?.length > 0 && (
                            <div className={styles.metricCard}>
                                <h3>{t('medication')}</h3>
                                <div className={styles.medicationList}>
                                    <div className={styles.medItem}>
                                        <i className="fa-solid fa-pills"></i>
                                        <span>{typeof userData.medications[0] === 'string' ? userData.medications[0] : userData.medications[0].name}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {userData.medications?.length > 0 && userData.medications[0].timing && (
                            <div className={styles.metricCard}>
                                <h3>{t('dosis')}</h3>
                                <p className={styles.metricValue}>{userData.medications[0].timing}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
