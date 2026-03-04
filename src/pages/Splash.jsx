import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';
import balanceImg from '../assets/balance.png';
import { useWizard } from '../contexts/WizardContext';

const Splash = () => {
    const navigate = useNavigate();
    const { t } = useWizard();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation explicitly
        const timer1 = setTimeout(() => setAnimate(true), 100);
        // Transition to next view slightly after animation completes
        const timer2 = setTimeout(() => {
            if (localStorage.getItem('wizardCompleted') === 'true') {
                navigate('/dashboard');
            } else {
                navigate('/language');
            }
        }, 2500);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [navigate]);

    return (
        <div className={styles.splashContainer}>
            <div className={styles.backgroundBlur}></div>
            <div className={`${styles.logoContainer} ${animate ? styles.animateIn : ''}`}>
                <div className={styles.imgWrapper}>
                    <img
                        src={balanceImg}
                        alt="Carby Logo"
                        className={styles.image}
                    />
                </div>
                <h1 className={styles.appName}>Carby</h1>
                <p className={styles.tagline}>{t('splashTagline')}</p>
            </div>
            <div className={styles.loadingPulse}></div>
        </div>
    );
};

export default Splash;
