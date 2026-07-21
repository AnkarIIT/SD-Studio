const STEPS = [
  {
    title: 'Upload your design',
    description: 'Send us your CAD file or model and tell us exactly how you want it finished.',
  },
  {
    title: 'Select size & material',
    description: 'We’ll help you pick the best filament, strength, and print orientation for your part.',
  },
  {
    title: 'Wait for quality review',
    description: 'Our team inspects the model, optimizes supports, and confirms printability before production.',
  },
  {
    title: 'Ship in 3–5 days',
    description: 'We print, finish, and deliver across India with tracking and priority support.',
  },
];

export default function ProcessReplica() {
  return (
    <section className="py-20 bg-[#0b0413] text-[#f7efff]">
      <div className="do-container">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="do-eyebrow">How it works</p>
          <h2 className="do-section-title">Custom 3D printing in four simple steps</h2>
          <p className="mt-4 text-sm text-[#cbb8ff] leading-relaxed">
            From upload to delivery, our workflow keeps your project moving fast with expert review and reliable shipping.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-[1.75rem] border border-[#7e5ee7]/20 bg-[#1a0a2d] p-8 shadow-[0_32px_64px_rgba(106,74,235,0.14)]">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7c51f1]/10 text-[#d8c7ff] font-semibold text-sm">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#c9b8ff]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
