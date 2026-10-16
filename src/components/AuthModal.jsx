import React, { useState } from 'react';
import { useWizard } from '../contexts/WizardContext';
import { User, Lock, Mail, X, Loader2 } from 'lucide-react';
import styles from './AuthModal.module.css';

const AuthModal = ({ onSuccess }) => {
    const { isAuthModalOpen, closeAuthModal, login, signup, t } = useWizard();
    const [mode, setMode] = useState('signup'); // 'signup' | 'login'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    if (!isAuthModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                if (password.length < 6) {
                    throw new Error('La contraseña debe tener al menos 6 caracteres.');
                }
                const res = await signup(email, password, name);
                if (res.error) throw res.error;

                if (res.session) {
                    setSuccessMsg('¡Cuenta creada con éxito!');
                    setTimeout(() => {
                        closeAuthModal();
                        if (onSuccess) onSuccess('signup');
                    }, 800);
                } else {
                    setSuccessMsg('¡Cuenta registrada! Ya puedes iniciar sesión con tu correo y contraseña.');
                    setMode('login');
                }
            } else {
                const res = await login(email, password);
                if (res.error) throw res.error;

                setSuccessMsg('¡Sesión iniciada con éxito!');
                setTimeout(() => {
                    closeAuthModal();
                    if (onSuccess) onSuccess('login');
                }, 800);
            }
        } catch (err) {
            console.error('Auth error:', err);
            let message = err.message || 'Ocurrió un error. Intenta nuevamente.';
            if (message.includes('Invalid login credentials')) {
                message = 'Correo o contraseña incorrectos.';
            } else if (message.includes('already registered')) {
                message = 'Este correo ya está registrado. Prueba iniciando sesión.';
            } else if (message.includes('Email not confirmed')) {
                message = 'Revisa tu correo para confirmar tu cuenta o desactiva "Confirm email" en Supabase.';
            } else if (message.toLowerCase().includes('rate limit')) {
                message = 'Límite de correos de Supabase alcanzado. Para solucionarlo, desactiva "Confirm email" en el panel de Supabase (Authentication > Providers > Email).';
            }
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}>
            <div className={styles.modal}>
                <button className={styles.closeBtn} onClick={closeAuthModal} aria-label="Cerrar">
                    <X size={18} />
                </button>

                <div className={styles.header}>
                    <div className={styles.iconWrapper}>
                        <User size={28} />
                    </div>
                    <h2 className={styles.title}>
                        {mode === 'signup' ? 'Guarda tu Progreso' : 'Bienvenido de vuelta'}
                    </h2>
                    <p className={styles.subtitle}>
                        {mode === 'signup'
                            ? 'Crea tu cuenta para guardar tu perfil médico y registros en la nube.'
                            : 'Inicia sesión para sincronizar tu perfil y comidas registradas.'}
                    </p>
                </div>

                <div className={styles.tabSwitch}>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
                        onClick={() => { setMode('signup'); setErrorMsg(''); setSuccessMsg(''); }}
                    >
                        Crear Cuenta
                    </button>
                    <button
                        type="button"
                        className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
                        onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                    >
                        Iniciar Sesión
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {errorMsg && <div className={styles.errorBanner}>{errorMsg}</div>}
                    {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

                    {mode === 'signup' && (
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Nombre</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Tu nombre"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Correo electrónico</label>
                        <input
                            type="email"
                            className={styles.input}
                            placeholder="ejemplo@correo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Contraseña</label>
                        <input
                            type="password"
                            className={styles.input}
                            placeholder="Mínimo 6 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading && <Loader2 size={18} className="spin" />}
                        <span>
                            {loading
                                ? 'Procesando...'
                                : mode === 'signup'
                                ? 'Crear Cuenta y Guardar'
                                : 'Iniciar Sesión'}
                        </span>
                    </button>
                </form>

                <div className={styles.guestDivider}>
                    <span>o</span>
                </div>

                <button type="button" className={styles.guestBtn} onClick={closeAuthModal}>
                    Continuar como invitado
                </button>
            </div>
        </div>
    );
};

export default AuthModal;
