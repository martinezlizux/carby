import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import { getMealHistory, deleteMeal } from '../lib/mealHistory';
import styles from './History.module.css';

const History = () => {
    const { t } = useWizard();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        const { data, error } = await getMealHistory();
        if (data) {
            setMeals(data);
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const { error } = await deleteMeal(id);
        if (!error) {
            setMeals(meals.filter(meal => meal.id !== id));
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
    };

    const getSourceLabel = (source) => {
        if (source === 'scan') return t('sourceCamera');
        if (source === 'voice') return t('sourceVoice');
        return t('sourceText');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleRow}>
                    <button onClick={() => navigate('/dashboard')} className={styles.backButton}>
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    <h1 className={styles.title}>{t('historyTitle')}</h1>
                </div>
            </header>

            <main className={styles.main}>
                {loading ? (
                    <div className={styles.emptyState}>
                        <div className={styles.spinner}></div>
                        <p>{t('loadingHistory')}</p>
                    </div>
                ) : meals.length > 0 ? (
                    <div className={styles.mealList}>
                        {meals.map((meal) => (
                            <div key={meal.id} className={styles.mealCard}>
                                <div className={styles.cardIcon}>
                                    <div className={styles.circle}></div>
                                </div>
                                <div className={styles.cardContent}>
                                    <div className={styles.cardHeader}>
                                        <span className={styles.categoryLabel}>{getSourceLabel(meal.source)}</span>
                                        <span className={styles.mealTime}>{formatTime(meal.created_at)}</span>
                                    </div>
                                    <h3 className={styles.mealName}>{meal.food_name}</h3>
                                    <div className={styles.nutrientsRow}>
                                        <span className={styles.nutrientP}>P: {meal.proteins || 0}gr</span>
                                        <span className={styles.nutrientC}>C: {meal.carbs || 0} Gr</span>
                                        <span className={styles.nutrientG}>G: {meal.fat || 0} Gr</span>
                                        <span className={styles.nutrientCal}>{meal.calories || 0} Cal</span>
                                    </div>
                                </div>
                                <button
                                    className={styles.deleteBtn}
                                    onClick={() => handleDelete(meal.id)}
                                >
                                    <i className="fa-regular fa-trash-can"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <i className="fa-solid fa-utensils" style={{ fontSize: '3rem', color: '#CBD5E1', marginBottom: '1rem' }}></i>
                        <p>{t('noHistory')}</p>
                        <p className={styles.hint}>{t('historyHint')}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;

