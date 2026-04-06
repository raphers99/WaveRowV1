export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 14, color: 'var(--text-muted)', margin: '0 0 40px' }}>
          Last updated: June 2025
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {[
            {
              title: 'Acceptance of Terms',
              body: 'By accessing or using WaveRow, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.',
            },
            {
              title: 'Eligibility',
              body: 'WaveRow is intended for students, subletters, and landlords associated with Tulane University. Student accounts require a valid @tulane.edu email address.',
            },
            {
              title: 'Listings and Content',
              body: 'You are solely responsible for the accuracy of any listing or content you post. WaveRow does not verify listing details and is not liable for inaccuracies. Fraudulent or misleading listings will result in account termination.',
            },
            {
              title: 'No Brokerage Relationship',
              body: 'WaveRow is a marketplace platform only. We are not a licensed real estate broker or agent. We do not represent either party in any housing transaction. All agreements are made directly between users.',
            },
            {
              title: 'Prohibited Conduct',
              body: 'You may not use WaveRow to post illegal listings, harass other users, scrape content, or circumvent any security measures. Violations may result in immediate account suspension.',
            },
            {
              title: 'Limitation of Liability',
              body: 'WaveRow is provided "as is" without warranties of any kind. To the fullest extent permitted by law, WaveRow is not liable for any damages arising from your use of the platform or any housing arrangement made through it.',
            },
            {
              title: 'Changes to Terms',
              body: 'We may update these terms at any time. Continued use of WaveRow after changes are posted constitutes acceptance of the revised terms.',
            },
            {
              title: 'Contact',
              body: 'For questions about these terms, contact us at legal@waverow.com.',
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
