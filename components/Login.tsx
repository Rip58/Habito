import React from 'react';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
    onLogin: (pin: string) => void;
    error?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error }) => {
    const [pin, setPin] = React.useState(['', '', '', '']);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) value = value[value.length - 1];

        const newPin = [...pin];
        newPin[index] = value;
        setPin(newPin);

        if (value !== '' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

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
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-8 fade-in">

                {/* Logo + Title */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                        <Activity className="text-primary w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Bienvenido</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Introduce tu PIN para acceder
                        </p>
                    </div>
                </div>

                {/* PIN form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-center gap-3">
                        {pin.map((digit, index) => (
                            <div key={index} className="relative">
                                <input
                                    ref={el => { inputRefs.current[index] = el; }}
                                    type="password"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className="w-14 h-14 bg-card border-2 border-border rounded-xl text-center text-xl font-semibold text-foreground focus:border-primary focus:ring-4 focus:ring-ring/20 transition-all outline-none"
                                />
                                {digit && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-3 h-3 bg-foreground rounded-full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-lg flex items-center gap-3 text-sm fade-in">
                            <AlertCircle size={16} />
                            <span className="font-medium">PIN incorrecto. Inténtalo de nuevo.</span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="button"
                        onClick={() => onLogin(pin.join(''))}
                        className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-md transition-all flex items-center justify-center gap-2 group hover:opacity-90 active:scale-[0.99]"
                    >
                        <span>Acceder</span>
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground uppercase tracking-wider">
                    Habitos Pro · Acceso seguro
                </p>
            </div>
        </div>
    );
};
