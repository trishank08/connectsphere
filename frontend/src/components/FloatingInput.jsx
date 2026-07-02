import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function FloatingInput({ label, type = 'text', value, onChange, name, error, ...rest }) {
  const [focused, setFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const floated = focused || value?.length > 0

  return (
    <div className="mb-4">
      <div className="relative">
        <input
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`input-field pt-5 pb-2 ${error ? 'border-error/60 focus:ring-error/20' : ''}`}
          {...rest}
        />
        <label
          className={`absolute left-4 transition-all duration-200 pointer-events-none text-text-secondary ${
            floated ? 'top-2 text-[10px] font-medium' : 'top-1/2 -translate-y-1/2 text-sm'
          }`}
        >
          {label}
        </label>
        {isPassword && (
          <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="text-error text-xs mt-1.5 ml-1">{error}</p>}
    </div>
  )
}
