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

    const groupMealsByDate = (mealsList) => {
        const groups = {};
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        mealsList.forEach(meal => {
            const date = new Date(meal.created_at).toISOString().split('T')[0];
            let label = date === today ? t('todayLabel') :
                date === yesterday ? t('yesterdayLabel') :
                    new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });

            if (!groups[label]) groups[label] = [];
            groups[label].push(meal);
        });
        return groups;
    };

    const groupedMeals = groupMealsByDate(meals);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('historyTitle')}</h1>
            </header>

            <main className={styles.main}>
                <div className={styles.addMealCard}>
                    <div className={styles.addMealHeader}>
                        <h2 className={styles.addMealTitle}>{t('addMealCardTitle')}</h2>
                        <span className={styles.addMealSubtitle}>{t('addMealCardSubtitle')}</span>
                    </div>
                    <div className={styles.miniActions}>
                        <button className={styles.miniActionBtn} onClick={() => navigate('/scan')}>
                            <i className="fa-solid fa-camera"></i>
                        </button>
                        <button className={styles.miniActionBtn} onClick={() => navigate('/voice')}>
                            <i className="fa-solid fa-microphone"></i>
                        </button>
                        <button className={styles.miniActionBtn} onClick={() => navigate('/chat')}>
                            <i className="fa-solid fa-pen"></i>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>{t('loadingHistory')}</p>
                    </div>
                ) : meals.length > 0 ? (
                    <div className={styles.historyContent}>
                        {Object.entries(groupedMeals).map(([dateLabel, dayMeals]) => (
                            <div key={dateLabel} className={styles.dateGroup}>
                                <h2 className={styles.sectionTitle}>{dateLabel}</h2>
                                <div className={styles.mealList}>
                                    {dayMeals.map((meal) => (
                                        <div key={meal.id} className={styles.mealCard}>
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
                                                className={styles.editBtn}
                                                onClick={() => {
                                                    // For now, it could still delete or go to a detail/edit view
                                                    // but the icon is now a pencil per the V3 design
                                                    handleDelete(meal.id);
                                                }}
                                            >
                                                <i className="fa-regular fa-pen-to-square"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={styles.emptyStateContainer}>
                        <h2 className={styles.emptyStateTitle}>{t('emptyHistoryTitle')}</h2>
                        <p className={styles.emptyStateSubtitle}>{t('emptyHistorySubtitle')}</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default History;

