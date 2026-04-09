export default function PrivacyPage() {
  return (
    <div style={{
      paddingTop: 'calc(56px + env(safe-area-inset-top))',
      paddingBottom: 96,
      minHeight: '100dvh',
      background: 'var(--surface)',
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 0' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, fontWeight: 600, color: 'var(--olive)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
          Legal
        </p>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
          Privacy Policy
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 40px' }}>
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {[
            {
              title: 'Information We Collect',
              body: 'We collect information you provide directly, such as your name, email address, and any listing or profile content you create. We also collect usage data to improve the platform.',
            },
            {
              title: 'How We Use Your Information',
              body: 'Your information is used to operate and improve WaveRow, communicate with you about your account, and display your listings and profile to other users.',
            },
            {
              title: 'Data Sharing',
              body: 'We do not sell your personal information. Profile and listing data you publish is visible to other WaveRow users. We may share data with service providers who help us operate the platform.',
            },
            {
              title: 'Data Retention',
              body: 'We retain your data for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us.',
            },
            {
              title: 'Security',
              body: 'We use industry-standard security measures to protect your data. All connections are encrypted via TLS. Authentication is handled by Supabase with @tulane.edu email verification.',
            },
            {
              title: 'Contact',
              body: 'For privacy questions or data requests, contact us at privacy@waverow.app.',
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                {title}
              </h2>
              <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 15, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.7 }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
