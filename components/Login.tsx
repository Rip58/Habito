import React from 'react';
import { Activity, AlertCircle, ArrowRight } from 'lucide-react';

interface LoginProps {
    onLogin: (pin: string) => void;
    error?: string | null;
    isSubmitting?: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLogin, error, isSubmitting = false }) => {
    const [pin, setPin] = React.useState(['', '', '', '']);
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, '').slice(-1);

        const newPin = [...pin];
        newPin[index] = digit;
        setPin(newPin);

        if (digit !== '' && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        if (index === 3 && digit !== '') {
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

    const isComplete = pin.every(d => d !== '');

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-sm space-y-10 fade-in">

                {/* Logo + Title */}
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                        <Activity className="text-primary w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-foreground">Habitos Pro</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Introduce tu PIN de 4 dígitos
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
                                    autoComplete="off"
                                    aria-label={`Dígito ${index + 1} de 4`}
                                    maxLength={1}
                                    value={digit}
                                    autoFocus={index === 0}
                                    disabled={isSubmitting}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    /* El texto va transparente: el punto lo dibuja el div de abajo,
                                       para que no se rendericen dos puntos superpuestos. */
                                    className="w-14 h-16 bg-card border-2 border-input rounded-xl text-center text-transparent caret-primary focus:border-primary focus:ring-4 focus:ring-ring/20 transition-all outline-none disabled:opacity-60"
                                />
                                {digit && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-3 h-3 bg-foreground rounded-full" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Altura reservada: el mensaje no empuja el layout al aparecer */}
                    <div className="min-h-[2.75rem] flex items-start justify-center">
                        {error ? (
                            <div role="alert" className="w-full bg-destructive/10 text-destructive border border-destructive/20 p-3 rounded-lg flex items-center gap-3 text-sm fade-in">
                                <AlertCircle size={16} className="shrink-0" />
                                <span className="font-medium">{error}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-muted-foreground">
                                Se abre al introducir el cuarto dígito
                            </span>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={!isComplete || isSubmitting}
                        className="w-full h-11 bg-primary text-primary-foreground font-semibold rounded-md transition-all flex items-center justify-center gap-2 group hover:opacity-90 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                        <span>{isSubmitting ? 'Comprobando…' : 'Acceder'}</span>
                        {!isSubmitting && <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground">
                    Bloqueo local de este dispositivo
                </p>
            </div>
        </div>
    );
};
