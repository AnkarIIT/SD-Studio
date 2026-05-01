const ProcessSection = () => {
  const steps = [
    { num: "01", title: "CHOOSE PRODUCT", desc: "Select from our curated drops or request a custom design." },
    { num: "02", title: "CUSTOMIZE IT", desc: "Pick colors, add names, or integrate NFC tech. We make it yours." },
    { num: "03", title: "WE PRINT & SHIP", desc: "Hand-finished and delivered to your doorstep in premium packaging." },
  ];
  return (
    <section id="how" className="py-32 px-6 md:px-16 bg-gray-50">
      <div className="max-w-[1400px] mx-auto text-center mb-24">
        <span className="text-gray-500 font-bold text-sm tracking-widest uppercase mb-4 block">Process</span>
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900">Simple. Fast. <span className="text-gray-400 font-normal">Unique.</span></h2>
        <div className="grid md:grid-cols-3 gap-12 md:gap-24 relative mt-24">
          <div className="hidden md:block absolute top-12 left-0 w-full h-[1px] bg-gray-200 -z-10" />
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-8 group-hover:border-gray-900 transition-all duration-300">
                <span className="font-bold text-3xl text-gray-900">{step.num}</span>
              </div>
              <h3 className="text-xl mb-4 tracking-widest uppercase font-bold text-gray-900">{step.title}</h3>
              <p className="text-gray-500 text-sm font-normal leading-relaxed max-w-xs">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
