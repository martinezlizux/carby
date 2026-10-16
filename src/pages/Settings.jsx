import React from 'react';
import styles from './Settings.module.css';
import { useWizard } from '../contexts/WizardContext';
import AuthModal from '../components/AuthModal';

const Settings = () => {
    const { userData, updateUserData, user, logout, openAuthModal, t } = useWizard();

    const toggleLanguage = () => {
        const newLang = userData.language === 'English' ? 'Spanish' : 'English';
        updateUserData('language', newLang);
    };

    const toggleNotifications = () => {
        updateUserData('notificationsEnabled', !userData.notificationsEnabled);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('settings')}</h1>
                <p className={styles.subtitle}>{t('personalize')}</p>
            </header>

            <main className={styles.main}>
                {/* Language Card */}
                <div className={styles.card} onClick={toggleLanguage}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingTitle}>{t('language')}</span>
                        <span className={styles.settingValue}>
                            {userData.language === 'English' ? 'English' : 'Spanish'}
                        </span>
                    </div>
                    <div className={styles.actionArea}>
                        <span className={styles.switchLabel}>
                            {userData.language === 'English' ? 'US' : 'ES'}
                        </span>
                        <i className="fa-solid fa-chevron-right"></i>
                    </div>
                </div>

                {/* Notifications Card */}
                <div className={styles.card}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingTitle}>{t('notifications')}</span>
                        <span className={styles.settingValue}>
                            {userData.notificationsEnabled ? t('enabled') : t('disabled')}
                        </span>
                    </div>
                    <div
                        className={`${styles.toggle} ${userData.notificationsEnabled ? styles.toggleActive : ''}`}
                        onClick={toggleNotifications}
                    >
                        <div className={styles.toggleKnob}></div>
                    </div>
                </div>

                {/* Account / Sync Card */}
                <div className={styles.card}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingTitle}>Cuenta</span>
                        <span className={styles.settingValue}>
                            {user ? user.email : 'Modo Invitado (Guest)'}
                        </span>
                    </div>
                    <div>
                        {user ? (
                            <button className={styles.logoutBtn} onClick={logout}>
                                Cerrar Sesión
                            </button>
                        ) : (
                            <button className={styles.loginBadge} onClick={openAuthModal}>
                                Iniciar Sesión
                            </button>
                        )}
                    </div>
                </div>
            </main>
            <AuthModal />
        </div>
    );
};

export default Settings;
