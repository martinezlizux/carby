import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Splash.module.css';
import { Activity } from 'lucide-react';

const Splash = () => {
    const navigate = useNavigate();
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Trigger animation explicitly
        const timer1 = setTimeout(() => setAnimate(true), 100);
        // Transition to next view slightly after animation completes
        const timer2 = setTimeout(() => {
            navigate('/name-age');
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
                <div className={styles.iconWrapper}>
                    <Activity size={48} className={styles.icon} />
                </div>
                <h1 className={styles.appName}>Carby</h1>
                <p className={styles.tagline}>Smart macros & insulin tracking</p>
            </div>
            <div className={styles.loadingPulse}></div>
        </div>
    );
};

export default Splash;
