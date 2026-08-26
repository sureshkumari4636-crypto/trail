import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  MapPin,
  Clock,
  ArrowUpDown,
  Stethoscope,
  Sparkles,
  Cloud,
  FolderSync,
} from 'lucide-react';
import { PatientScreeningRecord } from '../types/screening';
import { useTheme } from '../context/ThemeContext';
import { useGoogleAuth } from '../context/GoogleAuthContext';

interface PatientQueueProps {
  records: PatientScreeningRecord[];
  onSelectRecord: (record: PatientScreeningRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  language: 'en' | 'hi';
  onOpenGoogleDrive?: () => void;
}

export const PatientQueue: React.FC<PatientQueueProps> = ({
  records,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
  language,
  onOpenGoogleDrive,
}) => {
  const { isDark } = useTheme();
  const { isAuthenticated } = useGoogleAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');

  // Filter logic
  const filteredRecords = records.filter((rec) => {
    const matchesSearch =
      rec.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.abhaId && rec.abhaId.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStage === 'all') return true;
    if (filterStage === 'referable') return rec.prediction.isReferable;
    if (filterStage === 'normal') return rec.prediction.grade === 0;
    if (filterStage === 'mild') return rec.prediction.grade === 1;
    if (filterStage === 'moderate') return rec.prediction.grade === 2;
    if (filterStage === 'severe') return rec.prediction.grade === 3;
    if (filterStage === 'pdr') return rec.prediction.grade === 4;
    return true;
  });

  // Calculate quick stats
  const totalCount = records.length;
  const normalCount = records.filter((r) => r.prediction.grade === 0).length;
  const referableCount = records.filter((r) => r.prediction.isReferable).length;
  const urgentCount = records.filter((r) => r.prediction.grade >= 3).length;

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = [
      'Patient ID',
      'Name',
      'Age',
      'Gender',
      'ABHA ID',
      'Village',
      'Examined Eye',
      'DR Grade',
      'Stage Name',
      'Confidence (%)',
      'Is Referable',
      'Referral Recommendation',
      'Screening Date',
    ];

    const rows = records.map((r) => [
      r.id,
      `"${r.patientName}"`,
      r.age,
      r.gender,
      r.abhaId || '',
      `"${r.village}"`,
      r.eye,
      r.prediction.grade,
      `"${r.prediction.stageName}"`,
      (r.prediction.confidence * 100).toFixed(1),
      r.prediction.isReferable ? 'Yes' : 'No',
      `"${r.prediction.referral}"`,
      r.screeningTimestamp,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DR_Camp_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Camp Header Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-theme-card p-5 rounded-3xl border border-theme shadow-xs">
          <div className="text-[11px] font-bold text-theme-muted uppercase tracking-wider">
            Total Patients Screened
          </div>
          <div className="text-2xl sm:text-3xl font-black text-theme-primary mt-1">{totalCount}</div>
          <div className="text-[11px] text-theme-muted mt-0.5">Rural PHC Camp Log</div>
        </div>

        <div className="bg-theme-card p-5 rounded-3xl border border-theme shadow-xs">
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Normal (Grade 0)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{normalCount}</div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">
            {totalCount > 0 ? `${Math.round((normalCount / totalCount) * 100)}% of camp total` : '0%'}
          </div>
        </div>

        <div className="bg-theme-card p-5 rounded-3xl border border-theme shadow-xs">
          <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Referable DR (Grade 2-4)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">{referableCount}</div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Referred to CHC / Eye Hospital</div>
        </div>

        <div className="bg-theme-card p-5 rounded-3xl border border-theme shadow-xs">
          <div className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Urgent / PDR (Grade 3-4)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 mt-1">{urgentCount}</div>
          <div className="text-[11px] text-rose-600/80 mt-0.5">Immediate Vitreoretinal care</div>
        </div>
      </div>

      {/* Register Controls & Table */}
      <div className="bg-theme-card rounded-3xl border border-theme p-5 sm:p-6 shadow-xs space-y-4 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-theme-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-theme-primary-accent" />
              {language === 'en' ? 'Screening Camp Patient Register' : 'ग्रामीण स्वास्थ्य शिविर मरीज रजिस्टर'}
            </h3>
            <p className="text-xs text-theme-muted">
              {language === 'en'
                ? 'Offline-cached patient screenings with Grad-CAM snapshots & referral records'
                : 'शिविर में जांची गई सभी आंखों का विवरण'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
            {onOpenGoogleDrive && (
              <button
                onClick={onOpenGoogleDrive}
                id="queue-google-drive-sync-btn"
                className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Backup camp register to Google Drive or restore previous screening sessions"
              >
                <Cloud className="w-3.5 h-3.5 text-blue-500" />
                <span>Drive Backup & Restore</span>
                {isAuthenticated && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                )}
              </button>
            )}

            <button
              onClick={exportCSV}
              disabled={records.length === 0}
              className="px-3.5 py-2 rounded-xl bg-theme-subtle hover:bg-theme-card disabled:opacity-50 text-theme-primary border border-theme text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Register</span>
            </button>

            {records.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3.5 py-2 rounded-xl hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Camp Log</span>
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-theme-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by patient name, village, or ABHA ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-theme focus:outline-hidden focus:border-blue-500 bg-theme-subtle text-theme-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-theme-muted" />
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-theme focus:outline-hidden focus:border-blue-500 bg-theme-subtle text-theme-primary font-bold w-full sm:w-auto cursor-pointer transition-colors"
            >
              <option value="all">All Stages ({totalCount})</option>
              <option value="referable">Referable Only ({referableCount})</option>
              <option value="normal">Normal (Grade 0)</option>
              <option value="mild">Mild NPDR (Grade 1)</option>
              <option value="moderate">Moderate NPDR (Grade 2)</option>
              <option value="severe">Severe NPDR (Grade 3)</option>
              <option value="pdr">Proliferative PDR (Grade 4)</option>
            </select>
          </div>
        </div>

        {/* Table / Cards List */}
        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center border-2 border-dashed border-theme rounded-2xl bg-theme-subtle/40 space-y-2">
            <Stethoscope className="w-10 h-10 text-theme-muted mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-theme-primary">No screening records in this camp view</h4>
            <p className="text-xs text-theme-muted max-w-sm mx-auto">
              Run an AI screening from the Screening Center tab or select a demo sample to populate the camp register.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-theme rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-theme-subtle text-theme-muted font-bold border-b border-theme">
                <tr>
                  <th className="px-4 py-3">Patient Details</th>
                  <th className="px-4 py-3">Eye & Duration</th>
                  <th className="px-4 py-3">AI Stage & Grade</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Referral Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {filteredRecords.map((rec) => {
                  let badgeBg = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                  if (rec.prediction.grade === 1) badgeBg = 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30';
                  if (rec.prediction.grade === 2) badgeBg = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
                  if (rec.prediction.grade === 3) badgeBg = 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
                  if (rec.prediction.grade === 4) badgeBg = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30';

                  return (
                    <tr key={rec.id} className="hover:bg-theme-subtle/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-theme-primary">{rec.patientName}</div>
                        <div className="text-[11px] text-theme-muted flex items-center gap-1.5 mt-0.5">
                          <span>{rec.age}y / {rec.gender}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{rec.village}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-semibold text-theme-primary">{rec.eye}</div>
                        <div className="text-[11px] text-theme-muted font-mono">
                          DM: {rec.diabetesDurationYears} yrs
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${badgeBg}`}>
                          Grade {rec.prediction.grade}: {rec.prediction.stageName}
                        </span>
                      </td>

                      <td className="px-4 py-3 font-mono font-bold text-theme-primary">
                        {(rec.prediction.confidence * 100).toFixed(1)}%
                      </td>

                      <td className="px-4 py-3">
                        {rec.prediction.isReferable ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/15 px-2.5 py-0.5 rounded-lg border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" />
                            Referable ({rec.prediction.urgencyDays})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-lg border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Non-Referable (Routine)
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onSelectRecord(rec)}
                            className="px-3 py-1 rounded-xl bg-theme-primary-subtle text-theme-primary-accent hover:opacity-80 font-bold text-[11px] transition-all border border-theme cursor-pointer"
                          >
                            View XAI
                          </button>
                          <button
                            onClick={() => onDeleteRecord(rec.id)}
                            className="p-1 rounded-lg text-theme-muted hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
