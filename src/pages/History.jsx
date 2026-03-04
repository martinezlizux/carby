import React from 'react';
import styles from './History.module.css';

const History = () => {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>History</h1>
                <p className={styles.subtitle}>Your past meals and carbs.</p>
            </header>

            <main className={styles.main}>
                <div className={styles.emptyState}>
                    <i className={`fa-solid fa-utensils ${styles.emptyIcon}`}></i>
                    <p>No meals recorded yet.</p>
                    <p className={styles.hint}>Head to the chat to log your first meal!</p>
                </div>
            </main>
        </div>
    );
};

export default History;
