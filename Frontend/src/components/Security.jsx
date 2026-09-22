const securityFeatures = [
  { icon: 'verified_user', label: 'FERPA & GDPR Compliant' },
  { icon: 'security', label: 'SOC-2 Type II Certified' },
  { icon: 'key', label: '256-bit AES Data Encryption' },
  { icon: 'vpn_lock', label: 'SAML SSO / Okta Integration' },
];

export default function Security() {
  return (
    <section className="py-24 bg-surface-container-low px-margin lg:px-margin-lg">
      <div className="max-w-7xl mx-auto">
        <div className="p-10 lg:p-14 rounded-3xl bg-surface-container-lowest shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-center">
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-label-xs font-bold w-fit">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Enterprise Grade Security</span>
              </div>
              <h2 className="font-headline-lg text-headline-lg text-primary">Your institution&apos;s data deserves serious protection.</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">EduSphere meets the highest global standards for student record privacy and cryptographic infrastructure. Built with end-to-end encryption and compliance-first architecture.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {securityFeatures.map((f) => (
                  <div key={f.label} className="flex items-center gap-2.5 text-body-sm font-medium text-primary">
                    <span className="material-symbols-outlined text-secondary text-[20px]">{f.icon}</span>
                    <span>{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-surface-container flex flex-col items-center justify-center relative p-6 text-center shadow-inner">
                <span className="material-symbols-outlined text-secondary text-[64px] animate-pulse">shield</span>
                <span className="font-headline-sm text-headline-sm text-primary font-bold mt-2">Zero-Trust</span>
                <span className="text-label-xs text-on-surface-variant">Continuous Audit Logs &amp; Backups</span>
                <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1.5 shadow-md">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
