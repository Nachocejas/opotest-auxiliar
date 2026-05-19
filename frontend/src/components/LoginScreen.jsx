import React from 'react';
import { Brain } from 'lucide-react';

const LoginScreen = ({ password, setPassword, passError, onLogin }) => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card p-8 max-w-sm w-full text-center">
                <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
                    <Brain className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Quiz Master PDF</h2>
                <p className="text-slate-500 mb-8 font-medium">Acceso restringido</p>

                <form onSubmit={onLogin} className="space-y-4">
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Contraseña del equipo"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full bg-white/5 border ${passError ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all`}
                            autoFocus
                        />
                    </div>

                    {passError && (
                        <p className="text-red-400 text-xs animate-shake">
                            Contraseña incorrecta. Inténtalo de nuevo.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                    >
                        Entrar
                    </button>
                </form>

                <p className="mt-8 text-slate-600 text-[10px] uppercase tracking-widest font-bold">
                    Protected Session
                </p>
            </div>
        </div>
    );
};

export default LoginScreen;
