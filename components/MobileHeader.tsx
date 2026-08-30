import React from 'react';
import { Prompt } from './v6/Prompt';

export const MobileHeader: React.FC<{ section: string; right?: React.ReactNode }> = ({ section, right }) => (
    <header className="sticky top-0 z-[60] bg-background px-3.5 pb-2 pt-[calc(0.75rem+env(safe-area-inset-top))] md:hidden">
        <Prompt section={section} right={right} />
    </header>
);
