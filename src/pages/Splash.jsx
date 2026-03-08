import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';
import carbyVideo from '../assets/Carby_Grok_hello.mp4';
import { useWizard } from '../contexts/WizardContext';

const Splash = () => {
    const navigate = useNavigate();
    const { t } = useWizard();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation explicitly
        const timer1 = setTimeout(() => setAnimate(true), 100);
        const timer2 = setTimeout(() => {
            const hasCompletedWizard = localStorage.getItem('wizardCompleted');
            if (hasCompletedWizard) {
                navigate('/dashboard');
            } else {
                navigate('/language');
            }
        }, 3500);

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
                    <video
                        src={carbyVideo}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className={styles.video}
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
