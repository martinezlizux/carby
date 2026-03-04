import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';
import { useWizard } from '../contexts/WizardContext';

const BottomNav = () => {
    const { t } = useWizard();

    return (
        <nav className={styles.bottomNav}>
            <NavLink
                to="/dashboard"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <i className="fa-solid fa-house"></i>
                <span>{t('home')}</span>
            </NavLink>
            <NavLink
                to="/chat"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <i className="fa-solid fa-utensils"></i>
                <span>{t('chat')}</span>
            </NavLink>
            <NavLink
                to="/goals"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <i className="fa-solid fa-star"></i>
                <span>{t('goals')}</span>
            </NavLink>
            <NavLink
                to="/settings"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
                <i className="fa-solid fa-gear"></i>
                <span>{t('settings')}</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;
