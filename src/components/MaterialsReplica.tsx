const MATERIALS = [
  {
    name: 'PLA',
    description: 'Easy-printing, eco-friendly, and ideal for display models and decorative pieces.',
  },
  {
    name: 'PETG',
    description: 'Durable, low-shrinkage and perfect for functional parts that need chemical resistance.',
  },
  {
    name: 'ABS',
    description: 'Strong and heat-resistant, well suited for prototypes, fixtures, and engineering parts.',
  },
  {
    name: 'TPU',
    description: 'Flexible and impact-resistant for wearables, grips, and soft-touch components.',
  },
  {
    name: 'ASA',
    description: 'Weatherproof and UV-stable for outdoor fixtures and polished architectural details.',
  },
  {
    name: 'Carbon Fiber',
    description: 'Rigid, lightweight composites for premium strength and industrial applications.',
  },
];

export default function MaterialsReplica() {
  return (
    <section className="py-20 bg-[#100724] text-[#f4e9ff]">
      <div className="do-container">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="do-eyebrow">Materials</p>
          <h2 className="do-section-title">Print materials for every use-case</h2>
          <p className="mt-4 text-sm text-[#c9b8ff] leading-relaxed">
            From polished decorative objects to functional engineering parts, choose the right filament or composite for your custom 3D print.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MATERIALS.map((material) => (
            <div key={material.name} className="rounded-[1.75rem] border border-[#5e3ee0]/20 bg-[#160a2b] p-6 shadow-[0_24px_60px_rgba(91,53,202,0.12)]">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#bdaeff] mb-3">{material.name}</p>
              <p className="text-sm leading-relaxed text-[#d8c7ff]">{material.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
