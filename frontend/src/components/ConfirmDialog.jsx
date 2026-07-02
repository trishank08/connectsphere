import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="card w-full max-w-sm p-6"
            initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mb-4 ${danger ? 'bg-error/10 text-error' : 'bg-accent/10 text-accent'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-display font-bold text-lg mb-1.5">{title}</h3>
            <p className="text-sm text-text-secondary mb-6">{description}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} className="btn-secondary flex-1">Cancel</button>
              <button
                onClick={onConfirm}
                className={`flex-1 rounded-control px-4 py-2.5 font-semibold transition-all active:scale-[0.98] ${
                  danger ? 'bg-error text-white hover:brightness-110' : 'btn-primary'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
