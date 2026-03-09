import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// Lucide icons replaced by FontAwesome
import { useWizard } from '../contexts/WizardContext';
import { analyzeImageWithAI } from '../lib/ai';
import { saveMeal } from '../lib/mealHistory';
import styles from './Scan.module.css';
import BalanceIcon from '../components/BalanceIcon';

const Scan = () => {
    const navigate = useNavigate();
    const { userData, t } = useWizard();
    const [step, setStep] = useState('input'); // 'input', 'analyzing', 'confirmation'
    const [imagePreview, setImagePreview] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);
    const userLang = userData?.language || (navigator.language.startsWith('es') ? 'Spanish' : 'English');


    const compressImage = (file, maxWidth = 1024) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const scaleSize = maxWidth / img.width;
                    canvas.width = maxWidth;
                    canvas.height = img.height * scaleSize;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    resolve(canvas.toDataURL('image/jpeg', 0.8));
                };
            };
        });
    };

    const handleFileUpload = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Preview
        const reader = new FileReader();
        reader.onload = (re) => setImagePreview(re.target.result);
        reader.readAsDataURL(file);

        setStep('analyzing');
        setError(null);

        try {
            const compressedBase64 = await compressImage(file);
            const result = await analyzeImageWithAI(compressedBase64, userLang);
            if (result && result.food_name) {
                setResultData(result);
                setStep('confirmation');
            } else {
                setError(t('scanAiUnknown', 'No pude reconocer la comida.'));
                setStep('input');
            }
        } catch (err) {
            console.error('Error procesando foto', err);
            setError(t('scanAiError', 'Error al analizar la imagen.'));
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
                source: 'scan'
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

    const handleBack = () => navigate('/dashboard');

    const renderInputStep = () => (
        <div className={styles.content}>
            <div className={styles.centerGroup}>
                <div className={styles.iconCircle} onClick={() => fileInputRef.current?.click()}>
                    <i className="fa-solid fa-camera" style={{ fontSize: '48px', color: '#627AEE' }}></i>
                </div>
                <h2 className={styles.instructionTitle}>Toma una foto</h2>
                <p className={styles.instructionSub}>Captura tu plato y Carby detectará los nutrientes.</p>
                {error && <p className={styles.errorText}>{error}</p>}
            </div>
            <input
                type="file"
                accept="image/*"
                capture="environment"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />
            <div className={styles.actions}>
                <button className={styles.recordButton} onClick={() => fileInputRef.current?.click()}>
                    Abrir Cámara
                </button>
                <button className={styles.secondaryLink} onClick={handleBack}>
                    Cerrar
                </button>
            </div>
        </div>
    );

    const renderAnalyzingStep = () => (
        <div className={styles.content}>
            <div className={styles.loadingContainer}>
                {imagePreview && (
                    <div className={styles.previewSmall}>
                        <img src={imagePreview} alt="Preview" />
                    </div>
                )}
                <div className={styles.spinner}></div>
                <p className={styles.loadingText}>Analizando imagen...</p>
                <p className={styles.loadingSubtext}>Detectando ingredientes y porciones</p>
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

            <button className={styles.closeLink} onClick={() => { setImagePreview(null); setStep('input'); }}>
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

export default Scan;
