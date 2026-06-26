import { useEffect } from 'react';
import { Wind, Moon, Flame, Heart, Activity, Brain, Info } from 'lucide-react';

export function EducationSection() {
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const pillarsList = [
    { 
      icon: <Wind size={20} />, 
      num: '01', 
      sanskrit: 'Puraka', 
      name: 'Inhalation', 
      text: 'Drawing oxygen and prana into the body. Deep inhalation triggers thoracic stretch receptors, expanding lung capacity and oxygenating red blood cells.' 
    },
    { 
      icon: <Activity size={20} />, 
      num: '02', 
      sanskrit: 'Antar Kumbhaka', 
      name: 'Inner Hold', 
      text: "Retaining air inside full lungs. Holding creates partial pressures that maximize oxygen transfer while training resilience in the brain's stress centers." 
    },
    { 
      icon: <Moon size={20} />, 
      num: '03', 
      sanskrit: 'Rechaka', 
      name: 'Exhalation', 
      text: 'Releasing carbon dioxide and stagnant energy. A slow, extended exhalation stimulates the vagus nerve, signaling the heart to slow down.' 
    },
    { 
      icon: <Flame size={20} />, 
      num: '04', 
      sanskrit: 'Bahya Kumbhaka', 
      name: 'Outer Hold', 
      text: "Suspending breath on empty lungs. This trains CO2 tolerance in the brain stem, lowering chronic anxiety thresholds and building somatic stamina." 
    },
  ];

  const benefitsList = [
    { 
      icon: <Heart size={18} />, 
      cls: 'blue', 
      title: 'Vagal Tone & Heart Health', 
      text: 'Extending exhalations activates the parasympathetic vagus nerve, resulting in lower resting heart rates and reduced vascular pressure.' 
    },
    { 
      icon: <Activity size={18} />, 
      cls: 'teal', 
      title: 'HRV Biofeedback', 
      text: 'Coherent breathing patterns synchronize cardiac oscillations, optimizing Heart Rate Variability — the primary marker of nervous system flexibility.' 
    },
    { 
      icon: <Brain size={18} />, 
      cls: 'purple', 
      title: 'Cortisol Reduction', 
      text: 'Slow, structured breathing downregulates the sympathetic stress response, curbing adrenaline secretion and stopping racing thoughts.' 
    },
    { 
      icon: <Info size={18} />, 
      cls: 'orange', 
      title: 'Nitric Oxide Boost', 
      text: 'Nasal breathing and humming patterns generate high quantities of nitric oxide, expanding blood vessels and improving pulmonary absorption.' 
    },
  ];

  return (
    <div className="edu">
      {/* 1. Science Section (Four Pillars) */}
      <section className="edu-section reveal" id="science">
        <div className="edu-header">
          <h2 className="edu-title">The Science of Breath</h2>
          <p className="edu-desc">
            Pranayama is the ancient yogic practice of controlling the breath. Modern respiratory biology 
            confirms that altering breathing ratios directly controls your autonomic nervous system.
          </p>
        </div>
        
        <div className="pillars">
          {pillarsList.map((p) => (
            <div key={p.num} className="pillar reveal">
              <div className="pillar-head">
                <div className="pillar-icon">{p.icon}</div>
                <span className="pillar-num">{p.num}</span>
              </div>
              <div>
                <span className="pillar-label">{p.sanskrit}</span>
                <div className="pillar-name">{p.name}</div>
              </div>
              <p className="pillar-body">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="edu-divider reveal"></div>

      {/* 2. Benefits Section (Research Proofs) */}
      <section className="edu-section reveal" id="about">
        <div className="edu-header">
          <h2 className="edu-title">Why Practice Breathwork?</h2>
          <p className="edu-desc">
            Scientific research confirms that dedicated breathing routines provide immediate and 
            cumulative benefits to brain chemistry, stress reduction, and vascular health.
          </p>
        </div>
        
        <div className="benefits">
          {benefitsList.map((b, i) => (
            <div key={i} className="benefit reveal">
              <div className={`benefit-icon ${b.cls}`}>{b.icon}</div>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-body">{b.text}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer is embedded for simplicity */}
      <footer className="footer reveal">
        <p>© 2026 Prana. Breathe consciously, live dynamically.</p>
        <p className="sub">Premium breathwork software for physical, cognitive, and somatic health.</p>
      </footer>
    </div>
  );
}
