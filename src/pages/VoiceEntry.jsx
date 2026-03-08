import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// No Lucide icons needed here
import { useWizard } from '../contexts/WizardContext';
import { analyzeFoodWithAI } from '../lib/ai';
import { saveMeal } from '../lib/mealHistory';
import styles from './VoiceEntry.module.css';
import balanceIcon from '../assets/balance.svg';

const VoiceEntry = () => {
    const navigate = useNavigate();
    const { userData } = useWizard();
    const [step, setStep] = useState('ready'); // 'ready', 'listening', 'analyzing', 'confirmation'
    const [transcript, setTranscript] = useState('');
    const [resultData, setResultData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Recognition ref
    const recognitionRef = useRef(null);

    const userLang = userData?.language || (navigator.language.startsWith('es') ? 'Spanish' : 'English');

    useEffect(() => {
        // Initialize Web Speech API if supported
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = userLang === 'Spanish' ? 'es-ES' : 'en-US';

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const text = event.results[current][0].transcript;
                setTranscript(text);
            };

            recognitionRef.current.onend = () => {
                if (step === 'listening') {
                    handleFinishRecording();
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
                setStep('ready');
            };
        }
    }, [userLang, step]);

    const handleBack = () => {
        if (step === 'listening') {
            recognitionRef.current?.stop();
        }
        navigate('/dashboard');
    };

    const handleStartRecording = () => {
        setTranscript('');
        setStep('listening');
        if (recognitionRef.current) {
            recognitionRef.current.start();
        } else {
            // Fallback mock
            setTimeout(() => {
                setTranscript('Me comí una manzana roja y un yogur griego');
            }, 2000);
        }
    };

    const handleFinishRecording = async () => {
        recognitionRef.current?.stop();
        setStep('analyzing');

        // Use transcript for analysis
        try {
            const textToAnalyze = transcript || "Me comí una manzana"; // Mock if empty for demo
            const data = await analyzeFoodWithAI(textToAnalyze, userLang);
            if (data) {
                setResultData(data);
                setStep('confirmation');
            } else {
                setStep('ready');
                alert('No se pudo reconocer la comida. Intenta de nuevo.');
            }
        } catch (error) {
            console.error("Analysis error:", error);
            setStep('ready');
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
                source: 'voice'
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

    const renderReadyStep = () => (
        <div className={styles.content}>
            <div className={styles.illustrationContainer}>
                <img src={balanceIcon} alt="Balance" className={styles.illustration} />
            </div>

            <div className={styles.card}>
                <div className={styles.iconCircle}>
                    <i className={`fa-solid fa-microphone ${styles.micIcon}`}></i>
                </div>
                <h2 className={styles.statusTitle}>Listo para grabar</h2>
                <p className={styles.statusSub}>
                    Di algo como: “Desayune 2 huevos con una tostada integral”
                </p>

                <button className={styles.recordButton} onClick={handleStartRecording}>
                    Grabar
                </button>
            </div>

            <button className={styles.secondaryLink} onClick={handleBack}>
                Cerrar
            </button>
        </div>
    );

    const renderListeningStep = () => (
        <div className={styles.content}>
            <div className={styles.illustrationContainer}>
                <img src={balanceIcon} alt="Balance" className={styles.illustration} />
            </div>

            <div className={styles.card}>
                <div className={styles.pulseContainer}>
                    <div className={styles.pulseCircle}></div>
                    <div className={`${styles.iconCircle} ${styles.listening}`}>
                        <i className={`fa-solid fa-microphone ${styles.micIconActive}`}></i>
                    </div>
                </div>
                <h2 className={`${styles.statusTitle} ${styles.listeningTitleText}`}>Escuchando...</h2>
                <p className={styles.statusSub}>
                    Di algo como: “Desayune 2 huevos con una tostada integral”
                </p>

                <button className={styles.stopButton} onClick={handleFinishRecording}>
                    Parar y analizar
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
                <p className={styles.loadingText}>Analizando tu audio...</p>
                <p className={styles.loadingSubtext}>Esto tomará solo unos segundos</p>
            </div>
        </div>
    );

    const renderConfirmationStep = () => (
        <div className={styles.content}>
            <div className={styles.illustrationContainer}>
                <img src={balanceIcon} alt="Balance" className={styles.illustration} />
            </div>

            <div className={styles.resultCard}>
                <div className={styles.successHeader}>
                    <i className="fa-solid fa-star" style={{ color: '#FBCA08' }}></i>
                    <span className={styles.successTitle}>Analizado con Exito</span>
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
                    {isSaving ? 'Guardando...' : 'Guardar Registro'}
                </button>
            </div>

            <button className={styles.closeLink} onClick={() => setStep('ready')}>
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

            {step === 'ready' && renderReadyStep()}
            {step === 'listening' && renderListeningStep()}
            {step === 'analyzing' && renderAnalyzingStep()}
            {step === 'confirmation' && renderConfirmationStep()}
        </div>
    );
};

export default VoiceEntry;
