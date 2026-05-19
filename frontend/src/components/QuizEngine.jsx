import React, { useState } from 'react';
import { Check, X, AlertCircle, Award, RefreshCw, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const QuizEngine = ({ topic, questions, onExit, apiBase }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const currentQuestion = questions[currentIdx];

    const handleAnswer = (option) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);

        if (option === currentQuestion.correct_answer) {
            setScore(s => s + 1);
        }
    };

    const saveResults = async () => {
        try {
            await axios.post(`${apiBase}/results`, {
                topic_id: topic.id,
                score: score,
                total_questions: questions.length
            });
        } catch (err) {
            console.error("Error saving results", err);
        }
    };

    const nextQuestion = () => {
        if (currentIdx + 1 < questions.length) {
            setCurrentIdx(i => i + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            saveResults();
            setShowResults(true);
        }
    };

    const resetQuiz = () => {
        setCurrentIdx(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setScore(0);
        setShowResults(false);
    };

    if (showResults) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="max-w-md mx-auto py-12 text-center animate-in fade-in duration-500">
                <div className="glass-card p-10">
                    <div className="bg-indigo-600/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">¡Completado!</h2>
                    <p className="text-slate-400 mb-8">Has terminado el examen de "{topic.name}"</p>

                    <div className="text-6xl font-black text-indigo-400 mb-2">{percentage}%</div>
                    <p className="text-lg font-medium text-slate-300 mb-10">
                        Aciertos: <span className="text-emerald-400">{score}</span> / {questions.length}
                    </p>

                    <div className="flex flex-col gap-3">
                        <button onClick={resetQuiz} className="btn-primary w-full flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5" /> Repetir Examen
                        </button>
                        <button onClick={onExit} className="btn-secondary w-full flex items-center justify-center gap-2">
                            <Home className="w-5 h-5" /> Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex items-center justify-between mb-8 px-2">
                <h2 className="text-xl font-bold truncate pr-4">{topic.name}</h2>
                <div className="bg-white/10 px-4 py-1.5 rounded-full text-sm font-medium">
                    Pregunta {currentIdx + 1} de {questions.length}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentIdx}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    className="glass-card p-8 min-h-[400px] flex flex-col"
                >
                    <div className="flex-grow">
                        <h3 className="text-2xl font-semibold leading-relaxed mb-8">
                            {currentQuestion.text}
                        </h3>

                        <div className="grid gap-3 mb-8">
                            {['A', 'B', 'C', 'D'].map((opt) => {
                                const optText = currentQuestion[`option_${opt.toLowerCase()}`];
                                if (!optText) return null;

                                let classes = "w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ";
                                if (!isAnswered) {
                                    classes += "bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50 active:scale-[0.98]";
                                } else {
                                    if (opt === currentQuestion.correct_answer) {
                                        classes += "bg-emerald-500/20 border-emerald-500 text-emerald-100";
                                    } else if (opt === selectedOption) {
                                        classes += "bg-red-500/20 border-red-500 text-red-100";
                                    } else {
                                        classes += "bg-white/5 border-white/10 opacity-50";
                                    }
                                }

                                return (
                                    <button
                                        key={opt}
                                        onClick={() => handleAnswer(opt)}
                                        disabled={isAnswered}
                                        className={classes}
                                    >
                                        <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                                            {opt}
                                        </span>
                                        <span className="leading-tight pt-1">{optText}</span>
                                        {isAnswered && opt === currentQuestion.correct_answer && <Check className="w-6 h-6 ml-auto text-emerald-400 shrink-0" />}
                                        {isAnswered && opt === selectedOption && opt !== currentQuestion.correct_answer && <X className="w-6 h-6 ml-auto text-red-400 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {isAnswered && currentQuestion.explanation && currentQuestion.explanation.trim() !== '' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 mb-8"
                            >
                                <h4 className="text-indigo-300 font-semibold mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" /> Explicación
                                </h4>
                                <p className="text-indigo-100/80 leading-relaxed text-sm">
                                    {currentQuestion.explanation}
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex justify-end pt-6 border-t border-white/10">
                        {isAnswered ? (
                            <button onClick={nextQuestion} className="btn-primary">
                                {currentIdx + 1 === questions.length ? 'Finalizar' : 'Siguiente Pregunta'}
                            </button>
                        ) : (
                            <div className="flex items-center gap-2 text-slate-500 text-sm italic">
                                <AlertCircle className="w-4 h-4" /> Selecciona una respuesta para continuar
                            </div>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default QuizEngine;
