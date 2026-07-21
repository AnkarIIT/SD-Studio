const STEPS = [
  {
    icon: '📤',
    title: '01-Upload STL',
    description: 'Upload your STL file or share your idea.',
  },
  {
    icon: '💰',
    title: '02-Get Quote',
    description: 'Receive an instant estimate and final confirmation.',
  },
  {
    icon: '🖨️',
    title: '03-We Print',
    description: 'Your design is printed with precision and care.',
  },
  {
    icon: '🚚',
    title: '04-Delivered',
    description: 'Fast and secure delivery across India.',
  },
];

export default function HowItWorksReplica() {
  return (
    <section className="py-20 px-6 sm:px-12 max-w-7xl mx-auto text-center bg-[#FCFBF7] dark:bg-transparent transition-colors duration-300">
      <div className="mb-16">
        <h2 className="text-4xl font-bold uppercase tracking-[0.22em] mb-4 text-[#925FE2] dark:text-[#b995ff] font-retro">How It Works</h2>
        <p className="text-zinc-600 dark:text-[#cfcfcf] max-w-2xl mx-auto">Upload your design, get a quote, and receive your custom print anywhere in India.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.title} className="rounded-[28px] border-2 border-black dark:border-[#b995ff40] bg-[#FCFBF7] dark:bg-[#0a0a0a]/90 p-8 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[0_20px_70px_rgba(0,0,0,0.25)] transition hover:-translate-y-1">
            <div className="text-4xl mb-5">{step.icon}</div>
            <h3 className="text-xl font-semibold text-[#925FE2] dark:text-[#b995ff] mb-3">{step.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-[#e8e3d1] leading-7">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
