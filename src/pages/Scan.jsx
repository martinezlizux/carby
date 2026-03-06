import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import { analyzeImageWithAI } from '../lib/ai';
import { Camera, Image as ImageIcon } from 'lucide-react';
import styles from './Scan.module.css';

const Scan = () => {
    const navigate = useNavigate();
    const { t } = useWizard();
    const [loading, setLoading] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [productData, setProductData] = useState(null);
    const [error, setError] = useState(null);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    // Initialize camera
    useEffect(() => {
        if (productData || error) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                streamRef.current = stream;
            } catch (err) {
                console.error("Camera access error:", err);
                setError(t('scanErrorCamera', 'No se pudo acceder a la cámara. Revisa los permisos o sube una foto.'));
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [productData, error, t]);

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const processImage = async (base64Data) => {
        setLoading(true);
        setScanSuccess(true);
        setError(null);
        stopCamera();

        // Haptic feedback
        if (window.navigator && window.navigator.vibrate) {
            try { window.navigator.vibrate(200); } catch (e) { }
        }

        try {
            const result = await analyzeImageWithAI(base64Data, 'Spanish');
            if (result && result.food_name) {
                setProductData(result);
            } else {
                setError(t('scanAiUnknown', 'La IA no pudo reconocer los detalles nutricionales de este producto.'));
                setScanSuccess(false);
            }
        } catch (err) {
            console.error('Error processing image via AI:', err);
            setError(t('scanAiError', 'Ocurrió un error al analizar la imagen. Intenta de nuevo.'));
            setScanSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    const handleTakePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Copy video frame to canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get base64 string
        const base64Data = canvas.toDataURL('image/jpeg', 0.8);
        processImage(base64Data);
    };

    const handleFileUpload = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onloadend = () => {
            processImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleBack = () => {
        stopCamera();
        navigate('/dashboard');
    };

    const handleAddLog = () => {
        alert(t('scanAdded', `Se han añadido ${productData?.carbs || 0}g de carbohidratos a tu registro.`));
        navigate('/dashboard');
    };

    const handleTryAgain = () => {
        setProductData(null);
        setError(null);
        setScanSuccess(false);
        // Effect will automatically restart the camera because productData and error are null.
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={handleBack} className={styles.backButton}>
                    &#8592; {t('back', 'Atrás')}
                </button>
                <h1 className={styles.title}>{t('scanProductAI', 'Analizar Producto')}</h1>
            </header>

            {!productData && !error && (
                <div className={styles.scannerContainer}>
                    <div className={`${styles.readerWrapper} ${scanSuccess ? styles.successWrapper : ''}`}>
                        {/* We hide the video if it's processing to avoid awkward freeze frame, 
                             or keep it until loading is done. */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={`${styles.reader} ${scanSuccess ? styles.readerSuccess : ''}`}
                            style={{ objectFit: 'cover', opacity: loading ? 0.5 : 1 }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                    <p className={styles.scannerTip}>
                        {t('scanAiTip', 'Toma una foto del producto o su etiqueta nutricional.')}
                    </p>

                    <div className={styles.scanActionsBox}>
                        <button
                            className={styles.captureButton}
                            onClick={handleTakePhoto}
                            disabled={loading || scanSuccess}
                        >
                            <Camera size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            <span>{t('btnCapture', 'Capturar')}</span>
                        </button>
                    </div>

                    <div className={styles.scanActionsBox} style={{ marginTop: '16px' }}>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUpload}
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className={styles.uploadImageButton}
                            disabled={loading || scanSuccess}
                        >
                            <ImageIcon size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            {t('scanUploadBtn', 'Abrir Galería')}
                        </button>
                    </div>

                    {loading && <p className={styles.loadingText}>{t('scanLoading', 'Analizando con IA...')}</p>}
                </div>
            )}

            {error && (
                <div className={styles.errorContainer}>
                    <p className={styles.errorText}>{error}</p>
                    <button onClick={handleTryAgain} className={styles.tryAgainButton}>
                        {t('scanTryAgain', 'Intentar de nuevo')}
                    </button>
                </div>
            )}

            {productData && (
                <div className={styles.resultContainer}>
                    <h2 className={styles.productName}>{productData.food_name || t('scanUnknownProduct', 'Producto')}</h2>
                    {productData.explanation && (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px', fontStyle: 'italic' }}>
                            🤖 {productData.explanation}
                        </p>
                    )}

                    <div className={styles.nutritionCard}>
                        <h3>{t('scanNutritionFacts', 'Información Nutricional Estimada')}</h3>
                        <ul className={styles.nutritionList}>
                            <li>
                                <span>{t('calories', 'Calorías')}</span>
                                <strong>{productData.calories !== undefined ? `${productData.calories} kcal` : '-'}</strong>
                            </li>
                            <li>
                                <span>{t('carbs', 'Carbohidratos')}</span>
                                <strong>{productData.carbs !== undefined ? `${productData.carbs}g` : '-'}</strong>
                            </li>
                            <li>
                                <span>{t('sugars', 'Azúcares')}</span>
                                <strong>{productData.sugars !== undefined ? `${productData.sugars}g` : '-'}</strong>
                            </li>
                            <li>
                                <span>{t('proteins', 'Proteínas')}</span>
                                <strong>{productData.proteins !== undefined ? `${productData.proteins}g` : '-'}</strong>
                            </li>
                            <li>
                                <span>{t('fat', 'Grasas')}</span>
                                <strong>{productData.fat !== undefined ? `${productData.fat}g` : '-'}</strong>
                            </li>
                        </ul>
                    </div>

                    <button onClick={handleAddLog} className={styles.addButton}>
                        {t('scanAddLog', 'Añadir al Registro')}
                    </button>
                    <button onClick={handleTryAgain} className={styles.cancelButton}>
                        {t('scanCancel', 'Analizar Otro')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scan;
