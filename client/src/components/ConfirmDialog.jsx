import { useEffect } from 'react';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'Please confirm this action.',
  confirmText = 'Confirm',
  cancelText = 'No',
  onConfirm,
  onClose,
  isDangerous = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#0b0a1f] p-8 shadow-2xl relative"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(124, 92, 255, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-medium tracking-tight text-white mb-3">
          {title}
        </h3>
        <p className="text-base text-[#c9c6e0] leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="btn-pill-secondary"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={isDangerous ? 'btn-pill-danger' : 'btn-pill-primary'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
