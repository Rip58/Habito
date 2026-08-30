import React from 'react';

/** Prompt de shell: usuario, contexto, `$`, y dónde estás en blanco. */
export const Prompt: React.FC<{ section: string; right?: React.ReactNode }> = ({ section, right }) => (
    <div className="flex items-baseline gap-0 text-13">
        <span className="text-green">sergi</span>
        <span className="text-blue">@habitos</span>
        <span className="text-subtle">:~</span>
        <span className="text-green">$</span>
        <span className="ml-2 font-bold text-white">{section}</span>
        <span className="v6-cursor text-white" />
        {right && <span className="ml-auto whitespace-nowrap text-11 text-subtle">{right}</span>}
    </div>
);
