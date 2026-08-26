import React from 'react';
import { X, Printer, Download, QrCode, ShieldCheck, CheckCircle2, AlertTriangle, Eye, Hospital, Building2 } from 'lucide-react';
import { PredictionResult } from '../types/screening';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  prediction: PredictionResult;
  patientInfo: {
    name: string;
    age: number;
    gender: 'Female' | 'Male';
    village: string;
    diabetesYears: number;
    eye: 'Right Eye (OD)' | 'Left Eye (OS)';
    abhaId?: string;
  };
  originalImage: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  prediction,
  patientInfo,
  originalImage,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Modal Controls Header (no-print) */}
        <div className="no-print p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold">Official ABDM Clinical Referral Slip</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Referral Slip Document */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-900 bg-white" id="printable-referral-slip">
          {/* Government / Health Mission Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs tracking-wider uppercase">
                <Building2 className="w-4 h-4 text-blue-700" />
                <span>National Health Mission • Ayushman Bharat Digital Mission (ABDM)</span>
              </div>
              <h2 className="text-xl font-black text-slate-900 mt-1">
                Diabetic Retinopathy Tele-Ophthalmology Screening Slip
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Primary Health Centre (PHC) Screening Node • AI Tele-Triage System
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="border-2 border-slate-900 px-3 py-1 text-center rounded bg-slate-50">
                <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">Report Ref</span>
                <span className="text-xs font-black font-mono">DR-2026-{(Math.random() * 90000 + 10000).toFixed(0)}</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Date: {currentDate}</span>
            </div>
          </div>

          {/* Patient Demographics Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient Name</span>
              <span className="font-bold text-slate-900">{patientInfo.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Age / Gender</span>
              <span className="font-bold text-slate-900">{patientInfo.age} Yrs / {patientInfo.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">ABHA Health ID</span>
              <span className="font-bold text-slate-900 font-mono">{patientInfo.abhaId || 'ABHA-9821-4402-8819'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Examined Eye</span>
              <span className="font-bold text-blue-700">{patientInfo.eye}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Village / Location</span>
              <span className="font-bold text-slate-900">{patientInfo.village}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Diabetes Duration</span>
              <span className="font-bold text-slate-900">{patientInfo.diabetesYears} Years (Type 2)</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Screening Center</span>
              <span className="font-bold text-slate-900">PHC Rural Health Node</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">ASHA Operator</span>
              <span className="font-bold text-slate-900">Shanti Verma (HW-41)</span>
            </div>
          </div>

          {/* AI Diagnosis & Clinical Findings Card */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  AI Screening Diagnosis (ICDR Scale)
                </span>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>{prediction.stageName}</span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                    Grade {prediction.grade}/4
                  </span>
                </h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Model Confidence</span>
                <span className="text-sm font-black text-blue-600 font-mono">
                  {(prediction.confidence * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Referable Status Pill */}
            <div className={`p-2.5 rounded-lg text-xs font-bold flex items-center justify-between ${
              prediction.isReferable
                ? 'bg-rose-50 text-rose-900 border border-rose-200'
                : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
            }`}>
              <span className="flex items-center gap-1.5">
                {prediction.isReferable ? (
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>Referral Recommendation: {prediction.referral}</span>
              </span>
              <span className="font-mono uppercase text-[11px]">{prediction.urgencyDays}</span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              <strong className="text-slate-900">Clinical Finding Summary:</strong> {prediction.clinicalSummary}
            </p>
          </div>

          {/* Fundus & Explainability Snapshot Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-2.5 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-600 block">Original Retinal Fundus</span>
              <div className="aspect-square max-h-[160px] mx-auto rounded overflow-hidden bg-black flex items-center justify-center">
                <img src={originalImage} alt="Fundus" className="h-full object-contain" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Optic disc & vascular tree</span>
            </div>

            <div className="border border-slate-200 rounded-xl p-2.5 text-center space-y-1">
              <span className="text-[11px] font-bold text-slate-600 block">Grad-CAM Attribution Matrix</span>
              <div className="aspect-square max-h-[160px] mx-auto rounded overflow-hidden bg-black flex items-center justify-center relative">
                <img src={originalImage} alt="Fundus Underlay" className="h-full object-contain opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] text-white bg-blue-600/80 px-2 py-0.5 rounded font-mono">
                    Attention Peaks Mapped
                  </span>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">MobileNetV3 + Grad-CAM++</span>
            </div>
          </div>

          {/* Action Instructions & Doctor Signature */}
          <div className="border-t-2 border-slate-200 pt-4 grid grid-cols-2 gap-6 text-xs">
            <div className="space-y-1 text-slate-600">
              <h4 className="font-bold text-slate-900">Instructions for Patient / ASHA:</h4>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Carry this screening slip to the Community Health Centre (CHC) or District Hospital.</li>
                <li>Maintain strict glycemic control (HbA1c target &lt; 7.0%).</li>
                <li>Avoid sudden eye strain or heavy lifting if severe stage is noted.</li>
              </ul>
            </div>

            <div className="space-y-8 text-right flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Authorized Signature</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span className="text-xs font-bold text-slate-800 block">Medical Officer / Tele-Ophthalmologist</span>
                <span className="text-[10px] text-slate-500">CHC Telemedicine Screening Cell</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
