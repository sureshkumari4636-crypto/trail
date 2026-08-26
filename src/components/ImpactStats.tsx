import React from 'react';
import {
  X,
  HeartPulse,
  TrendingUp,
  MapPin,
  Users,
  ShieldCheck,
  Award,
  Zap,
  Building,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ImpactStatsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImpactStats: React.FC<ImpactStatsProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-theme-card text-theme-primary w-full max-w-4xl rounded-3xl shadow-2xl border border-theme overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">
                Rural India Diabetic Retinopathy Impact Metrics
              </h3>
              <p className="text-xs text-rose-200">
                Preventing Preventable Blindness in 77+ Million Diabetic Patients across Tier 2, 3 & Rural India
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs text-theme-primary">
          {/* Key Impact Stats Numbers */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-theme-subtle p-4 rounded-2xl border border-theme">
              <span className="text-2xl font-black text-rose-500 block">77.2 Million</span>
              <span className="text-theme-muted font-bold text-[11px] block mt-1">
                Diabetic Individuals in India (2nd globally)
              </span>
            </div>

            <div className="bg-theme-subtle p-4 rounded-2xl border border-theme">
              <span className="text-2xl font-black text-blue-500 block">1 : 100,000</span>
              <span className="text-theme-muted font-bold text-[11px] block mt-1">
                Ophthalmologist to Rural Citizen Ratio
              </span>
            </div>

            <div className="bg-theme-subtle p-4 rounded-2xl border border-theme">
              <span className="text-2xl font-black text-emerald-500 block">&lt; 850 ms</span>
              <span className="text-theme-muted font-bold text-[11px] block mt-1">
                Edge AI Inference Time on Low-Cost Tablets
              </span>
            </div>

            <div className="bg-theme-subtle p-4 rounded-2xl border border-theme">
              <span className="text-2xl font-black text-amber-500 block">₹ 0 / Cloud</span>
              <span className="text-theme-muted font-bold text-[11px] block mt-1">
                Zero Cloud Dependence (100% Offline Capable)
              </span>
            </div>
          </div>

          {/* Clinical Mission Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-theme-subtle p-5 rounded-2xl border border-theme space-y-2">
              <h4 className="font-extrabold text-sm text-theme-primary flex items-center gap-2">
                <Users className="w-4 h-4 text-theme-primary-accent" />
                ASHA & ANM Worker Empowerment
              </h4>
              <p className="text-theme-secondary leading-relaxed text-xs">
                Empowers 1,000,000+ ASHA workers with low-cost smartphone fundus attachments (e.g. Remidio, 3nethra) to conduct village doorstep screenings. Eliminates traveling 40–80 km to district headquarters for routine annual checkups.
              </p>
            </div>

            <div className="bg-theme-subtle p-5 rounded-2xl border border-theme space-y-2">
              <h4 className="font-extrabold text-sm text-theme-primary flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                Early Referral & Sight Preservation
              </h4>
              <p className="text-theme-secondary leading-relaxed text-xs">
                Diabetic Retinopathy is completely asymptomatic in Stages 1 & 2. By detecting microvascular lesions before macular damage occurs, laser photocoagulation or anti-VEGF therapy can prevent 95% of severe vision loss cases.
              </p>
            </div>
          </div>

          {/* National Integration Ecosystem */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-extrabold text-sm text-blue-300 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              National Health Mission (NHM) & Ayushman Bharat Alignment
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Designed to connect directly to the <strong>Ayushman Bharat Digital Mission (ABDM)</strong> using 14-digit ABHA IDs. Triage reports and Grad-CAM explainability slips can be automatically attached to electronic health records (EHR) for specialist tele-consultations at District Hospital Hubs.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-theme-subtle px-6 py-3.5 border-t border-theme flex items-center justify-between">
          <span className="text-xs text-theme-muted">
            SIH Problem Statement: AI-based screening & triage for Diabetic Retinopathy
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-theme-primary-btn text-white font-bold text-xs shadow-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
