import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWizard } from '../contexts/WizardContext';
import { analyzeFoodWithAI } from '../lib/ai';
import { searchOpenFoodFacts, searchUSDA } from '../lib/foodApis';
import styles from './Chat.module.css';
import { Send, Activity, Info, Bot } from 'lucide-react';

const Chat = () => {
    const { userData, t } = useWizard();
    const [messages, setMessages] = useState([
        { id: '1', sender: 'ai', text: t('chatWelcome') }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const searchFoodInDatabase = async (foodName) => {
        try {
            const cleanQuery = foodName.toLowerCase().trim();
            const { data, error } = await supabase
                .from('food_database')
                .select('*')
                .ilike('food_name', cleanQuery) // Búsqueda exacta (sin los %) para evitar falsos positivos
                .limit(1);

            if (error) throw error;
            return data && data.length > 0 ? data[0] : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    };

    const saveFoodToDatabase = async (food) => {
        try {
            const { error } = await supabase
                .from('food_database')
                .insert([{
                    food_name: food.food_name.toLowerCase(),
                    carbs: food.carbs,
                    calories: food.calories || 0
                }]);

            if (error) {
                console.warn("Could not cache food in database:", error.message);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const calculateInsulin = (carbs) => {
        const ratio = userData.carbRatio || 10;
        return (carbs / ratio).toFixed(1);
    };

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userText = input.trim();
        const userMsgId = Date.now().toString();

        setMessages(prev => [...prev, { id: userMsgId, sender: 'user', text: userText }]);
        setInput('');
        setIsTyping(true);

        try {
            // Dividimos la entrada por comas, "y", "e", "and" para procesar múltiples alimentos
            const items = userText.split(/\s+y\s+|\s+e\s+|\s+and\s+|\s*,\s*/i).filter(item => item.trim() !== '');
            let totalCarbs = 0;
            let totalCalories = 0;
            let sources = new Set();
            let someFailed = false;

            const results = await Promise.all(items.map(async (itemText) => {
                const item = itemText.trim();
                let foodResult = null;
                let source = '';
                let needsCache = false;

                // 1. Buscamos en Base de Datos Local
                const dbFood = await searchFoodInDatabase(item);
                if (dbFood) {
                    foodResult = dbFood;
                    source = 'Local Database';
                }

                // 2. Si no, buscamos en Open Food Facts
                if (!foodResult) {
                    const offResult = await searchOpenFoodFacts(item);
                    if (offResult) {
                        foodResult = offResult;
                        source = 'Open Food Facts';
                        needsCache = true;
                    }
                }

                // 3. Si no, buscamos en USDA FoodData Central
                if (!foodResult) {
                    const usdaResult = await searchUSDA(item);
                    if (usdaResult) {
                        foodResult = usdaResult;
                        source = 'USDA';
                        needsCache = true;
                    }
                }

                // 4. Si tampoco existe, como último recurso llamamos a AI
                if (!foodResult) {
                    const aiResult = await analyzeFoodWithAI(item, userData.language);
                    if (aiResult) {
                        foodResult = aiResult;
                        source = 'Carby AI';
                        needsCache = true;
                    }
                }

                return { foodResult, source, needsCache, originalItem: item };
            }));

            for (const res of results) {
                if (res.foodResult) {
                    totalCarbs += res.foodResult.carbs;
                    totalCalories += res.foodResult.calories || 0;
                    sources.add(res.source);

                    if (res.needsCache) {
                        // Guardamos el item con el nombre exacto que escribió el usuario
                        await saveFoodToDatabase({ ...res.foodResult, food_name: res.originalItem });
                    }
                } else {
                    someFailed = true;
                }
            }

            setIsTyping(false);

            if (results.length > 0 && !someFailed) {
                const combinedSource = Array.from(sources).join(', ');

                setMessages(prev => [...prev, {
                    id: Date.now().toString() + 'ai',
                    sender: 'ai',
                    type: 'card',
                    items: results.map(r => ({
                        name: r.originalItem.charAt(0).toUpperCase() + r.originalItem.slice(1),
                        carbs: r.foodResult.carbs,
                        calories: r.foodResult.calories || 0
                    })),
                    totalCarbs: parseFloat(totalCarbs.toFixed(1)),
                    totalCalories: parseFloat(totalCalories.toFixed(0)),
                    insulin: calculateInsulin(totalCarbs),
                    source: combinedSource
                }]);
            } else {
                // Fallback si alguno falló
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + 'err',
                    sender: 'ai',
                    text: t('chatError')
                }]);
            }
        } catch (error) {
            console.error(error);
            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: Date.now().toString() + 'err',
                sender: 'ai',
                text: t('chatError')
            }]);
        }
    };

    return (
        <div className={styles.chatContainer}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <div className={styles.logoCircle}>
                        <Activity size={20} color="var(--color-primary-600)" />
                    </div>
                    <div>
                        <h1 className={styles.headerTitle}>Carby AI</h1>
                        <p className={styles.headerSubtitle}>{isTyping ? t('chatAnalyzing') : 'Ready to assist'}</p>
                    </div>
                </div>
                <div className={styles.userRatio}>
                    Ratio: 1U/<b>{userData.carbRatio || 10}g</b>
                </div>
            </header>

            <div className={styles.messagesArea}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.wrapperUser : styles.wrapperAi}`}>
                        {msg.sender === 'ai' && (
                            <div className={styles.aiAvatar}>
                                <Bot size={16} />
                            </div>
                        )}
                        <div className={msg.sender === 'user' ? styles.msgUser : styles.msgAi}>
                            {msg.text && <p className={styles.msgText}>{msg.text}</p>}

                            {msg.type === 'card' && (
                                <div className={styles.receiptCard}>
                                    <div className={styles.receiptHeader}>
                                        <h3>🍽️ Macros & Insulina</h3>
                                    </div>
                                    <div className={styles.itemList}>
                                        {msg.items.map((item, idx) => (
                                            <div key={idx} className={styles.itemRow}>
                                                <span className={styles.itemName}>{item.name}</span>
                                                <span className={styles.itemStats}>
                                                    {item.carbs}g C | {item.calories} kcal
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className={styles.divider}></div>

                                    <div className={styles.totalsArea}>
                                        <div className={styles.totalRow}>
                                            <span className={styles.totalLabel}>Carbs (g)</span>
                                            <span className={styles.totalValue}>{msg.totalCarbs}</span>
                                        </div>
                                        <div className={styles.totalRow}>
                                            <span className={styles.totalLabel}>Calorías</span>
                                            <span className={styles.totalValue}>{msg.totalCalories} kcal</span>
                                        </div>
                                        <div className={`${styles.totalRow} ${styles.insulinRow}`}>
                                            <span className={styles.totalLabel}>💉 Insulina (U)</span>
                                            <span className={styles.insulinValue}>{msg.insulin}</span>
                                        </div>
                                    </div>

                                    <div className={styles.sourceFooter}>
                                        <Info size={12} className={styles.sourceIcon} />
                                        {t('retrievedFrom')} {msg.source}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className={`${styles.messageWrapper} ${styles.wrapperAi}`}>
                        <div className={styles.aiAvatar}><Bot size={16} /></div>
                        <div className={styles.typingIndicator}>
                            <div className={styles.dot}></div><div className={styles.dot}></div><div className={styles.dot}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.inputField}
                        placeholder={t('chatPlaceholder')}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={isTyping}
                    />
                    <button
                        className={`${styles.sendButton} ${input.trim() ? styles.active : ''}`}
                        onClick={handleSend}
                        disabled={isTyping || !input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
