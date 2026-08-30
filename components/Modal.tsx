import React, { useCallback, useEffect, useId, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  comment?: string;
  /** Un popup destructivo cambia el borde a rojo. Es la única señal extra. */
  destructive?: boolean;
  children: React.ReactNode;
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, comment, destructive, children }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const focusables = useCallback(
    () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    (focusables()[0] ?? panelRef.current)?.focus();
    return () => previouslyFocused?.focus?.();
  }, [isOpen, focusables]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, focusables]);

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)' }}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        style={{
          borderColor: destructive ? 'var(--v6-red)' : 'var(--v6-line)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
        }}
        className="relative flex max-h-[90dvh] w-full max-w-[460px] flex-col overflow-y-auto rounded border bg-background p-4 outline-none"
      >
        <div className="mb-3.5">
          <div className="flex items-baseline gap-2 text-13">
            <span className="text-green">$</span>
            <h2 id={titleId} className="font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-auto text-12 text-subtle hover:text-foreground"
            >
              [x]
            </button>
          </div>
          {comment && <p className="mt-0.5 text-11 text-subtle">{comment}</p>}
        </div>

        <div className="flex flex-col gap-3.5">{children}</div>
      </div>
    </div>
  );
};
