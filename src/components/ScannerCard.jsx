import React from 'react';
import styles from './ScannerCard.module.css';

const ScannerCard = ({ title, subtitle, icon, buttonText, onClick }) => {
    return (
        <div className={styles.card}>
            <div className={styles.iconWrapper}>
                <i className={`fa-solid ${icon || 'fa-barcode'}`}></i>
            </div>

            <div className={styles.content}>
                <h3 className={styles.title}>{title}</h3>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>

            <div className={styles.actionArea}>
                <button className={styles.scanBtn} onClick={onClick}>
                    <i className="fa-solid fa-camera"></i>
                    {buttonText && <span>{buttonText}</span>}
                </button>
            </div>
        </div>
    );
};

export default ScannerCard;
