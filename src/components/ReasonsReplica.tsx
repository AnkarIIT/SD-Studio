export default function ReasonsReplica() {
  const cards = [
    {
      icon: '⚡',
      title: 'Custom Made',
      description: 'Every product is printed specifically for your order.',
    },
    {
      icon: '🎯',
      title: 'Precision Printing',
      description: 'High-quality 3D printing with clean details and accuracy.',
    },
    {
      icon: '🚚',
      title: 'Secure Shipping',
      description: 'Secure shipping to customers across India.',
    },
    {
      icon: '💬',
      title: 'Dedicated Support',
      description: 'Need changes or a custom design? We’re here to help.',
    },
  ];

  return (
    <section className="py-24 px-6 bg-[#FCFBF7] dark:bg-[#050205] text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto text-center mb-12">
        <h2 className="text-4xl font-bold uppercase tracking-[0.18em] text-[#925FE2] dark:text-[#b995ff] font-retro mb-4">Why Customers Choose 3D BY SD</h2>
        <p className="max-w-2xl mx-auto text-zinc-600 dark:text-[#cfcfcf]">Quality, precision, and custom solutions built around your ideas.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.title} className="rounded-[28px] border-2 border-black dark:border-[#b995ff40] bg-[#FCFBF7] dark:bg-[#0c0c0c]/85 p-8 text-left transition hover:-translate-y-1 hover:border-[#925FE2] dark:hover:border-[#b995ff] shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-none">
            <div className="text-4xl mb-4">{card.icon}</div>
            <h3 className="text-xl font-semibold text-[#925FE2] dark:text-[#b995ff] mb-3 font-retro">{card.title}</h3>
            <p className="text-sm text-zinc-600 dark:text-[#e7e4d5] leading-7">{card.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
