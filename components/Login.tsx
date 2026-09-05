"use client";
import React from 'react';
import { Box, Cmd } from './v6/Button';

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
        const next = [...pin];
        next[index] = digit;
        setPin(next);
        if (digit !== '' && index < 3) inputRefs.current[index + 1]?.focus();
        if (index === 3 && digit !== '') onLogin(next.join(''));
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) inputRefs.current[index - 1]?.focus();
    };

    const complete = pin.every(d => d !== '');
    const hasInput = pin.some(d => d !== '');

    const clear = () => {
        setPin(['', '', '', '']);
        // Tras el repintado: al vaciarse, [limpiar] desaparece y se lleva el
        // foco consigo, así que enfocar aquí mismo no serviría de nada.
        requestAnimationFrame(() => inputRefs.current[0]?.focus());
    };

    return (
        <div className="flex min-h-screen flex-col justify-center bg-background p-3.5">
            <form
                onSubmit={(e) => { e.preventDefault(); onLogin(pin.join('')); }}
                className="mx-auto flex w-full max-w-[360px] flex-col gap-[22px]"
            >
                <div className="text-13">
                    <span className="text-green">sergi</span>
                    <span className="text-blue">@habitos</span>
                    <span className="text-subtle">:~</span>
                    <span className="text-green">$</span>{' '}
                    <span className="font-bold text-white">auth --pin</span>
                    <span className="v6-cursor text-white" />
                </div>

                <p className="text-11 text-subtle">{'// introduce los 4 dígitos'}</p>

                <div className="flex gap-2">
                    {pin.map((digit, index) => (
                        <div key={index} className="relative flex-1">
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
                                /* Texto transparente: el cuadrado lo dibuja el div de abajo,
                                   para no rendererizar dos marcas superpuestas. */
                                className="h-14 w-full rounded border bg-surface text-center text-transparent caret-transparent outline-none focus:border-green disabled:opacity-60"
                            />
                            {digit && (
                                <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                    <span className="h-2 w-2 rounded-sm bg-foreground" />
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Altura reservada: el mensaje no empuja el layout al aparecer. */}
                <div className="flex min-h-[44px] items-start gap-3">
                    {error ? (
                        <div
                            role="alert"
                            className="flex-1 rounded border px-2 py-1.5 text-11"
                            style={{ borderColor: 'var(--v6-red)', background: 'rgba(232,83,110,0.1)', color: 'var(--v6-red)' }}
                        >
                            {error}
                        </div>
                    ) : (
                        <span className="flex-1" />
                    )}
                    {hasInput && (
                        <span className="flex min-h-[44px] shrink-0 items-center">
                            <Cmd accent="var(--v6-dim)" onClick={clear}>limpiar</Cmd>
                        </span>
                    )}
                </div>

                <Box type="submit" disabled={!complete || isSubmitting} className="w-full">
                    {isSubmitting ? 'comprobando…' : 'acceder'}
                </Box>

                <p className="text-11 text-subtle">{'// bloqueo local de este dispositivo'}</p>
            </form>
        </div>
    );
};
