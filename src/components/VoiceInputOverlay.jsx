import React, { useState, useEffect } from 'react';
import { Mic, X, Loader2, Star, Utensils } from 'lucide-react';
import styles from './VoiceInputOverlay.module.css';
import { analyzeFoodWithAI } from '../lib/ai';
import { saveMeal } from '../lib/mealHistory';
import balanceSvg from '../assets/balance.svg';

const VoiceInputOverlay = ({ onClose, onSaveSuccess }) => {
    const [status, setStatus] = useState('idle'); // idle, recording, analyzing, results
    const [transcript, setTranscript] = useState('');
    const [result, setResult] = useState(null);
    const [recognition, setRecognition] = useState(null);

    // States for editing
    const [editedName, setEditedName] = useState('');
    const [editedCalories, setEditedCalories] = useState('');
    const [editedProteins, setEditedProteins] = useState('');
    const [editedCarbs, setEditedCarbs] = useState('');
    const [editedFat, setEditedFat] = useState('');

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';

            recognition.onstart = () => {
                setStatus('recording');
            };

            recognition.onresult = (event) => {
                const text = event.results[0][0].transcript;
                setTranscript(text);
                handleAnalyze(text);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setStatus('idle');
            };

            recognition.onend = () => {
                // If we didn't get a result, go back to idle
                if (status === 'recording') {
                    setStatus('idle');
                }
            };

            setRecognition(recognition);
        }
    }, [status]);

    const startRecording = () => {
        if (recognition) {
            recognition.start();
        } else {
            alert('El reconocimiento de voz no está disponible en este navegador.');
        }
    };

    const stopRecording = () => {
        if (recognition) {
            recognition.stop();
        }
    };

    const handleAnalyze = async (text) => {
        setStatus('analyzing');
        try {
            const aiResult = await analyzeFoodWithAI(text);
            setResult(aiResult);
            if (aiResult) {
                setEditedName(aiResult.food_name || '');
                setEditedCalories(aiResult.calories || 0);
                setEditedProteins(aiResult.proteins || 0);
                setEditedCarbs(aiResult.carbs || 0);
                setEditedFat(aiResult.fat || 0);
            }
            setStatus('results');
        } catch (error) {
            console.error('Error analyzing food:', error);
            setStatus('idle');
            alert('No pudimos analizar el audio. Por favor intenta de nuevo.');
        }
    };

    const handleSave = async () => {
        const { error } = await saveMeal({
            food_name: editedName,
            carbs: parseFloat(editedCarbs) || 0,
            proteins: parseFloat(editedProteins) || 0,
            fat: parseFloat(editedFat) || 0,
            calories: parseFloat(editedCalories) || 0,
            source: 'Voice Input'
        });

        if (!error) {
            onSaveSuccess && onSaveSuccess();
            onClose();
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className={styles.container}>
                <header className={styles.header}>
                    <h2 className={styles.title}>Nueva entrada</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </header>

                <div className={styles.content}>
                    {status === 'results' ? (
                        <div className={styles.resultsContainer}>
                            <div className={styles.successBadge}>
                                <div className={styles.starIconContainer}>
                                    <Star size={24} fill="#FFD700" color="#FFD700" />
                                </div>
                                <span className={styles.successText}>Analizado con Exito</span>
                            </div>

                            <div className={styles.resultsCard}>
                                <div className={styles.detectedFoodField}>
                                    <span className={styles.label}>COMIDA DETECTADA</span>
                                    <input
                                        type="text"
                                        className={styles.foodNameInput}
                                        value={editedName}
                                        onChange={(e) => setEditedName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.mainStats}>
                                    <div className={styles.statBox}>
                                        <span className={styles.statLabel}>CALORÍAS</span>
                                        <div className={styles.statValue}>
                                            <input
                                                type="number"
                                                className={styles.bigValueInput}
                                                value={editedCalories}
                                                onChange={(e) => setEditedCalories(e.target.value)}
                                            />
                                            <span className={styles.unit}>kcal</span>
                                        </div>
                                    </div>
                                    <div className={styles.secondaryStats}>
                                        <div className={styles.miniStat}>
                                            <span className={styles.miniLabel}>PROTEIN</span>
                                            <div className={styles.miniValueInputWrapper}>
                                                <input
                                                    type="number"
                                                    className={styles.miniValueInput}
                                                    value={editedProteins}
                                                    onChange={(e) => setEditedProteins(e.target.value)}
                                                />
                                                <span className={styles.miniUnit}>gr</span>
                                            </div>
                                        </div>
                                        <div className={styles.miniStat}>
                                            <span className={styles.miniLabel}>CARBS</span>
                                            <div className={styles.miniValueInputWrapper}>
                                                <input
                                                    type="number"
                                                    className={styles.miniValueInput}
                                                    value={editedCarbs}
                                                    onChange={(e) => setEditedCarbs(e.target.value)}
                                                />
                                                <span className={styles.miniUnit}>gr</span>
                                            </div>
                                        </div>
                                        <div className={styles.miniStat}>
                                            <span className={styles.miniLabel}>GRASAS</span>
                                            <div className={styles.miniValueInputWrapper}>
                                                <input
                                                    type="number"
                                                    className={styles.miniValueInput}
                                                    value={editedFat}
                                                    onChange={(e) => setEditedFat(e.target.value)}
                                                />
                                                <span className={styles.miniUnit}>gr</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                id="voice-save-btn"
                                className={styles.saveBtn}
                                onClick={handleSave}
                            >
                                Guardar en Historial
                            </button>
                            <button
                                id="voice-cancel-btn"
                                className={styles.cancelTextBtn}
                                onClick={onClose}
                            >
                                Cerrar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.illustrationArea}>
                                <img
                                    src={balanceSvg}
                                    alt="Balance illustration"
                                    className={`${styles.illustration} ${status === 'recording' ? styles.isAnimating : ''}`}
                                />
                            </div>

                            <div className={styles.controlsArea}>
                                {status === 'idle' && (
                                    <div className={styles.recordingState}>
                                        <div
                                            id="voice-mic-btn"
                                            className={styles.recordButton}
                                            onClick={startRecording}
                                            aria-label="Iniciar grabación"
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <Mic size={32} color="white" />
                                        </div>
                                        <h3 className={styles.statusText}>Listo para grabar</h3>
                                        <p className={styles.hintText}>Di algo como: "Desayune 2 huevos con una tostada integral"</p>
                                        <button className={styles.actionBtnPrimary} onClick={startRecording}>
                                            Grabar
                                        </button>
                                    </div>
                                )}

                                {status === 'recording' && (
                                    <div className={styles.recordingState}>
                                        <div
                                            id="voice-mic-recording-btn"
                                            className={`${styles.recordButton} ${styles.isRecording}`}
                                            onClick={stopRecording}
                                            aria-label="Detener grabación"
                                            role="button"
                                            tabIndex={0}
                                        >
                                            <Mic size={32} color="white" />
                                        </div>
                                        <h3 className={styles.statusText}>Escuchando...</h3>
                                        <p className={styles.hintText}>Te estamos escuchando, presiona el botón para finalizar</p>
                                        <button className={styles.actionBtnAccent} onClick={stopRecording}>
                                            Parar y analizar
                                        </button>
                                    </div>
                                )}

                                {status === 'analyzing' && (
                                    <div className={styles.recordingState}>
                                        <div className={styles.analyzingCircle}>
                                            <Loader2 size={32} className={styles.spinner} />
                                        </div>
                                        <h3 className={styles.statusText}>Analizando...</h3>
                                        <p className={styles.hintText}>Esto tomará solo un momento</p>
                                        <button className={styles.actionBtnDisabled} disabled>
                                            Analizando
                                        </button>
                                    </div>
                                )}

                                <button className={styles.cancelTextBtn} onClick={onClose}>
                                    Cerrar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceInputOverlay;
