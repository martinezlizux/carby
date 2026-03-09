import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import { analyzeImageWithAI } from '../lib/ai';
import { saveMeal } from '../lib/mealHistory';
import styles from './ScanAR.module.css';

const ScanAR = () => {
    const navigate = useNavigate();
    const { userData } = useWizard();
    const [step, setStep] = useState('requesting'); // 'requesting', 'denied', 'live', 'scanning', 'result'
    const [resultData, setResultData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const scanTimerRef = useRef(null);
    const isScanningRef = useRef(false);

    const userLang = userData?.language || (navigator.language.startsWith('es') ? 'Spanish' : 'English');

    useEffect(() => {
        startCamera();
        return () => stopEverything();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
            setStep('live');
            scheduleNextScan(1200);
        } catch {
            setStep('denied');
        }
    };

    const stopEverything = () => {
        clearTimeout(scanTimerRef.current);
        isScanningRef.current = false;
        streamRef.current?.getTracks().forEach(t => t.stop());
    };

    const captureFrame = () => {
        const video = videoRef.current;
        if (!video || video.videoWidth === 0) return null;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.85);
    };

    const scheduleNextScan = (delay = 3000) => {
        clearTimeout(scanTimerRef.current);
        scanTimerRef.current = setTimeout(() => doScan(), delay);
    };

    const doScan = async () => {
        if (isScanningRef.current) return;
        isScanningRef.current = true;
        setStep('scanning');

        const frame = captureFrame();
        if (!frame) {
            isScanningRef.current = false;
            setStep('live');
            scheduleNextScan(2000);
            return;
        }

        const result = await analyzeImageWithAI(frame, userLang);
        isScanningRef.current = false;

        if (result && result.food_name) {
            setResultData(result);
            setStep('result');
        } else {
            setStep('live');
            scheduleNextScan(3000);
        }
    };

    const handleRescan = () => {
        setResultData(null);
        setStep('live');
        scheduleNextScan(800);
    };

    const handleSave = async () => {
        if (!resultData || isSaving) return;
        setIsSaving(true);
        const { error } = await saveMeal({
            food_name: resultData.food_name,
            carbs: parseFloat(resultData.carbs) || 0,
            calories: parseFloat(resultData.calories) || 0,
            proteins: parseFloat(resultData.proteins) || 0,
            fat: parseFloat(resultData.fat) || 0,
            explanation: resultData.explanation,
            source: 'scan'
        });
        if (error) {
            setIsSaving(false);
        } else {
            stopEverything();
            navigate('/history');
        }
    };

    return (
        <div className={styles.container}>
            {/* Live camera feed */}
            <video
                ref={videoRef}
                className={styles.video}
                autoPlay
                playsInline
                muted
            />

            {/* Dark gradient overlay top/bottom */}
            <div className={styles.gradientTop} />
            <div className={styles.gradientBottom} />

            {/* Header */}
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => { stopEverything(); navigate('/history'); }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>
                <span className={styles.headerTitle}>Escanear comida</span>
                <div style={{ width: 40 }} />
            </header>

            {/* AR Scan Frame */}
            {(step === 'live' || step === 'scanning') && (
                <div className={styles.frameContainer}>
                    <div className={`${styles.scanFrame} ${step === 'scanning' ? styles.scanning : ''}`}>
                        <div className={`${styles.corner} ${styles.cornerTL}`} />
                        <div className={`${styles.corner} ${styles.cornerTR}`} />
                        <div className={`${styles.corner} ${styles.cornerBL}`} />
                        <div className={`${styles.corner} ${styles.cornerBR}`} />
                        {step === 'scanning' && <div className={styles.scanLine} />}
                    </div>
                    <p className={styles.scanHint}>
                        {step === 'scanning' ? 'Analizando...' : 'Apunta al alimento'}
                    </p>
                </div>
            )}

            {/* Result AR Panel */}
            {step === 'result' && resultData && (
                <div className={styles.resultFrame}>
                    {/* AR target corners — green when found */}
                    <div className={styles.frameContainer}>
                        <div className={`${styles.scanFrame} ${styles.found}`}>
                            <div className={`${styles.corner} ${styles.cornerTL}`} />
                            <div className={`${styles.corner} ${styles.cornerTR}`} />
                            <div className={`${styles.corner} ${styles.cornerBL}`} />
                            <div className={`${styles.corner} ${styles.cornerBR}`} />
                        </div>
                    </div>

                    {/* Nutrition panel */}
                    <div className={styles.resultPanel}>
                        <div className={styles.resultHeader}>
                            <i className="fa-solid fa-circle-check" style={{ color: '#2ED199' }}></i>
                            <h2 className={styles.foodName}>
                                {resultData.food_name}
                            </h2>
                        </div>

                        <div className={styles.nutrientBadges}>
                            <div className={`${styles.badge} ${styles.badgeCarbs}`}>
                                <span className={styles.badgeValue}>{Math.round(resultData.carbs)}g</span>
                                <span className={styles.badgeLabel}>Carbos</span>
                            </div>
                            <div className={`${styles.badge} ${styles.badgeCal}`}>
                                <span className={styles.badgeValue}>{Math.round(resultData.calories)}</span>
                                <span className={styles.badgeLabel}>kcal</span>
                            </div>
                            <div className={`${styles.badge} ${styles.badgeProtein}`}>
                                <span className={styles.badgeValue}>{Math.round(resultData.proteins)}g</span>
                                <span className={styles.badgeLabel}>Prot.</span>
                            </div>
                            <div className={`${styles.badge} ${styles.badgeFat}`}>
                                <span className={styles.badgeValue}>{Math.round(resultData.fat)}g</span>
                                <span className={styles.badgeLabel}>Grasa</span>
                            </div>
                        </div>

                        {resultData.explanation && (
                            <p className={styles.explanation}>{resultData.explanation}</p>
                        )}

                        <div className={styles.actions}>
                            <button className={styles.rescanBtn} onClick={handleRescan}>
                                <i className="fa-solid fa-rotate"></i> Otro
                            </button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                                {isSaving ? 'Guardando...' : 'Guardar registro'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Permission denied */}
            {step === 'denied' && (
                <div className={styles.deniedContainer}>
                    <i className="fa-solid fa-camera-slash" style={{ fontSize: '3rem', color: 'white', opacity: 0.6 }}></i>
                    <p className={styles.deniedText}>No se pudo acceder a la cámara.</p>
                    <p className={styles.deniedSub}>Activa el permiso de cámara en tu navegador.</p>
                    <button className={styles.saveBtn} onClick={() => navigate('/scan')}>
                        Subir foto
                    </button>
                </div>
            )}

            {/* Requesting */}
            {step === 'requesting' && (
                <div className={styles.deniedContainer}>
                    <div className={styles.spinner} />
                    <p className={styles.deniedText}>Iniciando cámara...</p>
                </div>
            )}
        </div>
    );
};

export default ScanAR;
