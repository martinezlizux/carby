import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { fetchProductByBarcode } from '../lib/foodApis';
import { useWizard } from '../contexts/WizardContext';
import styles from './Scan.module.css';

const Scan = () => {
    const navigate = useNavigate();
    const { t } = useWizard();
    const [loading, setLoading] = useState(false);
    const [productData, setProductData] = useState(null);
    const [error, setError] = useState(null);
    const scannerRef = useRef(null);
    const fileInputRef = useRef(null);
    const latestCodeRef = useRef(null);

    useEffect(() => {
        // Aseguramos que el contenedor exista y no haya errores o productos cargados
        if (!document.getElementById("reader") || error || productData) return;

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        const startPreview = async () => {
            try {
                // Primero solicitamos permiso al usuario directamente obteniendo las cámaras
                const cameras = await Html5Qrcode.getCameras();
                if (cameras && cameras.length > 0) {
                    // Seleccionamos cámara trasera, o la última de la lista (normalmente trasera en celulares)
                    const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('trasera')) || cameras[cameras.length - 1];

                    await scannerRef.current.start(
                        backCamera.id,
                        { fps: 15, qrbox: { width: 250, height: 250 } },
                        (decodedText) => { latestCodeRef.current = decodedText; },
                        () => { latestCodeRef.current = null; }
                    );
                } else {
                    throw new Error("No se detectaron cámaras en el dispositivo");
                }
            } catch (err) {
                console.warn("Intento de cámara por ID falló, iterando fallback...", err);
                try {
                    // Fallback genérico para algunos dispositivos
                    await scannerRef.current.start(
                        { facingMode: "environment" },
                        { fps: 15, qrbox: { width: 250, height: 250 } },
                        (decodedText) => { latestCodeRef.current = decodedText; },
                        () => { latestCodeRef.current = null; }
                    );
                } catch (fallbackErr) {
                    console.error("Error colosal al iniciar vista previa de cámara", fallbackErr);
                    setError(t('scanErrorCamera', 'No se pudo acceder a la cámara. Asegúrate de darle permisos al navegador y recargar.'));
                }
            }
        };

        // Estado 2 == SCANNING
        try {
            if (scannerRef.current.getState() !== 2) {
                startPreview();
            }
        } catch (e) {
            startPreview();
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
    }, [t, error, productData]);

    const processBarcode = async (decodedText) => {
        if (loading) return;
        setLoading(true);
        setError(null);

        // Pausamos la cámara si está encendida
        if (scannerRef.current && scannerRef.current.getState() === 2) {
            try { await scannerRef.current.pause(true); } catch (e) { }
        }

        try {
            const product = await fetchProductByBarcode(decodedText);
            if (product) {
                setProductData(product);
            } else {
                setError(t('scanProductNotFound', 'Producto no encontrado en la base de datos.'));
                if (scannerRef.current && scannerRef.current.getState() === 3) {
                    try { await scannerRef.current.resume(); } catch (e) { }
                }
            }
        } catch (err) {
            console.error('Error al escanear/buscar', err);
            setError(t('scanError', 'Hubo un error al buscar la información del producto.'));
            if (scannerRef.current && scannerRef.current.getState() === 3) {
                try { await scannerRef.current.resume(); } catch (e) { }
            }
        } finally {
            setLoading(false);
        }
    };

    // Función para procesar con el último frame escaneado exitoso
    const handleManualScan = () => {
        if (!scannerRef.current || scannerRef.current.getState() !== 2) return;

        if (latestCodeRef.current) {
            processBarcode(latestCodeRef.current);
        } else {
            setError(t('scanNoBarcodeDetected', 'No detectamos código de barras. Enfócalo en el centro e intenta de nuevo.'));
        }
    };

    const handleFileUploadOptions = (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        setLoading(true);
        setError(null);

        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        scannerRef.current.scanFile(file, false)
            .then(decodedText => {
                processBarcode(decodedText);
            })
            .catch(err => {
                setError(t('scanNoBarcodeDetectedImage', 'No pudimos encontrar un código de barras en la foto proporcionada.'));
                setLoading(false);
            });
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
        window.location.reload();
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={handleBack} className={styles.backButton}>
                    &#8592; {t('back', 'Atrás')}
                </button>
                <h1 className={styles.title}>{t('scanTitle', 'Escanear Producto')}</h1>
            </header>

            {!productData && !error && (
                <div className={styles.scannerContainer}>
                    <div id="reader" className={styles.reader}></div>
                    <p className={styles.scannerTip}>
                        {t('scanTip', 'Apunta al código de barras o sube una foto.')}
                    </p>

                    <div className={styles.scanActionsBox}>
                        <button onClick={handleManualScan} className={styles.captureButton} disabled={loading}>
                            {t('scanActionBtn', 'Escanear ahora')}
                        </button>

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
                            disabled={loading}
                        >
                            {t('scanUploadBtn', 'Abrir galería')}
                        </button>
                    </div>

                    {loading && <p className={styles.loadingText}>{t('scanLoading', 'Procesando...')}</p>}
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

                    <div className={styles.nutritionCard}>
                        <h3>{t('scanNutritionFacts', 'Información Nutricional')} (100g/ml)</h3>
                        <ul className={styles.nutritionList}>
                            <li>
                                <span>{t('calories', 'Calorías')}</span>
                                <strong>{productData.calories ? `${productData.calories} kcal` : '-'}</strong>
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
                        {t('scanCancel', 'Cancelar y Escanear Otro')}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Scan;
