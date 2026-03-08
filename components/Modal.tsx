import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel — centered, rounded-3xl (Finance style) */}
      <div
        className="modal-enter relative w-full max-w-md bg-card border border-border/60 rounded-3xl shadow-lg flex flex-col overflow-hidden max-h-[90vh]"
        style={{ boxShadow: '0 1px 3px 0px hsl(0 0% 0% / 0.20), 0 8px 24px -4px hsl(0 0% 0% / 0.30)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
          <h2 className="text-lg font-semibold text-foreground leading-none tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};
