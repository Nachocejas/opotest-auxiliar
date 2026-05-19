import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Target, TrendingUp, Calendar, Award, Folder } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsView = ({ apiBase }) => {
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${apiBase}/stats`);
            setStats(res.data);
        } catch (err) {
            console.error("Error fetching stats", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center animate-pulse">
                <div className="w-12 h-12 bg-indigo-600/20 rounded-full mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Cargando progreso...</p>
            </div>
        );
    }

    if (stats.length === 0) {
        return (
            <div className="py-20 text-center opacity-50">
                <Target className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
                <h3 className="text-xl font-bold mb-2">Aún no hay estadísticas</h3>
                <p>Termina tu primer examen para ver aquí tu evolución.</p>
            </div>
        );
    }

    // Calcular media global
    const totalPercentage = stats.reduce((acc, curr) => acc + curr.percentage, 0);
    const avgPercentage = Math.round(totalPercentage / stats.length);

    // Agrupar por asignatura
    const subjectStats = stats.reduce((acc, curr) => {
        if (!acc[curr.subject_name]) {
            acc[curr.subject_name] = {
                subject_name: curr.subject_name,
                attempts: 0,
                totalPercentage: 0,
                last_attempt: curr.created_at
            };
        }
        acc[curr.subject_name].attempts += 1;
        acc[curr.subject_name].totalPercentage += curr.percentage;
        if (new Date(curr.created_at) > new Date(acc[curr.subject_name].last_attempt)) {
            acc[curr.subject_name].last_attempt = curr.created_at;
        }
        return acc;
    }, {});

    const groupedStats = Object.values(subjectStats).map(s => ({
        ...s,
        avgPercentage: Math.round(s.totalPercentage / s.attempts)
    }));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8 text-slate-300">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-bold">Tu Evolución y Progreso</h2>
            </div>

            {/* Resumen Global */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="bg-indigo-600/20 p-4 rounded-2xl">
                        <Award className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Nota Media Global</p>
                        <p className="text-4xl font-black text-white">{avgPercentage}%</p>
                    </div>
                </div>
                <div className="glass-card p-6 flex items-center gap-6">
                    <div className="bg-emerald-500/20 p-4 rounded-2xl">
                        <Target className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Exámenes Completados</p>
                        <p className="text-4xl font-black text-white">{stats.length}</p>
                    </div>
                </div>
            </div>

            {/* Lista de Resultados por Asignatura */}
            <h3 className="text-lg font-bold mb-4">Progreso por Asignatura</h3>
            <div className="space-y-4">
                {groupedStats.map((stat, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        key={stat.subject_name} 
                        className="glass-card p-5"
                    >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                            <div>
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                    <Folder className="w-5 h-5 text-indigo-400" /> {stat.subject_name}
                                </h4>
                                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                    <span className="bg-white/10 px-2 py-0.5 rounded text-xs">{stat.attempts} exámenes realizados</span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> Último: {new Date(stat.last_attempt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black">{stat.avgPercentage}%</span>
                                <p className="text-sm text-slate-400">Nota Media</p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stat.avgPercentage}%` }}
                                transition={{ duration: 1, delay: 0.2 + (i * 0.05) }}
                                className={`h-full rounded-full ${
                                    stat.avgPercentage >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' :
                                    stat.avgPercentage >= 50 ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' :
                                    'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                                }`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default StatsView;
