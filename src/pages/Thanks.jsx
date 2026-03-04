import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Thanks.module.css';
import { CheckCircle2 } from 'lucide-react';

const Thanks = () => {
    const navigate = useNavigate();

    useEffect(() => {
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
                    <CheckCircle2 size={64} color="var(--color-primary-600)" />
                </div>
                <h1 className={styles.title}>All set!</h1>
                <p className={styles.subtitle}>Your profile has been saved.</p>
                <div className={styles.loader}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                </div>
            </div>
        </div>
    );
};
export default Thanks;
