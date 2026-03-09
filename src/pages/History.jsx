import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import { getMealHistory, deleteMeal, updateMeal } from '../lib/mealHistory';
import styles from './History.module.css';

const History = () => {
    const { t } = useWizard();
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMeal, setEditingMeal] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        if (editingMeal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [editingMeal]);

    const fetchHistory = async () => {
        setLoading(true);
        const { data } = await getMealHistory();
        if (data) setMeals(data);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const { error } = await deleteMeal(id);
        if (!error) {
            setMeals(meals.filter(meal => meal.id !== id));
            setEditingMeal(null);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingMeal || isSaving) return;
        setIsSaving(true);
        const { data, error } = await updateMeal(editingMeal.id, {
            food_name: editingMeal.food_name,
            carbs: parseFloat(editingMeal.carbs) || 0,
            calories: parseFloat(editingMeal.calories) || 0,
            proteins: parseFloat(editingMeal.proteins) || 0,
            fat: parseFloat(editingMeal.fat) || 0,
        });
        setIsSaving(false);
        if (!error) {
            setMeals(meals.map(m => m.id === editingMeal.id ? { ...m, ...data } : m));
            setEditingMeal(null);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
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
            const label = date === today ? t('todayLabel') :
                date === yesterday ? t('yesterdayLabel') :
                    new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric' });
            if (!groups[label]) groups[label] = [];
            groups[label].push(meal);
        });
        return groups;
    };

    const getDailySummary = (dayMeals) => ({
        carbs: dayMeals.reduce((sum, m) => sum + (parseFloat(m.carbs) || 0), 0),
        calories: dayMeals.reduce((sum, m) => sum + (parseFloat(m.calories) || 0), 0),
    });

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
                        <button className={styles.miniActionBtn} onClick={() => navigate('/scan-ar')}>
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
                        {Object.entries(groupedMeals).map(([dateLabel, dayMeals]) => {
                            const summary = getDailySummary(dayMeals);
                            return (
                                <div key={dateLabel} className={styles.dateGroup}>
                                    <div className={styles.dateGroupHeader}>
                                        <h2 className={styles.sectionTitle}>{dateLabel}</h2>
                                        <div className={styles.dailySummary}>
                                            <span className={styles.summaryCarbs}>
                                                <i className="fa-solid fa-wheat-awn"></i> {summary.carbs.toFixed(0)}g carbos
                                            </span>
                                            <span className={styles.summaryCal}>
                                                {summary.calories.toFixed(0)} kcal
                                            </span>
                                        </div>
                                    </div>
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
                                                        <span className={styles.nutrientC}>C: {meal.carbs || 0}gr</span>
                                                        <span className={styles.nutrientG}>G: {meal.fat || 0}gr</span>
                                                        <span className={styles.nutrientCal}>{meal.calories || 0} Cal</span>
                                                    </div>
                                                </div>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => setEditingMeal({ ...meal })}
                                                    aria-label="Editar comida"
                                                >
                                                    <i className="fa-regular fa-pen-to-square"></i>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className={styles.emptyStateContainer}>
                        <h2 className={styles.emptyStateTitle}>{t('emptyHistoryTitle')}</h2>
                        <p className={styles.emptyStateSubtitle}>{t('emptyHistorySubtitle')}</p>
                    </div>
                )}
            </main>

            {editingMeal && (
                <div className={styles.modalOverlay} onClick={() => setEditingMeal(null)}>
                    <div className={styles.modalSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHandle}></div>
                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Editar registro</h3>
                            <button className={styles.modalClose} onClick={() => setEditingMeal(null)}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div className={styles.modalField}>
                            <label className={styles.modalLabel}>Comida</label>
                            <input
                                className={styles.modalInput}
                                value={editingMeal.food_name}
                                onChange={e => setEditingMeal({ ...editingMeal, food_name: e.target.value })}
                            />
                        </div>

                        <div className={styles.modalNutrients}>
                            <div className={styles.modalNutrientField}>
                                <label className={styles.modalLabel}>Carbos (g)</label>
                                <input
                                    type="number"
                                    className={`${styles.modalInput} ${styles.modalInputCarbs}`}
                                    value={editingMeal.carbs || 0}
                                    onChange={e => setEditingMeal({ ...editingMeal, carbs: e.target.value })}
                                />
                            </div>
                            <div className={styles.modalNutrientField}>
                                <label className={styles.modalLabel}>Calorías</label>
                                <input
                                    type="number"
                                    className={styles.modalInput}
                                    value={editingMeal.calories || 0}
                                    onChange={e => setEditingMeal({ ...editingMeal, calories: e.target.value })}
                                />
                            </div>
                            <div className={styles.modalNutrientField}>
                                <label className={styles.modalLabel}>Proteínas (g)</label>
                                <input
                                    type="number"
                                    className={`${styles.modalInput} ${styles.modalInputProtein}`}
                                    value={editingMeal.proteins || 0}
                                    onChange={e => setEditingMeal({ ...editingMeal, proteins: e.target.value })}
                                />
                            </div>
                            <div className={styles.modalNutrientField}>
                                <label className={styles.modalLabel}>Grasas (g)</label>
                                <input
                                    type="number"
                                    className={`${styles.modalInput} ${styles.modalInputFat}`}
                                    value={editingMeal.fat || 0}
                                    onChange={e => setEditingMeal({ ...editingMeal, fat: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.modalDeleteBtn}
                                onClick={() => handleDelete(editingMeal.id)}
                            >
                                <i className="fa-solid fa-trash"></i> Eliminar
                            </button>
                            <button
                                className={styles.modalSaveBtn}
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
