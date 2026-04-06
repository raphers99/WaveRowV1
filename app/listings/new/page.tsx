'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { ToggleField } from '@/components/ui'
import { fadeUp } from '@/lib/motion'
import type { Listing } from '@/types'

const TYPES = ['APARTMENT', 'HOUSE', 'STUDIO', 'SHARED_ROOM']
const TYPE_LABELS: Record<string, string> = { APARTMENT: 'Apartment', HOUSE: 'House', STUDIO: 'Studio', SHARED_ROOM: 'Room' }
const AMENITIES = ['Furnished', 'Parking', 'Washer/Dryer', 'AC', 'Pet Friendly', 'Gym', 'Pool', 'Dishwasher', 'Utilities Included']
const STEPS = ['Type', 'Details', 'Location', 'Amenities', 'Photos']

function getSupabase() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [publishedId, setPublishedId] = useState<string | null>(null)

  const [form, setForm] = useState({
    type: '',
    beds: 1, baths: 1, sqft: '', rent: '', deposit: '',
    available_from: '', available_to: '', status: 'ACTIVE',
    address: '', description: '',
    furnished: false, pets: false, utilities: false, is_sublease: false,
    amenities: [] as string[],
    original_lease_end: '', move_out_date: '', reason: '', semester: '',
  })

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login')
    })
  }, [router])

  function update(key: string, val: unknown) { setForm(f => ({ ...f, [key]: val })) }

  function toggleAmenity(a: string) {
    setForm(f => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter(x => x !== a) : [...f.amenities, a],
    }))
  }

  function canProceed() {
    if (step === 0) return !!form.type
    if (step === 1) return !!form.rent && form.beds > 0 && form.baths > 0
    if (step === 2) return !!form.address
    if (step === 4) return true
    return true
  }

  async function handlePhotoAdd(files: FileList | null) {
    if (!files) return
    const newFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
    setPhotos(p => [...p, ...newFiles])
    const urls = newFiles.map(f => URL.createObjectURL(f))
    setPhotoUrls(p => [...p, ...urls])
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const supabase = getSupabase()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/login'); return }

      const uploadedUrls: string[] = []
      for (const file of photos) {
        const ext = file.name.split('.').pop()
        const path = `${session.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
        const { error: upErr } = await supabase.storage.from('listing-images').upload(path, file)
        if (!upErr) {
          const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(path)
          uploadedUrls.push(urlData.publicUrl)
        }
      }

      const { data: listing, error: insertErr } = await supabase
        .from('listings')
        .insert({
          user_id: session.user.id,
          title: form.description ? form.description.slice(0, 60) : form.address,
          type: form.type,
          beds: form.beds,
          baths: form.baths,
          sqft: form.sqft ? Number(form.sqft) : null,
          rent: Number(form.rent),
          deposit: form.deposit ? Number(form.deposit) : null,
          address: form.address,
          neighborhood: null,
          description: form.description || null,
          furnished: form.furnished,
          pets: form.pets,
          utilities: form.utilities,
          is_sublease: form.is_sublease,
          amenities: form.amenities,
          photos: uploadedUrls,
          proximity_tags: [],
          status: 'ACTIVE',
          available_from: form.available_from || null,
          available_to: form.available_to || null,
        })
        .select()
        .single()

      if (insertErr) throw insertErr

      if (form.is_sublease && listing) {
        await supabase.from('sublet_details').insert({
          listing_id: listing.id,
          original_lease_end: form.original_lease_end,
          move_out_date: form.move_out_date,
          reason: form.reason || null,
          semester: form.semester || null,
        })
      }

      setPublishedId(listing.id)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const progress = ((step + 1) / STEPS.length) * 100

  if (publishedId) {
    return (
      <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', minHeight: '100dvh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible" style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(0,103,71,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <CheckCircle size={36} color="var(--olive)" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>Listing published!</h1>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 28px', lineHeight: 1.6 }}>
            Your listing is now live. Students can find it on WaveRow.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/listings/${publishedId}`)}
              style={{ width: '100%', background: 'var(--olive)', color: 'white', border: 'none', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              View Listing
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/dashboard')}
              style={{ width: '100%', background: 'white', color: 'var(--text-primary)', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: 14, padding: '14px', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
            >
              Go to Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 160, minHeight: '100dvh', background: 'var(--surface)' }}>
      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 'calc(56px + env(safe-area-inset-top))', left: 0, right: 0, height: 3, background: 'rgba(0,103,71,0.1)', zIndex: 40 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{ height: '100%', background: 'var(--olive)', borderRadius: 2 }}
        />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} aria-label="Back" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
              <ChevronLeft size={22} color="var(--text-primary)" />
            </button>
          )}
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 2px' }}>Step {step + 1} of {STEPS.length}</p>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{STEPS[step]}</h2>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} variants={fadeUp} initial="hidden" animate="visible" exit={{ opacity: 0, y: -12 }}>

            {/* Step 0: Type */}
            {step === 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {TYPES.map(t => (
                  <motion.button
                    key={t}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => update('type', t)}
                    style={{
                      padding: '20px 16px', borderRadius: 16, border: `2px solid ${form.type === t ? 'var(--olive)' : 'rgba(0,103,71,0.12)'}`,
                      background: form.type === t ? 'rgba(0,103,71,0.05)' : 'white',
                      cursor: 'pointer', fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 15,
                      color: form.type === t ? 'var(--olive)' : 'var(--text-primary)', transition: 'all 0.2s',
                    }}
                  >
                    {TYPE_LABELS[t]}
                  </motion.button>
                ))}
              </div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {[{ label: 'Beds', key: 'beds' }, { label: 'Baths', key: 'baths' }].map(({ label, key }) => (
                  <div key={key}>
                    <p className="label-style">{label}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <button onClick={() => update(key, Math.max(1, (form[key as 'beds' | 'baths'] as number) - 1))} style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(0,103,71,0.2)', background: 'white', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={`Decrease ${label}`}>-</button>
                      <span style={{ fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{form[key as 'beds' | 'baths']}</span>
                      <button onClick={() => update(key, (form[key as 'beds' | 'baths'] as number) + 1)} style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid rgba(0,103,71,0.2)', background: 'white', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={`Increase ${label}`}>+</button>
                    </div>
                  </div>
                ))}
                {[
                  { label: 'Monthly Rent ($)', key: 'rent', prefix: '$', type: 'number' },
                  { label: 'Security Deposit ($)', key: 'deposit', prefix: '$', type: 'number' },
                  { label: 'Square Footage', key: 'sqft', type: 'number' },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <p className="label-style">{label}</p>
                    <input
                      className="input"
                      type={type}
                      value={form[key as keyof typeof form] as string}
                      onChange={e => update(key, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
                {[
                  { label: 'Available From', key: 'available_from' },
                  { label: 'Available To (optional)', key: 'available_to' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <p className="label-style">{label}</p>
                    <input className="input" type="date" value={form[key as keyof typeof form] as string} onChange={e => update(key, e.target.value)} />
                  </div>
                ))}
                <ToggleField label="Is this a sublease?" value={form.is_sublease} onChange={v => update('is_sublease', v)} />
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p className="label-style">Address</p>
                  <input className="input" value={form.address} onChange={e => update('address', e.target.value)} placeholder="123 Main St" />
                </div>
                <div>
                  <p className="label-style">Description</p>
                  <textarea className="input" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe your place..." rows={4} style={{ resize: 'vertical' }} />
                </div>
                {form.is_sublease && (
                  <>
                    <div>
                      <p className="label-style">Original Lease End</p>
                      <input className="input" type="date" value={form.original_lease_end} onChange={e => update('original_lease_end', e.target.value)} />
                    </div>
                    <div>
                      <p className="label-style">Move-Out Date</p>
                      <input className="input" type="date" value={form.move_out_date} onChange={e => update('move_out_date', e.target.value)} />
                    </div>
                    <div>
                      <p className="label-style">Reason (optional)</p>
                      <input className="input" value={form.reason} onChange={e => update('reason', e.target.value)} placeholder="e.g. Studying abroad" />
                    </div>
                    <div>
                      <p className="label-style">Semester</p>
                      <input className="input" value={form.semester} onChange={e => update('semester', e.target.value)} placeholder="e.g. Spring 2026" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Amenities */}
            {step === 3 && (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <ToggleField label="Furnished" value={form.furnished} onChange={v => update('furnished', v)} />
                  <ToggleField label="Pets Allowed" value={form.pets} onChange={v => update('pets', v)} />
                  <ToggleField label="Utilities Included" value={form.utilities} onChange={v => update('utilities', v)} />
                </div>
                <p className="label-style" style={{ marginTop: 20, marginBottom: 12 }}>Additional Amenities</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {AMENITIES.map(a => (
                    <motion.button
                      key={a}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAmenity(a)}
                      style={{
                        padding: '8px 16px', borderRadius: 99, fontSize: 13,
                        fontFamily: 'var(--font-dm-sans)', fontWeight: 500,
                        background: form.amenities.includes(a) ? 'var(--olive)' : 'white',
                        color: form.amenities.includes(a) ? 'white' : 'var(--text-secondary)',
                        border: `1.5px solid ${form.amenities.includes(a) ? 'var(--olive)' : 'rgba(0,103,71,0.15)'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Photos */}
            {step === 4 && (
              <div>
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed rgba(0,103,71,0.2)', borderRadius: 16, padding: '32px 20px', cursor: 'pointer', gap: 8, background: 'white', marginBottom: 16 }}>
                  <Upload size={28} color="var(--olive)" />
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Upload Photos</span>
                  <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: 'var(--text-muted)' }}>Tap to add photos (optional but recommended)</span>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => handlePhotoAdd(e.target.files)} />
                </label>
                {photoUrls.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                    {photoUrls.map((url, i) => (
                      <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, overflow: 'hidden' }}>
                        <img src={url} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <button
                          onClick={() => { setPhotos(p => p.filter((_, j) => j !== i)); setPhotoUrls(p => p.filter((_, j) => j !== i)) }}
                          aria-label="Remove photo"
                          style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <X size={12} color="white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {photos.length === 0 && (
                  <div style={{ display: 'flex', gap: 8, background: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: '10px 12px', marginTop: 4 }}>
                    <AlertCircle size={15} color="#f59e0b" style={{ flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 13, color: '#92400e', margin: 0 }}>Listings with photos get 3× more inquiries. You can still publish without them.</p>
                  </div>
                )}
                {error && <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: '#ef4444', marginTop: 12 }}>{error}</p>}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed bottom buttons */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', background: 'rgba(242,242,247,0.95)', backdropFilter: 'blur(12px)', borderTop: '0.5px solid rgba(0,103,71,0.08)', zIndex: 40 }}>
        <motion.button
          whileHover={{ scale: canProceed() ? 1.01 : 1 }}
          whileTap={{ scale: canProceed() ? 0.98 : 1 }}
          onClick={() => { if (!canProceed()) return; if (step < STEPS.length - 1) setStep(s => s + 1); else handleSubmit() }}
          disabled={!canProceed() || loading}
          style={{
            width: '100%', background: canProceed() ? 'var(--olive)' : 'rgba(0,103,71,0.3)',
            color: 'white', border: 'none', borderRadius: 14, padding: '14px',
            fontFamily: 'var(--font-dm-sans)', fontWeight: 600, fontSize: 16,
            cursor: canProceed() ? 'pointer' : 'not-allowed',
          }}
        >
          {loading ? 'Publishing...' : step === STEPS.length - 1 ? 'Publish Listing' : 'Continue'}
        </motion.button>
      </div>
    </div>
  )
}
