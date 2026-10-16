import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { useWizard } from '../contexts/WizardContext';
import carbyCharacter from '../assets/Dashboard-character-header.png';
import ScannerCard from '../components/ScannerCard';
import { Scan, User, Edit3, Plus, Pill } from 'lucide-react';
import AuthModal from '../components/AuthModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData, isGuest, openAuthModal, t } = useWizard();

    // Default values if none provided
    const isProfileComplete = Boolean(userData.profileEdited || (userData.height && userData.weight && userData.hasCondition !== undefined));
    const displayName = userData.name || (isGuest ? 'Invitado' : 'Usuario');
    const hasMedication = Boolean(userData.hasCondition && userData.takesMedication && userData.medications && userData.medications.length > 0);
    const mainMed = userData.medications?.[0] || { name: 'Medicación', timing: '' };

    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.trim().split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const initials = getInitials(displayName);

    // Helpers to translate technical IDs
    const getGenderLabel = (g) => {
        if (g === 'male') return t('wizGenderMale');
        if (g === 'female') return t('wizGenderFemale');
        if (g === 'other') return t('wizGenderOther');
        return t('wizGenderFemale');
    };

    const getDiabetesLabel = (type) => {
        if (type === 'Type 1') return t('diabetesType1');
        if (type === 'Type 2') return t('diabetesType2');
        if (type === 'Gestational') return t('diabetesGestational');
        return type;
    };

    const getTimingLabel = (tValue) => {
        const timingMap = {
            'Morning': 'timingMorning',
            'Afternoon': 'timingAfternoon',
            'Night': 'timingNight',
            'With Meals': 'timingMeals',
            'Weekly': 'timingWeekly'
        };
        return t(timingMap[tValue] || tValue);
    };

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
                <div className={styles.logMealContainer}>
                    <div className={styles.logMealHeader}>
                        <i className="fa-solid fa-utensils"></i>
                        <span>{t('logMeal')}</span>
                    </div>
                    <div className={styles.logMealActions}>
                        <button className={styles.logMealActionBtn} onClick={() => navigate('/scan')} aria-label={t('ariaTakePhoto')}>
                            <i className="fa-solid fa-camera"></i>
                        </button>
                        <button className={styles.logMealActionBtn} onClick={() => navigate('/voice')} aria-label={t('ariaUseVoice')}>
                            <i className="fa-solid fa-microphone"></i>
                        </button>
                        <button className={styles.logMealActionBtn} onClick={() => navigate('/chat')} aria-label={t('ariaWriteText')}>
                            <i className="fa-solid fa-pen"></i>
                        </button>
                    </div>
                </div>

                <div className={styles.arExplorerCard}>
                    <div className={styles.arExplorerHeader}>
                        <h3 className={styles.arExplorerTitle}>{t('arVirtualReality')}</h3>
                        <p className={styles.arExplorerSub}>{t('arSubtitle')}</p>
                    </div>
                    <button className={styles.arExplorerBtn} onClick={() => navigate('/scan-ar')}>
                        <Scan size={22} color="#ffffff" strokeWidth={2.2} />
                        <span>{t('arExploreFood')}</span>
                    </button>
                </div>

                <div className={styles.profileSection}>
                    {!isProfileComplete ? (
                        /* ── Variant 1: Property 1=No Completo ── */
                        <div className={styles.cardProfile}>
                            <h3 className={styles.cardProfileTitle}>{t('profile')}</h3>
                            <button
                                className={styles.cardProfileCompleteBtn}
                                onClick={() => {
                                    if (isGuest) {
                                        openAuthModal();
                                    } else {
                                        navigate('/profile/edit');
                                    }
                                }}
                            >
                                <User size={20} />
                                <span>{t('completeProfileBtn')}</span>
                            </button>
                        </div>
                    ) : hasMedication ? (
                        /* ── Variant 2: Property 1=Profile + medicamento ── */
                        <div className={styles.cardProfile}>
                            <div className={styles.cardProfileHeader}>
                                <h3 className={styles.cardProfileTitle}>{t('profile')}</h3>
                                <button className={styles.cardProfileEditLink} onClick={() => navigate('/profile/edit')}>
                                    <Edit3 size={15} />
                                    <span>{t('edit') || 'Edit'}</span>
                                </button>
                            </div>
                            
                            <div className={styles.cardProfileInfo}>
                                <span className={styles.cardProfileName}>{displayName}</span>
                                {userData.age && (
                                    <span className={styles.cardProfileAge}>{userData.age} {t('ageUnit') || 'años'}</span>
                                )}
                            </div>

                            <div className={styles.chipsRow}>
                                {userData.gender && <span className={styles.chip}>{getGenderLabel(userData.gender)}</span>}
                                {userData.height && <span className={styles.chip}>H: {userData.height} cm</span>}
                                {userData.weight && <span className={styles.chip}>W: {userData.weight} kg</span>}
                                <span className={styles.chip}>{userData.hasCondition ? getDiabetesLabel(userData.diabetesType) : (t('none') || 'Sin condición')}</span>
                            </div>

                            <div className={styles.chipsRow}>
                                <span className={`${styles.chip} ${styles.chipTreatment}`}>
                                    <Pill size={13} />
                                    <span>{mainMed.name}</span>
                                </span>
                                {userData.useCarbRatio && (
                                    <span className={`${styles.chip} ${styles.chipTreatment}`}>
                                        {t('ratio') || 'Insuline & Carb ratio'} 1:{userData.carbRatio || 10}
                                    </span>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* ── Variant 3: Property 1=Profile +add ── */
                        <div className={styles.cardProfile}>
                            <div className={styles.cardProfileHeader}>
                                <h3 className={styles.cardProfileTitle}>{t('profile')}</h3>
                                <button className={styles.cardProfileEditLink} onClick={() => navigate('/profile/edit')}>
                                    <Edit3 size={15} />
                                    <span>{t('edit') || 'Edit'}</span>
                                </button>
                            </div>
                            
                            <div className={styles.cardProfileInfo}>
                                <span className={styles.cardProfileName}>{displayName}</span>
                                {userData.age && (
                                    <span className={styles.cardProfileAge}>{userData.age} {t('ageUnit') || 'años'}</span>
                                )}
                            </div>

                            <div className={styles.chipsRow}>
                                {userData.gender && <span className={styles.chip}>{getGenderLabel(userData.gender)}</span>}
                                {userData.height && <span className={styles.chip}>H: {userData.height} cm</span>}
                                {userData.weight && <span className={styles.chip}>W: {userData.weight} kg</span>}
                                <span className={styles.chip}>{userData.hasCondition ? getDiabetesLabel(userData.diabetesType) : (t('none') || 'Sin condición')}</span>
                            </div>

                            <button className={styles.cardProfileAddMedBtn} onClick={() => navigate('/profile/edit')}>
                                <Plus size={16} />
                                <span>Add medication</span>
                            </button>
                        </div>
                    )}
                </div>

                {isProfileComplete && userData.hasCondition && (
                    <div className={styles.metricsWrapper}>
                        {userData.diabetesType && (
                            <div className={styles.metricCard}>
                                <h3>{t('diabetes')}</h3>
                                <p className={styles.metricValue}>{getDiabetesLabel(userData.diabetesType)}</p>
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
                                <p className={styles.metricValue}>{getTimingLabel(userData.medications[0].timing)}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            <AuthModal onSuccess={() => navigate('/profile/edit')} />
        </div>
    );
};

export default Dashboard;
