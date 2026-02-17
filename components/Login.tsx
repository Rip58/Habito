import React, { useState, useRef, useEffect } from 'react';
import { Zap, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
    onLogin: (pin: string) => void;
    error?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        // Auto-focus next input
        if (value !== '' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit if complete
        if (index === 3 && value !== '') {
            onLogin(newPin.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(pin.join(''));
    };

    return (
        <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 ring-4 ring-primary/5">
                        <Zap className="text-primary w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
                    <p className="text-text-muted">Introduce tu PIN de acceso para continuar.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex justify-center gap-4 mb-8">
                        {pin.map((digit, index) => (
                            <div key={index} className="relative">
                                <input
                                    ref={el => { inputRefs.current[index] = el }}
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-14 h-16 bg-bg-card border-2 border-border-subtle rounded-xl text-center text-2xl font-bold text-white focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all outline-none"
                                />
                                {digit && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <AlertCircle size={20} />
                            <p className="font-medium">PIN incorrecto. Inténtalo de nuevo.</p>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={() => onLogin(pin.join(''))}
                        className="w-full bg-primary hover:bg-primary-hover text-bg-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Acceder al Sistema</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center text-xs text-text-muted/50 uppercase tracking-widest">
                    Sistema Seguro • Habitos Pro v1.0
                </p>
            </div>
        </div>
    );
};
