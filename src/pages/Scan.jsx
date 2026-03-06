import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import { fetchProductByBarcode } from '../lib/foodApis';
import { analyzeImageWithAI } from '../lib/ai';
import { Html5Qrcode } from 'html5-qrcode';
import { Image as ImageIcon } from 'lucide-react';
import styles from './Scan.module.css';

const Scan = () => {
    const navigate = useNavigate();
    const { t } = useWizard();
    const [loading, setLoading] = useState(false);
    const [scanSuccess, setScanSuccess] = useState(false);
    const [productData, setProductData] = useState(null);
    const [error, setError] = useState(null);

    const scannerRef = useRef(null);
    const scanningRef = useRef(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (productData || error) return;

        scannerRef.current = new Html5Qrcode("reader");

        const startScanner = async () => {
            try {
                await scannerRef.current.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        handleBarcodeDetected(decodedText);
                    },
                    (errorMessage) => {
                        // ignore background scan errors
                    }
                );
            } catch (err) {
                console.warn("Error starting scanner", err);
            }
        };

        if (scannerRef.current.getState() !== 2) {
            startScanner();
        }

        return () => {
            if (scannerRef.current) {
                try {
                    if (scannerRef.current.getState() === 2) {
                        scannerRef.current.stop().then(() => {
                            scannerRef.current.clear();
                        }).catch(e => console.warn(e));
                    }
                } catch (e) { }
            }
        };
    }, [productData, error]);

    const handleBarcodeDetected = async (decodedText) => {
        if (loading || scanSuccess || scanningRef.current) return;
        scanningRef.current = true;
        setLoading(true);
        setScanSuccess(true);
        setError(null);

        if (window.navigator && window.navigator.vibrate) {
            try { window.navigator.vibrate(200); } catch (e) { }
        }

        if (scannerRef.current && scannerRef.current.getState() === 2) {
            try { await scannerRef.current.pause(true); } catch (e) { }
        }

        try {
            const product = await fetchProductByBarcode(decodedText);
            if (product) {
                setProductData(product);
            } else {
                setError(t('scanProductNotFound', 'Producto no encontrado en la base de datos.'));
                setScanSuccess(false);
            }
        } catch (err) {
            console.error('Error al escanear/buscar', err);
            setError(t('scanError', 'Hubo un error al buscar la información del producto.'));
            setScanSuccess(false);
        } finally {
            setLoading(false);
            scanningRef.current = false;
        }
    };

    const compressImage = (file, maxWidth = 800) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scaleSize = maxWidth / img.width;
                    if (scaleSize < 1) {
                        canvas.width = maxWidth;
                        canvas.height = img.height * scaleSize;
                    } else {
                        canvas.width = img.width;
                        canvas.height = img.height;
                    }
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
            };
        });
    };

    const handleFileUploadOptions = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setLoading(true);
        setError(null);
        setScanSuccess(false);

        if (scannerRef.current && scannerRef.current.getState() === 2) {
            try { await scannerRef.current.pause(true); } catch (e) { }
        }

        if (window.navigator && window.navigator.vibrate) {
            try { window.navigator.vibrate(100); } catch (e) { }
        }

        try {
            const compressedBase64 = await compressImage(file);
            const result = await analyzeImageWithAI(compressedBase64, 'Spanish');
            if (result && result.food_name) {
                setProductData(result);
            } else {
                setError(t('scanAiUnknown', 'La IA no pudo reconocer los detalles nutricionales de la imagen.'));
            }
        } catch (err) {
            console.error('Error procesando foto con IA', err);
            setError(t('scanAiError', 'Ocurrió un error al analizar la imagen con IA. Intenta de nuevo.'));
        } finally {
            setLoading(false);
            // We do not resume scanner here; it will unmount or stay paused on error until Try Again.
        }
    };

    const handleBack = () => {
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
        scanningRef.current = false;
        // useEffect will restart scanner if needed
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={handleBack} className={styles.backButton}>
                    &#8592; {t('back', 'Atrás')}
                </button>
                <h1 className={styles.title}>{t('scanTitle', 'Escanear o Analizar')}</h1>
            </header>

            {!productData && !error && (
                <div className={styles.scannerContainer}>
                    <div className={`${styles.readerWrapper} ${scanSuccess ? styles.successWrapper : ''}`}>
                        <div id="reader" className={`${styles.reader} ${scanSuccess ? styles.readerSuccess : ''}`}></div>
                        {scanSuccess && <div className={styles.successOverlay}></div>}
                    </div>
                    <p className={styles.scannerTip}>
                        {t('scanTip', 'Apunta a un código de barras para detectarlo automáticamente.')}
                    </p>

                    <div className={styles.scanActionsBox}>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileUploadOptions}
                        />
                        <button
                            onClick={() => fileInputRef.current.click()}
                            className={styles.uploadImageButton}
                            disabled={loading || scanSuccess}
                        >
                            <ImageIcon size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            {t('scanUploadBtn', 'Tomar foto o Abrir Galería')}
                        </button>
                    </div>

                    {loading && <p className={styles.loadingText}>{t('scanLoading', 'Analizando...')}</p>}
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
                    <h2 className={styles.productName}>{productData.food_name || t('scanUnknownProduct', 'Producto Desconocido')}</h2>
                    {productData.brands && <p className={styles.productBrand}>{productData.brands}</p>}
                    {productData.explanation && (
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px', fontStyle: 'italic' }}>
                            🤖 {productData.explanation}
                        </p>
                    )}

                    <div className={styles.nutritionCard}>
                        <h3>{t('scanNutritionFacts', 'Información Nutricional')}</h3>
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
                        {t('scanCancel', 'Cancelar')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scan;
