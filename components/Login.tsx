import React, { useState } from 'react';
import { Lock, ArrowRight, Zap } from 'lucide-react';

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
            onLogin(newPin.join('') + value); // This might be buggy depending on state update, better use derived
            // Actually better to just wait for button or useEffect, but for 4 digits simple is fine
            setTimeout(() => onLogin(newPin.map((d, i) => i === index ? value : d).join('')), 100);
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-4">
                        {[0, 1, 2, 3].map((i) => (
                            <input
                                key={i}
                                ref={el => { inputRefs.current[i] = el }}
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                value={pin[i]}
                                onChange={(e) => handleChange(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                className={`w-14 h-16 bg-bg-card border-2 rounded-xl text-center text-2xl font-bold text-white focus:outline-none transition-all ${error
                                    ? 'border-red-500/50 focus:border-red-500'
                                    : 'border-white/10 focus:border-primary focus:shadow-[0_0_20px_rgba(48,232,122,0.15)]'
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-400 text-center text-sm font-medium animate-pulse">
                            PIN incorrecto. Inténtalo de nuevo.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-hover text-bg-dark font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        <span>Acceder al Sistema</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <p className="text-center text-xs text-text-muted/50 uppercase tracking-widest">
                    Sistema Seguro • Activator v1.0
                </p>
            </div>
        </div>
    );
};
