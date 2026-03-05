import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWizard } from '../contexts/WizardContext';
import styles from './Onboarding.module.css';
import BalanceIcon from '../components/BalanceIcon';
import carbyCharacter from '../assets/carby-character.png';

const Onboarding = () => {
    const navigate = useNavigate();
    const { t } = useWizard();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 0,
            title: t('obSlide1Title'),
            desc: t('obSlide1Desc'),
            visual: (
                <div className={styles.visualWrapper}>
                    <BalanceIcon />
                </div>
            )
        },
        {
            id: 1,
            title: t('obSlide2Title'),
            desc: t('obSlide2Desc'),
            visual: (
                <div className={styles.visualWrapperLarge}>
                    <div className={styles.glow} />
                    <img src={carbyCharacter} alt="Carby AI Assistant" className={styles.characterImg} />
                </div>
            )
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            localStorage.setItem('wizardCompleted', 'true');
            navigate('/dashboard');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.sliderContent}>
                <div
                    className={styles.slidesTrack}
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                    {slides.map((slide) => (
                        <div key={slide.id} className={styles.slide}>
                            <div className={styles.visualArea}>
                                {slide.visual}
                            </div>
                            <div className={styles.textArea}>
                                <h1 className={styles.title}>{slide.title}</h1>
                                <p className={styles.description}>{slide.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <footer className={styles.footer}>
                <div className={styles.dots}>
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`${styles.dot} ${idx === currentSlide ? styles.activeDot : ''}`}
                        />
                    ))}
                </div>
                <button className={styles.nextBtn} onClick={handleNext}>
                    {currentSlide === slides.length - 1 ? t('obStart') : t('obNext')}
                </button>
            </footer>
        </div>
    );
};

export default Onboarding;
