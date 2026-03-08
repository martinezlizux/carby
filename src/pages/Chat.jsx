import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Lucide icons replaced by FontAwesome
import { useWizard } from '../contexts/WizardContext';
import { analyzeFoodWithAI } from '../lib/ai';
import { saveMeal } from '../lib/mealHistory';
import styles from './Chat.module.css';

const Chat = () => {
    const navigate = useNavigate();
    const { userData } = useWizard();
    const [step, setStep] = useState('input'); // 'input', 'analyzing', 'confirmation'
    const [inputValue, setInputValue] = useState('');
    const [resultData, setResultData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Idioma del usuario (para la IA)
    const userLang = userData?.language || (navigator.language.startsWith('es') ? 'Spanish' : 'English');

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleAnalyze = async () => {
        if (!inputValue.trim()) return;

        setStep('analyzing');
        try {
            const data = await analyzeFoodWithAI(inputValue, userLang);
            if (data) {
                setResultData(data);
                setStep('confirmation');
            } else {
                alert('No se pudo analizar la comida. Intenta de nuevo.');
                setStep('input');
            }
        } catch (error) {
            console.error("Analysis error:", error);
            setStep('input');
        }
    };

    const handleSave = async () => {
        if (!resultData || isSaving) return;

        setIsSaving(true);
        try {
            const { error } = await saveMeal({
                food_name: resultData.food_name,
                carbs: parseFloat(resultData.carbs),
                calories: parseFloat(resultData.calories),
                proteins: parseFloat(resultData.proteins),
                fat: parseFloat(resultData.fat),
                explanation: resultData.explanation,
                source: 'chat'
            });

            if (error) {
                alert('Ocurrió un error al guardar: ' + error.message);
                setIsSaving(false);
            } else {
                navigate('/history');
            }
        } catch (error) {
            console.error("Save error:", error);
            setIsSaving(false);
        }
    };

    const renderInputStep = () => (
        <div className={styles.content}>
            <div className={styles.illustrationContainer}>
                <img src="/src/assets/balance.svg" alt="Balance" className={styles.illustration} />
            </div>

            <div className={styles.inputCard}>
                <textarea
                    className={styles.textarea}
                    placeholder="Describe lo que vas a comer ..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                />

                <button
                    className={styles.primaryButton}
                    onClick={handleAnalyze}
                    disabled={!inputValue.trim()}
                >
                    Analizar
                </button>
            </div>

            <button className={styles.secondaryLink} onClick={handleBack}>
                Cerrar
            </button>
        </div>
    );

    const renderAnalyzingStep = () => (
        <div className={styles.content}>
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Analizando tu comida...</p>
                <p className={styles.loadingSubtext}>Esto tomará solo unos segundos</p>
            </div>
        </div>
    );

    const renderConfirmationStep = () => (
        <div className={styles.content}>
            <div className={styles.illustrationContainer}>
                <img src="/src/assets/balance.svg" alt="Balance" className={styles.illustration} />
            </div>

            <div className={styles.resultCard}>
                <div className={styles.successHeader}>
                    <i className="fa-solid fa-star" style={{ color: '#FBCA08' }}></i>
                    <span className={styles.successTitle}>ANALIZADO CON ÉXITO</span>
                </div>

                <div className={styles.foodNameContainer}>
                    <label className={styles.fieldLabel}>COMIDA DETECTADA</label>
                    <input
                        type="text"
                        className={styles.foodNameInput}
                        value={resultData?.food_name || ''}
                        onChange={(e) => setResultData({ ...resultData, food_name: e.target.value })}
                    />
                </div>

                <div className={styles.nutritionGrid}>
                    <div className={styles.mainNutrient}>
                        <div className={styles.nutrientBadge}>
                            <span className={styles.nutrientLabel}>CALORIAS</span>
                            <div className={styles.nutrientValueContainer}>
                                <input
                                    type="number"
                                    className={styles.nutrientValueInput}
                                    value={resultData?.calories || 0}
                                    onChange={(e) => setResultData({ ...resultData, calories: e.target.value })}
                                />
                                <span className={styles.nutrientUnit}>kcl</span>
                            </div>
                        </div>
                    </div>
                    <div className={styles.otherNutrients}>
                        <div className={styles.nutrientRow}>
                            <span className={styles.smallLabel}>PROTEIN</span>
                            <div className={styles.smallValueContainer}>
                                <input
                                    type="number"
                                    className={`${styles.smallValueInput} ${styles.proteinInput}`}
                                    value={resultData?.proteins || 0}
                                    onChange={(e) => setResultData({ ...resultData, proteins: e.target.value })}
                                />
                                <span className={`${styles.unitSuffix} ${styles.proteinSuffix}`}>gr</span>
                            </div>
                        </div>
                        <div className={styles.nutrientRow}>
                            <span className={styles.smallLabel}>CARBS</span>
                            <div className={styles.smallValueContainer}>
                                <input
                                    type="number"
                                    className={`${styles.smallValueInput} ${styles.carbsInput}`}
                                    value={resultData?.carbs || 0}
                                    onChange={(e) => setResultData({ ...resultData, carbs: e.target.value })}
                                />
                                <span className={`${styles.unitSuffix} ${styles.carbsSuffix}`}>gr</span>
                            </div>
                        </div>
                        <div className={styles.nutrientRow}>
                            <span className={styles.smallLabel}>GRASAS</span>
                            <div className={styles.smallValueContainer}>
                                <input
                                    type="number"
                                    className={`${styles.smallValueInput} ${styles.fatInput}`}
                                    value={resultData?.fat || 0}
                                    onChange={(e) => setResultData({ ...resultData, fat: e.target.value })}
                                />
                                <span className={`${styles.unitSuffix} ${styles.fatSuffix}`}>gr</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    className={styles.primaryButton}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    {isSaving ? 'Guardando...' : 'Guardar registro'}
                </button>
            </div>

            <button className={styles.closeLink} onClick={() => setStep('input')}>
                Cerrar
            </button>
        </div>
    );

    return (
        <div className={styles.pageContainer}>
            <header className={styles.header}>
                <h2 className={styles.title}>Nueva entrada</h2>
                <button className={styles.closeButton} onClick={handleBack}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </header>

            {step === 'input' && renderInputStep()}
            {step === 'analyzing' && renderAnalyzingStep()}
            {step === 'confirmation' && renderConfirmationStep()}
        </div>
    );
};

export default Chat;
