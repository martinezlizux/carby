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

    useEffect(() => {
        // Evitar inicializar múltiples veces en Strict Mode
        if (!scannerRef.current) {
            scannerRef.current = new Html5Qrcode("reader");
        }

        const startScanning = async () => {
            try {
                await scannerRef.current.start(
                    { facingMode: "environment" },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    async (decodedText) => {
                        // onScanSuccess
                        if (loading) return;

                        setLoading(true);
                        setError(null);

                        // Pausar el escaneo
                        try {
                            await scannerRef.current.pause(true);
                        } catch (e) {
                            console.warn("No se pudo pausar el escáner", e);
                        }

                        try {
                            const product = await fetchProductByBarcode(decodedText);
                            if (product) {
                                setProductData(product);
                            } else {
                                setError(t('scanProductNotFound', 'Producto no encontrado en la base de datos.'));
                                try { await scannerRef.current.resume(); } catch (e) { }
                            }
                        } catch (err) {
                            console.error('Error al escanear/buscar', err);
                            setError(t('scanError', 'Hubo un error al buscar la información del producto.'));
                            try { await scannerRef.current.resume(); } catch (e) { }
                        } finally {
                            setLoading(false);
                        }
                    },
                    (error) => {
                        // onScanFailure - silently ignore usually
                    }
                );
            } catch (err) {
                console.error("Error al iniciar el escáner de la cámara", err);
                setError(t('scanErrorCamera', 'No se pudo acceder a la cámara trasera. Verifica los permisos.'));
            }
        };

        if (scannerRef.current.getState() !== 2) { // 2 corresponds to scanning state in Html5Qrcode
            startScanning();
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().then(() => {
                    scannerRef.current.clear();
                }).catch(e => console.warn(e));
            }
        };
    }, [loading, t]);

    const handleBack = () => {
        navigate('/dashboard');
    };

    const handleAddLog = () => {
        // En el futuro, esto se conectaría a la funcionalidad de añadir comidas.
        alert(t('scanAdded', `Se han añadido ${productData?.carbs || 0}g de carbohidratos a tu registro.`));
        navigate('/dashboard');
    };

    const handleTryAgain = () => {
        setProductData(null);
        setError(null);
        // Nota: El useEffect idealmente reanudaría el scanner o lo reiniciaría.
        // Para simplificar, forzamos recarga del componente o volver a montar.
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
                        {t('scanTip', 'Apunta la cámara al código de barras del producto.')}
                    </p>
                    {loading && <p className={styles.loadingText}>{t('scanLoading', 'Buscando producto...')}</p>}
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
