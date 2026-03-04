import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useWizard } from '../contexts/WizardContext';
import { analyzeFoodWithAI } from '../lib/ai';
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
            const query = `%${foodName.toLowerCase().trim()}%`;
            const { data, error } = await supabase
                .from('food_database')
                .select('*')
                .ilike('food_name', query)
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
                    carbs: food.carbs
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
            // 1. Search DB first (Cache)
            const dbFood = await searchFoodInDatabase(userText);

            if (dbFood) {
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: Date.now().toString() + 'ai',
                    sender: 'ai',
                    type: 'card',
                    food: dbFood.food_name,
                    carbs: dbFood.carbs,
                    insulin: calculateInsulin(dbFood.carbs),
                    source: 'Database',
                    text: t('chatFoundDb')
                }]);
            } else {
                // 2. Not in DB? Call real AI
                const aiResult = await analyzeFoodWithAI(userText, userData.language);
                setIsTyping(false);

                if (aiResult) {
                    // 3. Cache the AI result for future use
                    await saveFoodToDatabase(aiResult);

                    setMessages(prev => [...prev, {
                        id: Date.now().toString() + 'ai',
                        sender: 'ai',
                        type: 'card',
                        food: aiResult.food_name,
                        carbs: aiResult.carbs,
                        insulin: calculateInsulin(aiResult.carbs),
                        source: 'Carby AI (GPT-4o)',
                        text: aiResult.explanation
                    }]);
                } else {
                    // Fallback if AI fails or Key is missing
                    setMessages(prev => [...prev, {
                        id: Date.now().toString() + 'err',
                        sender: 'ai',
                        text: t('chatError')
                    }]);
                }
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
                                <div className={styles.foodCard}>
                                    <div className={styles.foodCardHeader}>
                                        <span className={styles.foodName}>{msg.food}</span>
                                    </div>
                                    <div className={styles.foodStats}>
                                        <div className={styles.statBox}>
                                            <span className={styles.statLabel}>{t('carbsLabel')}</span>
                                            <span className={styles.statValue}>{msg.carbs}</span>
                                        </div>
                                        <div className={styles.statBoxHighlight}>
                                            <span className={styles.statLabel}>{t('insulinLabel')}</span>
                                            <span className={styles.statValue}>{msg.insulin}</span>
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
