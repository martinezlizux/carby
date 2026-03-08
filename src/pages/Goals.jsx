import React, { useState, useEffect } from 'react';
import styles from './Goals.module.css';
import { useWizard } from '../contexts/WizardContext';
import carbyCharacter from '../assets/carby_character.png';

const Particles = ({ active }) => {
    if (!active) return null;

    return (
        <div className={styles.particles}>
            {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const dist = 40 + Math.random() * 40;
                const tx = Math.cos(angle) * dist + 'px';
                const ty = Math.sin(angle) * dist + 'px';
                return (
                    <div
                        key={i}
                        className={styles.particle}
                        style={{
                            '--tx': tx,
                            '--ty': ty,
                            backgroundColor: ['#2ED199', '#FFD8CC', '#2E91D1', '#FFD700'][i % 4]
                        }}
                    />
                );
            })}
        </div>
    );
};

const Goals = () => {
    const { userData, t } = useWizard();
    const achievements = userData.achievements || {};
    const [isJumping, setIsJumping] = useState(false);
    const [particleTrigger, setParticleTrigger] = useState(null);

    // Initial character jump on load
    useEffect(() => {
        const timer = setTimeout(() => setIsJumping(true), 500);
        const resetTimer = setTimeout(() => setIsJumping(false), 1200);
        return () => {
            clearTimeout(timer);
            clearTimeout(resetTimer);
        };
    }, []);

    const triggerBadgeEffect = (badgeId) => {
        setIsJumping(true);
        setParticleTrigger(badgeId);

        // Haptic Feedback
        if (window.navigator.vibrate) {
            window.navigator.vibrate([50, 30, 50]);
        }

        setTimeout(() => setIsJumping(false), 600);
        setTimeout(() => setParticleTrigger(null), 1000);
    };

    const categories = [
        {
            title: t('catUsage'),
            badges: [
                { id: 'badge1', icon: 'fa-flag', title: t('badge1'), desc: t('badge1Desc') },
                { id: 'badge2', icon: 'fa-calendar-day', title: t('badge2'), desc: t('badge2Desc') },
                { id: 'badge3', icon: 'fa-calendar-week', title: t('badge3'), desc: t('badge3Desc') },
                { id: 'badge4', icon: 'fa-repeat', title: t('badge4'), desc: t('badge4Desc') },
                { id: 'badge5', icon: 'fa-calendar-check', title: t('badge5'), desc: t('badge5Desc') },
                { id: 'badge6', icon: 'fa-bolt', title: t('badge6'), desc: t('badge6Desc') },
            ]
        },
        {
            title: t('catBalance'),
            badges: [
                { id: 'badge7', icon: 'fa-lightbulb', title: t('badge7'), desc: t('badge7Desc') },
                { id: 'badge8', icon: 'fa-scale-balanced', title: t('badge8'), desc: t('badge8Desc') },
                { id: 'badge9', icon: 'fa-moon', title: t('badge9'), desc: t('badge9Desc') },
                { id: 'badge10', icon: 'fa-chart-line', title: t('badge10'), desc: t('badge10Desc') },
                { id: 'badge11', icon: 'fa-bullseye', title: t('badge11'), desc: t('badge11Desc') },
            ]
        },
        {
            title: t('catSelf'),
            badges: [
                { id: 'badge12', icon: 'fa-magnifying-glass', title: t('badge12'), desc: t('badge12Desc') },
                { id: 'badge13', icon: 'fa-compass', title: t('badge13'), desc: t('badge13Desc') },
                { id: 'badge14', icon: 'fa-book-open', title: t('badge14'), desc: t('badge14Desc') },
                { id: 'badge15', icon: 'fa-sliders', title: t('badge15'), desc: t('badge15Desc') },
            ]
        },
        {
            title: t('catHealth'),
            badges: [
                { id: 'badge16', icon: 'fa-leaf', title: t('badge16'), desc: t('badge16Desc') },
                { id: 'badge17', icon: 'fa-candy-cane', title: t('badge17'), desc: t('badge17Desc') },
                { id: 'badge18', icon: 'fa-smile', title: t('badge18'), desc: t('badge18Desc') },
            ]
        }
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>{t('goals')}</h1>
                    <p className={styles.subtitle}>{t('goalsSubtitle')}</p>
                </div>
                <img
                    src={carbyCharacter}
                    alt="Carby"
                    className={`${styles.characterThumb} ${isJumping ? styles.characterJump : ''}`}
                    onClick={() => setIsJumping(true)}
                />
            </header>

            <main className={styles.main}>
                {categories.map((cat, idx) => (
                    <div key={idx} className={styles.categoryCard}>
                        <h2 className={styles.categoryTitle}>{cat.title}</h2>
                        <div className={styles.goalsGrid}>
                            {cat.badges.map((badge) => (
                                <div key={badge.id} className={styles.goalWrapper}>
                                    <div
                                        className={`${styles.goalCard} ${achievements[badge.id] ? styles.unlocked : styles.locked}`}
                                        onClick={() => achievements[badge.id] && triggerBadgeEffect(badge.id)}
                                    >
                                        <div className={styles.iconCircle}>
                                            <i className={`fa-solid ${badge.icon}`}></i>
                                        </div>
                                        <div className={styles.goalInfo}>
                                            <h3 className={styles.goalName}>{badge.title}</h3>
                                            <p className={styles.goalDesc}>{badge.desc}</p>
                                        </div>
                                        {achievements[badge.id] && (
                                            <div className={styles.badgeLabel}>
                                                <i className="fa-solid fa-check"></i>
                                            </div>
                                        )}
                                    </div>
                                    <Particles active={particleTrigger === badge.id} />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default Goals;
