const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/layerbound', handle: '@layerbound' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/layerbound', handle: '/company/layerbound' },
  { label: 'WhatsApp', href: 'https://wa.me/919999999999', handle: '+91 99999 99999' },
];

export default function SocialReplica() {
  return (
    <section className="py-20 bg-[#11031a] text-[#f7f0ff]">
      <div className="do-container">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <p className="do-eyebrow">Stay connected</p>
          <h2 className="do-section-title">Follow us for new releases and print inspiration</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {SOCIAL_LINKS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className="rounded-3xl border border-[#7d53ff]/20 bg-[#180a2f] p-6 text-left transition hover:border-[#a470ff] hover:bg-[#240c42]/90">
              <p className="text-sm uppercase tracking-[0.3em] text-[#d7c4ff]">{link.label}</p>
              <p className="mt-4 font-semibold text-lg text-white">{link.handle}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
