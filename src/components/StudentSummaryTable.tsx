import React, { useState, useMemo } from 'react';
import { StudentSession, StudentClass, VALID_CLASSES } from '../types';
import { Filter, Search, ArrowUpDown, RefreshCw, FileSpreadsheet, Award, CheckCircle, Clock } from 'lucide-react';

interface StudentSummaryTableProps {
  sessions: StudentSession[];
  onRefresh?: () => Promise<void>;
  title?: string;
  showExport?: boolean;
  onViewStudentDetail?: (session: StudentSession) => void;
  onResetStudent?: (studentId: string, fullName: string) => void;
  isAdmin?: boolean;
}

// Helper function to extract Vietnamese sort key: [Tên chính] + [Họ đệm]
export const getVietnameseSortKey = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0]?.toLowerCase() || '';
  const firstName = parts[parts.length - 1]; // Tên chính (An, Bình, Cúc, Dũng...)
  const familyAndMiddle = parts.slice(0, parts.length - 1).join(' '); // Họ và tên đệm
  return `${firstName} ${familyAndMiddle}`.toLowerCase();
};

export const StudentSummaryTable: React.FC<StudentSummaryTableProps> = ({
  sessions,
  onRefresh,
  title = 'BẢNG TỔNG HỢP DANH SÁCH HỌC SINH ĐÃ THAM GIA LÀM BÀI',
  showExport = true,
  onViewStudentDetail,
  onResetStudent,
  isAdmin = false,
}) => {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'score' | 'time'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  // Filter and Sort Sessions
  const filteredSessions = useMemo(() => {
    let list = [...sessions];

    // Filter by class
    if (selectedClass !== 'all') {
      list = list.filter((s) => s.studentClass === selectedClass);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.examCode.toLowerCase().includes(q)
      );
    }

    // Sort strictly by Vietnamese alphabetical order or criteria
    const viCollator = new Intl.Collator('vi', { sensitivity: 'base' });
    list.sort((a, b) => {
      if (sortField === 'name') {
        const keyA = getVietnameseSortKey(a.fullName);
        const keyB = getVietnameseSortKey(b.fullName);
        return sortOrder === 'asc' ? viCollator.compare(keyA, keyB) : viCollator.compare(keyB, keyA);
      } else if (sortField === 'score') {
        const scoreA = a.score ?? -1;
        const scoreB = b.score ?? -1;
        return sortOrder === 'asc' ? scoreA - scoreB : scoreB - scoreA;
      } else {
        const timeA = a.submittedAt || a.startedAt || 0;
        const timeB = b.submittedAt || b.startedAt || 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
    });

    return list;
  }, [sessions, selectedClass, searchQuery, sortField, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const submitted = sessions.filter((s) => s.status === 'da_nop');
    const totalSubmitted = submitted.length;
    const scores = submitted.filter((s) => s.score !== undefined).map((s) => s.score as number);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    const classStats: Record<string, number> = {};
    for (const c of VALID_CLASSES) {
      classStats[c] = sessions.filter((s) => s.studentClass === c && s.status === 'da_nop').length;
    }

    return { totalSubmitted, avgScore, maxScore, classStats };
  }, [sessions]);

  // Export CSV with UTF-8 BOM for Excel
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Họ và tên học sinh',
      'Lớp',
      'Mã đề thi',
      'Thời điểm nộp bài',
      'Thời gian làm bài',
      'Số câu đúng',
      'Số câu sai',
      'Số câu bỏ trống',
      'Tổng điểm (thang 10)',
      'Danh hiệu đạt được',
      'Trạng thái',
    ];

    const rows = filteredSessions.map((s, index) => {
      const submitTime = s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : '';
      const durationSeconds = s.submittedAt && s.startedAt ? Math.round((s.submittedAt - s.startedAt) / 1000) : 0;
      const durationFormatted = `${Math.floor(durationSeconds / 60)}p ${durationSeconds % 60}s`;

      return [
        index + 1,
        `"${s.fullName}"`,
        s.studentClass,
        s.examCode,
        `"${submitTime}"`,
        `"${durationFormatted}"`,
        s.correctCount ?? 0,
        s.wrongCount ?? 0,
        s.blankCount ?? 0,
        s.score !== undefined ? s.score.toFixed(1) : '',
        `"${s.rankTitle || ''}"`,
        s.status === 'da_nop' ? 'Đã nộp bài' : 'Đang làm bài',
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Danh_Sach_Hoc_Sinh_GDCD7_THCS_Tan_Hai_${selectedClass}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      {/* Title & Stats Ribbon */}
      <div className="bg-white border-2 border-blue-200 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-xs font-black uppercase tracking-wider">
                TRƯỜNG THCS TÂN HẢI · KHỐI 7
              </span>
              <span className="text-xs font-bold text-slate-500">GDCD 7 – Kết Nối Tri Thức</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {title}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Danh sách được tự động cập nhật khi học sinh nộp bài và sắp xếp theo thứ tự A – Z
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 cursor-pointer shadow-sm transition-all"
                title="Cập nhật danh sách mới nhất"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Đang tải...' : 'Làm mới'}</span>
              </button>
            )}

            {showExport && (
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md shadow-emerald-600/30 transition-all"
                title="Tải bảng điểm Excel (CSV tiếng Việt)"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Xuất Excel (CSV)</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-2 border-t border-slate-100">
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">Tổng đã hoàn thành</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">
              {stats.totalSubmitted}
            </span>
            <span className="text-[10px] text-slate-500 block">Học sinh đã nộp</span>
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">Điểm trung bình</span>
            <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
              {stats.avgScore.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-500 block">Thang điểm 10</span>
          </div>

          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">Điểm cao nhất</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono">
              {stats.maxScore.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500 block">Điểm tuyệt đối</span>
          </div>

          <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200 text-center">
            <span className="text-[11px] font-bold text-slate-500 block">Số lượng theo 5 lớp</span>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
              {VALID_CLASSES.map((c) => (
                <span key={c} className="px-1.5 py-0.5 rounded bg-white text-purple-950 font-bold font-mono text-[10px] border border-purple-200 shadow-xs">
                  {c}: {stats.classStats[c] || 0}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Class Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="text-xs font-black text-slate-800 mr-1 shrink-0">Lớp:</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedClass('all')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                selectedClass === 'all'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả ({sessions.length})
            </button>
            {VALID_CLASSES.map((c) => {
              const count = sessions.filter((s) => s.studentClass === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    selectedClass === c
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm họ tên học sinh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white font-medium"
            />
          </div>

          <button
            onClick={() => {
              if (sortField === 'name') setSortField('score');
              else if (sortField === 'score') setSortField('time');
              else setSortField('name');
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-300 cursor-pointer shrink-0"
            title="Đổi tiêu chí sắp xếp"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Xếp: {sortField === 'name' ? 'Tên A-Z' : sortField === 'score' ? 'Điểm số' : 'Thời gian'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-50/80 border-b-2 border-blue-200 text-blue-950 font-black uppercase tracking-wider">
                <th className="py-3 px-3 text-center">STT</th>
                <th className="py-3 px-4">Họ và tên học sinh</th>
                <th className="py-3 px-3 text-center">Lớp</th>
                <th className="py-3 px-3">Mã đề</th>
                <th className="py-3 px-3">Thời gian nộp</th>
                <th className="py-3 px-3 text-center text-emerald-700">Đúng</th>
                <th className="py-3 px-3 text-center text-rose-700">Sai</th>
                <th className="py-3 px-3 text-center text-amber-700 font-black">Tổng điểm</th>
                <th className="py-3 px-3">Danh hiệu</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                {isAdmin && <th className="py-3 px-3 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 11 : 10} className="py-12 text-center text-slate-500 font-medium">
                    Chưa có học sinh nào nộp bài phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s, idx) => (
                  <tr key={s.studentId} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {s.fullName}
                    </td>
                    <td className="py-3 px-3 text-center font-extrabold text-blue-700">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                        {s.studentClass}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-semibold text-slate-600">{s.examCode}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString('vi-VN') : 'Đang làm...'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 font-mono">
                      {s.correctCount ?? 0}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-rose-600 font-mono">
                      {s.wrongCount ?? 0}
                    </td>
                    <td className="py-3 px-3 text-center font-black text-amber-600 font-mono text-sm">
                      {s.score !== undefined ? s.score.toFixed(1) : '-'}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-[11px] font-bold text-blue-900">
                      {s.rankTitle || 'Hoàn thành xuất sắc'}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {s.status === 'da_nop' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Đã nộp bài</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Đang làm bài</span>
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {onViewStudentDetail && (
                            <button
                              onClick={() => onViewStudentDetail(s)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold cursor-pointer"
                            >
                              Chi tiết
                            </button>
                          )}
                          {onResetStudent && (
                            <button
                              onClick={() => onResetStudent(s.studentId, s.fullName)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer"
                            >
                              Làm lại
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
