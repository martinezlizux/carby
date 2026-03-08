import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import { analyzeFoodWithAI } from '../lib/ai';
import { saveMeal } from '../lib/mealHistory';
import styles from './VoiceEntry.module.css';
import BalanceIcon from '../components/BalanceIcon';

const VoiceEntry = () => {
    const navigate = useNavigate();
    const { userData } = useWizard();
    const [step, setStep] = useState('ready'); // 'ready', 'listening', 'analyzing', 'confirmation'
    const [transcript, setTranscript] = useState('');
    const [resultData, setResultData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(false);

    const recognitionRef = useRef(null);
    const transcriptRef = useRef('');

    const userLang = userData?.language || (navigator.language.startsWith('es') ? 'Spanish' : 'English');

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            return;
        }

        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = userLang === 'Spanish' ? 'es-ES' : 'en-US';

        recognition.onresult = (event) => {
            const text = event.results[event.resultIndex][0].transcript;
            transcriptRef.current = text;
            setTranscript(text);
        };

        recognition.onend = () => {
            if (transcriptRef.current.trim()) {
                handleFinishRecording(transcriptRef.current);
            } else {
                setStep('ready');
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'no-speech') {
                setStep('ready');
            } else {
                setStep('ready');
            }
        };

        recognitionRef.current = recognition;
    }, [userLang]);

    const handleBack = () => {
        recognitionRef.current?.stop();
        navigate('/dashboard');
    };

    const handleStartRecording = () => {
        transcriptRef.current = '';
        setTranscript('');
        setStep('listening');
        recognitionRef.current?.start();
    };

    const handleFinishRecording = async (capturedTranscript) => {
        recognitionRef.current?.stop();
        const text = (capturedTranscript || transcriptRef.current).trim();

        if (!text) {
            setStep('ready');
            return;
        }

        setStep('analyzing');
        try {
            const data = await analyzeFoodWithAI(text, userLang);
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
                <div className={styles.illustration}>
                    <BalanceIcon />
                </div>
            </div>

            {!speechSupported ? (
                <div className={styles.card}>
                    <div className={styles.iconCircle}>
                        <i className="fa-solid fa-microphone-slash" style={{ fontSize: '2rem', color: 'var(--text-neutral-dark)' }}></i>
                    </div>
                    <h2 className={styles.statusTitle}>Voz no disponible</h2>
                    <p className={styles.statusSub}>
                        Tu navegador no soporta dictado de voz. Usa la opción de texto para registrar tu comida.
                    </p>
                    <button className={styles.recordButton} onClick={() => navigate('/chat')}>
                        Ir a texto
                    </button>
                </div>
            ) : (
                <div className={styles.card}>
                    <div className={styles.iconCircle}>
                        <i className={`fa-solid fa-microphone ${styles.micIcon}`}></i>
                    </div>
                    <h2 className={styles.statusTitle}>Listo para grabar</h2>
                    <p className={styles.statusSub}>
                        Di algo como: "Desayuné 2 huevos con una tostada integral"
                    </p>
                    <button className={styles.recordButton} onClick={handleStartRecording}>
                        Grabar
                    </button>
                </div>
            )}

            <button className={styles.secondaryLink} onClick={handleBack}>
                Cerrar
            </button>
        </div>
    );

    const renderListeningStep = () => (
        <div className={styles.content}>
            <div className={styles.illustrationContainer}>
                <div className={styles.illustration}>
                    <BalanceIcon />
                </div>
            </div>

            <div className={styles.card}>
                <div className={styles.pulseContainer}>
                    <div className={styles.pulseCircle}></div>
                    <div className={`${styles.iconCircle} ${styles.listening}`}>
                        <i className={`fa-solid fa-microphone ${styles.micIconActive}`}></i>
                    </div>
                </div>
                <h2 className={`${styles.statusTitle} ${styles.listeningTitleText}`}>Escuchando...</h2>
                {transcript && (
                    <p className={styles.transcriptPreview}>"{transcript}"</p>
                )}
                <button className={styles.stopButton} onClick={() => handleFinishRecording(transcriptRef.current)}>
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
                <div className={styles.illustration}>
                    <BalanceIcon />
                </div>
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
