import { useMemo, useState } from 'react';

const MATERIALS = [
  { id: 'PLA', label: 'PLA', multiplier: 1 },
  { id: 'PETG', label: 'PETG', multiplier: 1.18 },
  { id: 'ABS', label: 'ABS', multiplier: 1.25 },
  { id: 'TPU', label: 'TPU', multiplier: 1.4 },
  { id: 'ASA', label: 'ASA', multiplier: 1.3 },
  { id: 'Carbon Fiber', label: 'Carbon Fiber', multiplier: 1.95 },
];

const COLORS = [
  { name: 'Deep Black', value: '#0A0A0A' },
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Premium Gold', value: '#C9A56A' },
  { name: 'Graphite Grey', value: '#8A8577' },
  { name: 'Rust', value: '#7C2D12' },
];

export default function ConfiguratorReplica() {
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [fileName, setFileName] = useState('');
  const [isFileDragged, setIsFileDragged] = useState(false);

  const { price, time } = useMemo(() => {
    const basePrice = 1240;
    const baseTime = 4.67;
    const price = Math.ceil(basePrice * selectedMaterial.multiplier);
    const time = `${Math.round(baseTime * selectedMaterial.multiplier * 10) / 10}h 0m`;
    return { price, time };
  }, [selectedMaterial]);

  return (
    <section id="configurator" className="section-pad bg-[#0a090b] text-[#f4f4f4]">
      <div className="do-container">
        <div className="section-head">
          <div>
            <div className="eyebrow">CUSTOM PRINTING</div>
            <h2 className="section-title">Upload a file.<br />Watch it become <em>real</em>.</h2>
          </div>
          <p className="section-desc">STL, OBJ, 3MF and STEP supported. Pricing and print time update instantly as you configure.</p>
        </div>

        <div className="config-wrap">
          <div className="config-visual">
            <div className="config-visual-tag">LIVE PREVIEW — 01/01</div>
            <canvas className="config-canvas" />
            <div className="config-price-float">
              <div>
                <div className="label">Estimate</div>
                <div className="value">₹{price}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="label">Print Time</div>
                <div className="value" style={{ fontSize: '16px', color: '#fff' }}>{time}</div>
              </div>
            </div>
          </div>

          <div className="config-panel">
            <div>
              <div className="config-step-label">01 — Upload Design</div>
              <label
                htmlFor="config-upload"
                className={`upload-zone${isFileDragged ? ' drag' : ''}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 16V4M12 4l-5 5M12 4l5 5" />
                  <path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                </svg>
                <p>Drop your file here, or click to browse</p>
                <span>.STL · .OBJ · .3MF · .STEP — up to 200MB</span>
                <span className="upload-filename">{fileName}</span>
                <input
                  id="config-upload"
                  type="file"
                  accept=".stl,.obj,.3mf,.step"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setFileName(file.name);
                  }}
                  onDragEnter={() => setIsFileDragged(true)}
                  onDragLeave={() => setIsFileDragged(false)}
                />
              </label>
            </div>

            <div>
              <div className="config-step-label">02 — Material</div>
              <div className="chip-row">
                {MATERIALS.map((material) => (
                  <button
                    key={material.id}
                    type="button"
                    className={`chip${material.id === selectedMaterial.id ? ' active' : ''}`}
                    onClick={() => setSelectedMaterial(material)}
                  >
                    {material.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="config-step-label">03 — Color</div>
              <div className="swatch-row">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    className={`swatch${color.value === selectedColor.value ? ' active' : ''}`}
                    style={{ backgroundColor: color.value, borderColor: color.value === '#FFFFFF' ? '#d1d1d1' : 'transparent' }}
                    onClick={() => setSelectedColor(color)}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="config-est">
              <div className="est-block">
                <div className="label">Instant Estimate</div>
                <div className="val gold">₹{price}</div>
              </div>
              <div className="est-block">
                <div className="label">Est. Print Time</div>
                <div className="val">{time}</div>
              </div>
            </div>

            <button type="button" className="btn btn-gold config-add-btn">
              Add Custom Print to Cart
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
