import React, { useState } from 'react';
import { Book, ChevronRight, Hash, Trash2, Loader2, AlertTriangle, X, Folder, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ topics, subjects, onSelectTopic, onDeleteSuccess, apiBase }) => {
    const [deletingId, setDeletingId] = useState(null);
    const [showConfirmId, setShowConfirmId] = useState(null);
    const [activeSubject, setActiveSubject] = useState(null);

    const openDeleteModal = (e, topicId) => {
        e.preventDefault();
        e.stopPropagation();
        setShowConfirmId(topicId);
    };

    const closeDeleteModal = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setShowConfirmId(null);
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const topicId = showConfirmId;
        setDeletingId(topicId);

        try {
            await axios.delete(`${apiBase}/topics/${topicId}`);
            onDeleteSuccess();
            setShowConfirmId(null);
        } catch (err) {
            console.error('Error deleting topic:', err);
            alert('No se pudo borrar el tema.');
        } finally {
            setDeletingId(null);
        }
    };

    if (activeSubject) {
        const subjectTopics = topics.filter(t => t.subject_id === activeSubject.id);

        return (
            <div className="relative animate-in slide-in-from-right-4 duration-300">
                <button 
                    onClick={() => setActiveSubject(null)}
                    className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver a Asignaturas
                </button>
                
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <Folder className="w-6 h-6 text-indigo-400" /> {activeSubject.name}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subjectTopics.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <Book className="w-12 h-12 mx-auto mb-4" />
                            <p>Aún no hay exámenes en esta asignatura.</p>
                        </div>
                    ) : (
                        subjectTopics.map((topic) => (
                            <div
                                key={topic.id}
                                onClick={() => onSelectTopic(topic)}
                                className="glass-card p-6 text-left hover:bg-white/15 transition-all group active:scale-[0.98] cursor-pointer relative overflow-hidden"
                            >
                                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Hash className="w-24 h-24" />
                                </div>

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className="bg-indigo-600/20 p-3 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                        <Hash className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => openDeleteModal(e, topic.id)}
                                            className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/20 rounded-xl transition-all active:scale-90 bg-white/5 border border-white/5 hover:border-red-400/50"
                                            title="Borrar tema"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                        <div className="p-2 text-slate-500 group-hover:translate-x-1 transition-transform">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-1 truncate">{topic.name}</h3>
                                    <div className="flex items-center gap-3 mt-3 text-sm">
                                        {topic.attempts > 0 ? (
                                            <>
                                                <span className="bg-white/10 px-2.5 py-1 rounded-md text-slate-300">
                                                    {topic.attempts} intento{topic.attempts !== 1 ? 's' : ''}
                                                </span>
                                                <span className={`px-2.5 py-1 rounded-md font-bold ${
                                                    topic.last_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                                    topic.last_score >= 50 ? 'bg-amber-400/20 text-amber-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                    Nota: {Math.round(topic.last_score)}%
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-slate-400">Sin empezar</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {/* Custom Delete Confirmation Modal */}
                <AnimatePresence>
                    {showConfirmId && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={closeDeleteModal}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            />

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="glass-card max-w-sm w-full p-8 relative z-10 border-red-500/20 bg-slate-900"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="bg-red-500/20 p-4 rounded-full mb-6">
                                        <AlertTriangle className="w-10 h-10 text-red-500" />
                                    </div>

                                    <h3 className="text-2xl font-bold mb-2">¿Confirmar borrado?</h3>
                                    <p className="text-slate-400 mb-8 lowercase">
                                        Esto eliminará permanentemente "{topics.find(t => t.id === showConfirmId)?.name}" y todas sus preguntas.
                                    </p>

                                    <div className="flex flex-col w-full gap-3">
                                        <button
                                            onClick={handleDelete}
                                            disabled={deletingId}
                                            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                                        >
                                            {deletingId ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" /> Borrando...
                                                </>
                                            ) : (
                                                'Sí, Eliminar'
                                            )}
                                        </button>
                                        <button
                                            onClick={closeDeleteModal}
                                            disabled={deletingId}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all border border-white/10 active:scale-95 disabled:opacity-50"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={closeDeleteModal}
                                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                                    disabled={deletingId}
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative animate-in fade-in duration-300">
            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.length === 0 ? (
                    <div className="col-span-full py-20 text-center opacity-50">
                        <Folder className="w-12 h-12 mx-auto mb-4" />
                        <p>Aún no hay asignaturas. Crea una al subir un PDF.</p>
                    </div>
                ) : (
                    subjects.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => setActiveSubject(sub)}
                            className="glass-card p-6 text-left hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all group active:scale-[0.98] cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Folder className="w-24 h-24 text-indigo-500" />
                            </div>

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                <div className="bg-indigo-600/20 p-3 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <Folder className="w-6 h-6" />
                                </div>
                                <div className="p-2 text-slate-500 group-hover:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold mb-1 truncate">{sub.name}</h3>
                                <p className="text-slate-400 text-sm">
                                    {topics.filter(t => t.subject_id === sub.id).length} exámenes
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Dashboard;
