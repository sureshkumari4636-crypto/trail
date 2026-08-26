import React from 'react';
import { BookOpen, Eye, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ClinicalGuideProps {
  language: 'en' | 'hi';
}

export const ClinicalGuide: React.FC<ClinicalGuideProps> = ({ language }) => {
  const { isDark } = useTheme();

  const stages = [
    {
      grade: 0,
      name: 'Stage 0: Normal Retina',
      hindiName: 'स्टेज 0: स्वस्थ रेटिना (कोई रोग नहीं)',
      findings: [
        'Clear optic nerve disc with sharp, well-defined boundaries.',
        'Macula is dark and even, with a bright foveal light reflex.',
        'Arterioles and venules maintain smooth, physiological 2:3 caliber ratio.',
        'No microaneurysms, hemorrhages, or exudates.',
      ],
      triage: 'Routine annual re-screening at Primary Health Centre (PHC).',
      xaiTip: 'Grad-CAM shows diffuse, low-intensity background attention with no focal hotspots.',
    },
    {
      grade: 1,
      name: 'Stage 1: Mild NPDR',
      hindiName: 'स्टेज 1: हल्का नॉन-प्रोलिफेरेटिव रेटिनोपैथी',
      findings: [
        'Presence of isolated microaneurysms only (< 5 tiny red dots).',
        'Capillary wall outpouching secondary to pericyte loss.',
        'Vision is completely intact with no visual symptoms yet.',
      ],
      triage: 'Schedule follow-up screening in 6-12 months. Advise strict glycemic control (HbA1c < 7%).',
      xaiTip: 'Grad-CAM highlights pinpoint hotspots directly over microaneurysms in the temporal arcade.',
    },
    {
      grade: 2,
      name: 'Stage 2: Moderate NPDR (Referable)',
      hindiName: 'स्टेज 2: मध्यम रेटिनोपैथी (रेफरल आवश्यक)',
      findings: [
        'Multiple microaneurysms and dot-blot hemorrhages across 1-2 quadrants.',
        'Hard lipid exudate rings (yellowish lipid deposits from leaking capillaries).',
        'Early risk of Diabetic Macular Edema (DME).',
      ],
      triage: 'REFER to Community Health Centre (CHC) or Ophthalmologist within 1-2 months.',
      xaiTip: 'Grad-CAM heavily activates over hard exudate clusters and deep blot hemorrhages.',
    },
    {
      grade: 3,
      name: 'Stage 3: Severe NPDR (High-Risk 4-2-1 Rule)',
      hindiName: 'स्टेज 3: गंभीर रेटिनोपैथी (उच्च जोखिम)',
      findings: [
        'Extensive intra-retinal blot hemorrhages in all 4 quadrants.',
        'Definite venous beading (sausage-like irregular veins) in 2+ quadrants.',
        'Cotton wool spots (fluffy white nerve fiber layer infarcts from capillary dropout).',
      ],
      triage: 'URGENT REFERRAL to District Eye Hospital within 2-4 weeks. Risk of proliferative conversion > 50%/year.',
      xaiTip: 'Grad-CAM exhibits intense multi-focal activation across ischemic quadrants and cotton-wool spots.',
    },
    {
      grade: 4,
      name: 'Stage 4: Proliferative DR (PDR - Emergency)',
      hindiName: 'स्टेज 4: प्रोलिफेरेटिव रेटिनोपैथी (आपातकालीन)',
      findings: [
        'Neovascularization at Disc (NVD) or Neovascularization Elsewhere (NVE).',
        'Preretinal / Sub-hyaloid hemorrhages (boat-shaped blood pools).',
        'Vitreous hemorrhage or fibrovascular tractional retinal detachment.',
      ],
      triage: 'EMERGENCY: Immediate referral to Tertiary Vitreoretinal Unit (within 48-72 hours) for Pan-Retinal Photocoagulation (PRP) or Anti-VEGF.',
      xaiTip: 'Grad-CAM triggers peak activation over fragile abnormal disc vessel fronds and preretinal blood.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-theme-card rounded-3xl border border-theme p-6 sm:p-7 shadow-xs space-y-2.5 transition-colors duration-200">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-theme-primary-subtle text-theme-primary-accent rounded-xl border border-theme">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-theme-primary tracking-tight">
              {language === 'en'
                ? 'ASHA & Rural Health Worker Clinical Reference Manual'
                : 'आशा एवं स्वास्थ्य कार्यकर्ता नैदानिक मार्गदर्शिका'}
            </h2>
            <span className="text-[11px] text-theme-muted font-bold">
              International Clinical Diabetic Retinopathy (ICDR) Disease Scale
            </span>
          </div>
        </div>
        <p className="text-xs text-theme-secondary leading-relaxed max-w-3xl">
          {language === 'en'
            ? 'Diabetic Retinopathy (DR) is a microvascular complication of diabetes leading to irreversible vision loss if untreated. Use this guide to understand ICDR disease stages and how to interpret explainable AI heatmaps.'
            : 'डायबिटिक रेटिनोपैथी आंख के परदे की नसों में शुगर के कारण होने वाली क्षति है। नीचे दिए गए 5 चरणों और एआई हीटमैप के संकेतों को समझकर मरीजों को सही समय पर रेफर करें।'}
        </p>
      </div>

      {/* Retinal Anatomy Guide */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            <span>1. Optic Disc (ऑप्टिक डिस्क)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The yellowish-orange oval where the optic nerve exits and central blood vessels emerge. Healthy cup-to-disc ratio is ~0.3. Watch out for abnormal fragile vessels (NVD) in Grade 4.
          </p>
        </div>

        <div className="space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            <span>2. Macula & Fovea (मैक्यूला)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The central dark region responsible for high-resolution 20/20 central vision and reading. Hard exudates or swelling here cause rapid sight degradation (Macular Edema).
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Eye className="w-4 h-4" />
            <span>3. Vascular Arcades (रक्त वाहिकाएं)</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Superior and inferior blood vessel branches nourishing the retina. Look for microaneurysms, blot hemorrhages, and venous beading along these arches.
          </p>
        </div>
      </div>

      {/* 5 Clinical Stages Breakdown Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-extrabold text-theme-primary flex items-center gap-2">
          <Layers className="w-4 h-4 text-theme-primary-accent" />
          <span>ICDR 5-Grade Staging & Explainable Heatmap Guide</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {stages.map((stage) => {
            let badgeBg = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
            if (stage.grade === 1) badgeBg = 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
            if (stage.grade === 2) badgeBg = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
            if (stage.grade === 3) badgeBg = 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
            if (stage.grade === 4) badgeBg = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';

            return (
              <div
                key={stage.grade}
                className="bg-theme-card rounded-3xl border border-theme p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className={`text-xs font-black px-3 py-1 rounded-xl border ${badgeBg}`}>
                      Grade {stage.grade}
                    </span>
                    <h4 className="text-sm sm:text-base font-extrabold text-theme-primary">{stage.name}</h4>
                    <span className="text-xs text-theme-muted font-bold">({stage.hindiName})</span>
                  </div>

                  <span className="text-xs font-bold font-mono text-theme-muted">
                    {stage.grade >= 2 ? '⚠️ Referable DR' : '✅ Non-Referable'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-theme-muted uppercase tracking-wider block">
                      Clinical Biomarkers:
                    </span>
                    <ul className="space-y-1.5">
                      {stage.findings.map((f, i) => (
                        <li key={i} className="text-xs text-theme-secondary flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-theme-primary-accent shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 bg-theme-subtle p-3.5 rounded-2xl border border-theme">
                    <div>
                      <span className="text-[10px] font-bold text-theme-muted uppercase block">
                        Action & Referral Protocol:
                      </span>
                      <p className="text-xs font-black text-theme-primary mt-0.5">{stage.triage}</p>
                    </div>

                    <div className="pt-2 border-t border-theme">
                      <span className="text-[10px] font-bold text-theme-primary-accent uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-theme-primary-accent" />
                        Grad-CAM Heatmap Interpretation:
                      </span>
                      <p className="text-[11px] text-theme-secondary mt-0.5 leading-relaxed">{stage.xaiTip}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
