import { Moon, Sun } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '0.4rem 0.8rem',
        cursor: 'pointer',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        transition: 'all 0.2s'
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark'
          ? <Moon size={15} />
          : <Sun size={15} />
        }
      </motion.div>
      {theme === 'dark' ? 'Dark' : 'Light'}
    </motion.button>
  )
}
