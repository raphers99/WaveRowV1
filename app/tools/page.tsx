'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Calculator, Info } from 'lucide-react'
import { fadeUp } from '@/lib/motion'


function fmt(n: number) {
  return '$' + n.toLocaleString()
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  const over = value > max * 0.33
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, fontWeight: 600, color: over ? '#ef4444' : 'var(--text-primary)' }}>{fmt(value)}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', borderRadius: 4, background: color }}
        />
      </div>
    </div>
  )
}

export default function ToolsPage() {
  const [income, setIncome] = useState('')
  const [other, setOther] = useState('')
  const [hasResult, setHasResult] = useState(false)

  const monthlyIncome = Number(income) / 12
  const otherExpenses = Number(other) || 0
  const maxRent = Math.round(monthlyIncome * 0.33)
  const comfortable = Math.round(monthlyIncome * 0.28)
  const leftover = Math.round(monthlyIncome - maxRent - otherExpenses)

  function calculate() {
    if (!income || Number(income) <= 0) return
    setHasResult(true)
  }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 96, minHeight: '100dvh', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,103,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={20} color="var(--olive)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Rent Calculator</h1>
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 28 }}>Figure out what you can afford before you browse.</p>

        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ marginBottom: 18 }}>
            <p className="label-style">Annual income (or financial aid)</p>
            <div style={{ position: 'relative' }}>
              <DollarSign size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input"
                type="number"
                value={income}
                onChange={e => { setIncome(e.target.value); setHasResult(false) }}
                placeholder="40,000"
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <p className="label-style">Other monthly expenses (food, transport, etc.)</p>
            <div style={{ position: 'relative' }}>
              <DollarSign size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="input"
                type="number"
                value={other}
                onChange={e => { setOther(e.target.value); setHasResult(false) }}
                placeholder="600"
                style={{ paddingLeft: 32 }}
              />
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={calculate}
            disabled={!income || Number(income) <= 0}
            style={{
              width: '100%', background: income && Number(income) > 0 ? 'var(--olive)' : 'rgba(0,103,71,0.3)',
              color: 'white', border: 'none', borderRadius: 12, padding: '13px',
              fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15,
              cursor: income && Number(income) > 0 ? 'pointer' : 'not-allowed',
            }}
          >
            Calculate
          </motion.button>
        </div>

        {hasResult && (
          <motion.div variants={fadeUp} initial="hidden" animate="visible">
            {/* Summary card */}
            <div className="card" style={{ padding: 20, marginBottom: 16, background: 'rgba(0,103,71,0.04)', border: '1.5px solid rgba(0,103,71,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>Max rent (30% rule)</p>
                  <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 800, color: 'var(--olive)', margin: 0 }}>{fmt(maxRent)}<span style={{ fontSize: 16, fontWeight: 400 }}>/mo</span></p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>Comfortable</p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{fmt(comfortable)}<span style={{ fontSize: 13, fontWeight: 400 }}>/mo</span></p>
                </div>
              </div>

              <Bar label="Rent (max)" value={maxRent} max={monthlyIncome} color="var(--olive)" />
              <Bar label="Other expenses" value={otherExpenses} max={monthlyIncome} color="#f59e0b" />
              <Bar label="Left over" value={Math.max(0, leftover)} max={monthlyIncome} color={leftover >= 0 ? '#10b981' : '#ef4444'} />

              {leftover < 0 && (
                <div style={{ display: 'flex', gap: 8, background: 'rgba(239,68,68,0.08)', borderRadius: 10, padding: '10px 12px', marginTop: 8 }}>
                  <Info size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#ef4444', margin: 0 }}>Your expenses exceed your income. Consider shared housing to lower your costs.</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <a href="/listings" style={{ flex: 1, textDecoration: 'none' }}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  Browse Listings
                </motion.button>
              </a>
              <a href="/roommates" style={{ flex: 1, textDecoration: 'none' }}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', background: 'white', color: 'var(--olive)', border: '1.5px solid rgba(0,103,71,0.2)', borderRadius: 12, padding: '13px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                >
                  Find Roommates
                </motion.button>
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
