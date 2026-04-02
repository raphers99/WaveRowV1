'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

export function VerificationModal({ userId, onClose }: { userId: string; onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    await supabase.storage.from('verification-docs').upload(path, file)
    await supabase.from('profiles').update({ verification_status: 'pending', verification_type: 'landlord' }).eq('user_id', userId)
    setUploading(false)
    setDone(true)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={e => e.stopPropagation()}
          style={{ background: 'white', borderRadius: '24px 24px 0 0', padding: '24px 20px 40px', width: '100%', maxWidth: 480 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-playfair)', fontSize: 20, fontWeight: 700, margin: 0 }}>Verify Ownership</h3>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
          </div>
          {done ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-primary)', fontWeight: 600 }}>Document submitted</p>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', marginTop: 8 }}>We will review your document within 1-2 business days.</p>
            </div>
          ) : (
            <>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.6 }}>
                Upload one of: property deed, lease ownership proof, utility bill, or management agreement.
              </p>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(0,103,71,0.2)', borderRadius: 16, padding: '32px 20px', cursor: 'pointer', gap: 8 }}>
                <Upload size={24} color="var(--olive)" />
                <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)' }}>{file ? file.name : 'Tap to upload document'}</span>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setFile(e.target.files?.[0] ?? null)} />
              </label>
              <button
                onClick={handleSubmit}
                disabled={!file || uploading}
                style={{
                  width: '100%', marginTop: 16, background: 'var(--olive)', color: 'white',
                  border: 'none', borderRadius: 12, padding: '14px', fontSize: 15,
                  fontWeight: 600, cursor: file ? 'pointer' : 'not-allowed', opacity: file ? 1 : 0.5,
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                {uploading ? 'Uploading...' : 'Submit Document'}
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
