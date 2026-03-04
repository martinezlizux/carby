import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './WizardLayout.module.css';

const WizardLayout = ({ children, title, onBack, onNext, nextLabel = "Continue", disabled = false, currentStep, totalSteps = 3 }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) onBack();
        else navigate(-1);
    };

    return (
        <div className={styles.layoutContainer}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={handleBack} aria-label="Go back">
                    <ArrowLeft size={24} />
                </button>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                    />
                </div>
                <div className={styles.placeholder}></div>
            </header>

            <main className={styles.mainContent}>
                <h1 className={styles.title}>{title}</h1>
                <div className={styles.contentArea}>
                    {children}
                </div>
            </main>

            <footer className={styles.footer}>
                <button
                    className={`${styles.nextButton} ${disabled ? styles.disabled : ''}`}
                    onClick={onNext}
                    disabled={disabled}
                >
                    {nextLabel}
                </button>
            </footer>
        </div>
    );
};

export default WizardLayout;
