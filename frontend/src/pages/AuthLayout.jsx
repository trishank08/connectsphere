import { motion } from 'framer-motion'
import { Sparkles, MessageSquare, Users, Zap } from 'lucide-react'

const FEATURES = [
  { icon: Users, text: 'Grow a network that actually knows you' },
  { icon: MessageSquare, text: 'Real-time chats, no refresh needed' },
  { icon: Zap, text: 'A feed shaped by people, not ads' },
]

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-radial-glow">
        <div className="absolute inset-0 bg-gradient-brand opacity-[0.08]" />
        <div className="relative flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-control bg-gradient-brand flex items-center justify-center">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-display font-extrabold text-xl">ConnectSphere</span>
        </div>

        <div className="relative">
          <motion.h1
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="font-display font-extrabold text-4xl xl:text-5xl leading-[1.1] mb-6"
          >
            Where real<br />connections<br /><span className="bg-gradient-brand bg-clip-text text-transparent">actually happen.</span>
          </motion.h1>
          <div className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.15 * i }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-control bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-accent" />
                </div>
                <span className="text-text-secondary text-sm">{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-text-secondary">© {new Date().getFullYear()} ConnectSphere. Built for people, not feeds.</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
