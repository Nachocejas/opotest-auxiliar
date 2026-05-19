import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Loader2, AlertCircle, Folder, Plus } from 'lucide-react';
import axios from 'axios';

const UploadZone = ({ onUploadSuccess, subjects = [], onSubjectCreated, apiBase }) => {
    const [uploadingFiles, setUploadingFiles] = useState([]);
    const [globalError, setGlobalError] = useState(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [isCreatingSubject, setIsCreatingSubject] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');

    const handleCreateSubject = async () => {
        try {
            const res = await axios.post(`${apiBase}/subjects`, { name: newSubjectName });
            setSelectedSubjectId(res.data.id);
            setIsCreatingSubject(false);
            setNewSubjectName('');
            if (onSubjectCreated) onSubjectCreated();
        } catch (err) {
            setGlobalError("No se pudo crear la asignatura. Tal vez ya existe.");
        }
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        if (!selectedSubjectId) {
            setGlobalError('Por favor, selecciona o crea una asignatura primero.');
            return;
        }

        setGlobalError(null);

        // Add all valid files to the uploading state
        const newFiles = files
            .filter(file => {
                if (!file.name.endsWith('.pdf')) {
                    setGlobalError('Algunos archivos no eran PDF y se ignoraron.');
                    return false;
                }
                return true;
            })
            .map(file => ({
                id: Math.random().toString(36).substr(2, 9),
                name: file.name,
                file: file,
                status: 'pending', // pending, uploading, success, error
                error: null
            }));

        if (newFiles.length === 0) return;

        setUploadingFiles(prev => [...prev, ...newFiles]);

        // Process files sequentially
        for (const fileObj of newFiles) {
            updateFileStatus(fileObj.id, { status: 'uploading' });

            const formData = new FormData();
            formData.append('file', fileObj.file);
            formData.append('subject_id', selectedSubjectId);

            try {
                const response = await axios.post(`${apiBase}/upload`, formData);
                updateFileStatus(fileObj.id, { status: 'success' });
                // Trigger success callback for each successful upload
                onUploadSuccess(response.data);
            } catch (err) {
                const msg = err.response?.data?.detail || 'Error al conectar';
                updateFileStatus(fileObj.id, { status: 'error', error: msg });
                console.error(`Error uploading ${fileObj.name}:`, err);
            }
        }
    };

    const updateFileStatus = (id, updates) => {
        setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-xl mx-auto">
            {/* Subject Selector */}
            <div className="w-full glass-card p-6 mb-2 text-left">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-indigo-400" /> Selecciona la Asignatura
                </h3>
                
                {!isCreatingSubject ? (
                    <div className="flex gap-3">
                        <select 
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                        >
                            <option value="">-- Elige una asignatura --</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        <button 
                            onClick={() => setIsCreatingSubject(true)}
                            className="btn-secondary whitespace-nowrap px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium text-sm flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1 inline" /> Nueva
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <input 
                            type="text" 
                            placeholder="Nombre de la nueva asignatura..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-indigo-500 transition-colors"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                        />
                        <button 
                            onClick={handleCreateSubject}
                            disabled={!newSubjectName.trim()}
                            className="btn-primary whitespace-nowrap px-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors font-medium text-sm text-white disabled:opacity-50"
                        >
                            Guardar
                        </button>
                        <button 
                            onClick={() => setIsCreatingSubject(false)}
                            className="btn-secondary whitespace-nowrap px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors font-medium text-sm"
                        >
                            Cancelar
                        </button>
                    </div>
                )}
            </div>

            <div className="glass-card p-8 flex flex-col items-center justify-center border-dashed border-2 border-white/20 hover:border-indigo-500/50 transition-all cursor-pointer group relative overflow-hidden min-h-[200px]">
                <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />

                <div className="bg-indigo-600/20 p-4 rounded-full mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Subir Cuestionarios</h3>
                <p className="text-slate-400 text-center max-w-sm">
                    Selecciona uno o varios archivos PDF con preguntas y respuestas.
                </p>

                {globalError && (
                    <p className="mt-4 text-amber-400 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {globalError}
                    </p>
                )}
            </div>

            {uploadingFiles.length > 0 && (
                <div className="glass-card p-4 flex flex-col gap-2 max-h-[300px] overflow-y-auto">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Progreso de subida</h4>
                    {uploadingFiles.map(file => (
                        <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex items-center gap-3 overflow-hidden">
                                {file.status === 'uploading' ? (
                                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" />
                                ) : file.status === 'success' ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                ) : file.status === 'error' ? (
                                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                                ) : (
                                    <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium truncate">{file.name}</span>
                            </div>

                            {file.status === 'error' && (
                                <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20 max-w-[150px] truncate">
                                    {file.error}
                                </span>
                            )}

                            {file.status === 'success' && (
                                <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                                    Listo
                                </span>
                            )}
                        </div>
                    ))}

                    <button
                        onClick={() => setUploadingFiles([])}
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors text-right"
                    >
                        Limpiar lista
                    </button>
                </div>
            )}
        </div>
    );
};

export default UploadZone;
