import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  Award,
  Eye,
  AlertTriangle,
  QrCode,
  Calendar,
  Building,
  CheckCircle2,
  Cloud,
} from 'lucide-react';
import { DRClassificationResult, PatientInfo } from '../types/dr';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { uploadJsonToDrive, uploadImageToDrive } from '../services/googleDriveService';

interface ClinicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  result: DRClassificationResult;
  patientInfo: PatientInfo;
}

export const ClinicalReportModal: React.FC<ClinicalReportModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  result,
  patientInfo,
}) => {
  const { lang } = useLanguage();
  const { isDark } = useTheme();
  const { requireAuth } = useGoogleAuth();
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToDrive = async () => {
    try {
      setIsUploadingDrive(true);
      await requireAuth();

      const timestamp = new Date().toISOString().slice(0, 10);
      const safeName = patientInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
      const jsonFileName = `DR_Official_Slip_${safeName}_Grade${result.stage}_${timestamp}.json`;

      const slipPayload = {
        slipNumber: patientInfo.id,
        patient: patientInfo,
        screeningResult: result,
        teleConsultationDate: patientInfo.screenDate,
        standard: 'NPCBVI / SIH AIIMS Tele-Ophthalmology Standard',
      };

      await uploadJsonToDrive(
        jsonFileName,
        slipPayload,
        `Official clinical referral slip for ${patientInfo.name}`
      );

      if (imageUrl) {
        await uploadImageToDrive(
          `Fundus_Photo_${safeName}_${timestamp}.jpg`,
          imageUrl
        );
      }

      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      alert(err?.message || 'Failed to upload to Google Drive.');
    } finally {
      setIsUploadingDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-theme-card text-theme-primary w-full max-w-4xl rounded-3xl shadow-2xl border border-theme overflow-hidden flex flex-col max-h-[94vh] transition-colors duration-200">
        {/* Top Modal Controls (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">Official Tele-Screening Slip & Clinical Referral Slip</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveToDrive}
              disabled={isUploadingDrive}
              id="modal-drive-btn"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              {isUploadingDrive ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving to Drive...</span>
                </>
              ) : uploadSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved to Drive!</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-blue-400" />
                  <span>Save to Drive</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              id="modal-print-btn"
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs bg-white text-slate-900 print-only">
          {/* Header of Report */}
          <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-xl">
                NR
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-slate-900 uppercase">
                  NetraRakshak AI — Tele-Ophthalmology Screening Report
                </h2>
                <p className="text-[11px] text-slate-600">
                  National Programme for Control of Blindness & Visual Impairment (NPCBVI) • AIIMS / SIH Framework
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-mono font-bold text-slate-700">
                SLIP #: {patientInfo.id}
              </div>
              <div className="text-[10px] text-slate-500">Date: {patientInfo.screenDate}</div>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{patientInfo.name}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Gender</span>
              <span className="font-bold text-slate-900">{patientInfo.age} yrs / {patientInfo.gender}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Examined Eye</span>
              <span className="font-bold text-blue-700">{patientInfo.eyeTested}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">ASHA Officer</span>
              <span className="font-bold text-slate-900">{patientInfo.ashaWorkerName}</span>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Screening Location (PHC)</span>
              <span className="font-semibold text-slate-800">{patientInfo.villageOrPHC}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Fasting Sugar</span>
              <span className="font-semibold text-slate-800">{patientInfo.bloodSugarFasting || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Diabetes Duration</span>
              <span className="font-semibold text-slate-800">{patientInfo.diabetesDurationYears || 'N/A'}</span>
            </div>
          </div>

          {/* Primary AI Diagnosis Outcome */}
          <div className="border-2 border-slate-900 rounded-2xl p-5 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Automated ICDR Classification Outcome
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  {result.stageName} (Grade {result.stage})
                </h3>
                <p className="text-xs font-bold text-blue-700">{result.stageHindi}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Model Confidence</span>
                <span className="text-lg font-black font-mono text-slate-900">{result.confidence}%</span>
                <div className="text-[10px] font-bold text-rose-600 mt-0.5 uppercase">
                  Risk Level: {result.riskLevel}
                </div>
              </div>
            </div>

            {/* Referral Recommendation Action */}
            <div className="mt-4 p-3.5 bg-slate-100 rounded-xl border border-slate-300">
              <div className="text-[10px] font-bold uppercase text-slate-600 mb-0.5">
                Recommended Triage & Specialist Referral Timeframe:
              </div>
              <p className="font-black text-slate-900 text-sm">{result.referral.timeframe}</p>
              <p className="text-xs text-slate-700 mt-1">{result.referral.actionRequired}</p>
            </div>
          </div>

          {/* Lesions & Quality findings */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider">
                Pathological Findings (AI Layer)
              </h4>
              <ul className="space-y-1 text-slate-700">
                {result.lesionsDetected.map((l, i) => (
                  <li key={i} className="flex items-center justify-between text-xs">
                    <span>• {l.name}</span>
                    <span className="font-bold text-slate-900">{l.presence}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 mb-2 text-xs uppercase tracking-wider">
                XAI & Quality Assurance
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed mb-2">
                <strong>Clarity: </strong>{result.qualityAssessment.clarityScore}/100 ({result.qualityAssessment.blurLevel})
              </p>
              <p className="text-[11px] text-slate-600 leading-snug">
                <strong>Grad-CAM Focus: </strong>{result.xaiExplanation.primaryFocusRegion}
              </p>
            </div>
          </div>

          {/* Signatures & Tele-Consultation Box */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
              <span className="text-slate-600 font-medium">ASHA / Field Operator Signature</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
              <span className="text-slate-600 font-medium">PHC Medical Officer / MO Stamp</span>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-400 mb-1"></div>
              <span className="text-slate-600 font-medium">Ophthalmologist Referral Sign</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-theme-subtle px-6 py-3.5 border-t border-theme flex items-center justify-between no-print">
          <span className="text-xs text-theme-muted">
            Valid Indian Standard Tele-Ophthalmology Referral Slip
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-theme-card hover:bg-theme-card-subtle text-theme-primary font-bold text-xs border border-theme cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
