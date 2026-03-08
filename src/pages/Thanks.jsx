import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import styles from './Thanks.module.css';

const Thanks = () => {
    const navigate = useNavigate();
    const { t } = useWizard();

    useEffect(() => {
        // Mark wizard as completed
        localStorage.setItem('wizardCompleted', 'true');

        // Automatically transition to the dashboard
        const timer = setTimeout(() => {
            navigate('/dashboard');
        }, 2800);
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <div className={styles.container}>
            <div className={styles.backgroundBlur}></div>
            <div className={styles.card}>
                <div className={styles.iconCircle}>
                    <i className="fas fa-check-circle" style={{ fontSize: '64px', color: 'var(--color-primary-600)' }}></i>
                </div>
                <h1 className={styles.title}>{t('thanksTitle')}</h1>
                <p className={styles.subtitle}>{t('thanksSubtitle')}</p>
                <div className={styles.loader}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot} style={{ animationDelay: '0.2s' }}></div>
                    <div className={styles.dot} style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};
export default Thanks;
