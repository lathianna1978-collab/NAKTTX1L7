import React, { useState, useMemo } from 'react';
import { StudentSession, StudentClass, VALID_CLASSES } from '../types';
import { MASTER_QUESTIONS } from '../data/questions';
import {
  Shield,
  KeyRound,
  Download,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  ArrowUpDown,
  RefreshCw,
  LogOut,
  Sparkles,
  Cloud,
  FileSpreadsheet,
  Upload,
  Copy,
  Check,
} from 'lucide-react';
import { api, getCloudWebhookUrl, setCloudWebhookUrl, saveLocalSessions, getLocalSessions } from '../services/api';

interface TeacherDashboardProps {
  sessions: StudentSession[];
  onClose: () => void;
  onResetStudentAttempt: (studentId: string) => Promise<boolean>;
  onRefresh?: () => Promise<void>;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  sessions,
  onClose,
  onResetStudentAttempt,
  onRefresh,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Sorting
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'score' | 'time'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [showCloudConfig, setShowCloudConfig] = useState(false);
  const [cloudWebhookInput, setCloudWebhookInput] = useState(getCloudWebhookUrl() || '');
  const [cloudSaveMsg, setCloudSaveMsg] = useState<string | null>(null);
  const [viewingStudent, setViewingStudent] = useState<StudentSession | null>(null);

  // Teacher Password Check (Default: tanhai2026 or giaovien7)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'tanhai2026' || password === 'giaovien7' || password === 'admin') {
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError('Mật khẩu không đúng. Vui lòng thử lại (Gợi ý: tanhai2026)');
    }
  };

  const handleManualRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  // Helper function to extract Vietnamese sort key: [Tên chính] + [Họ đệm]
  const getVietnameseSortKey = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return parts[0]?.toLowerCase() || '';
    const firstName = parts[parts.length - 1]; // Tên chính (An, Bình, Cường, Dũng...)
    const familyAndMiddle = parts.slice(0, parts.length - 1).join(' '); // Họ và tên đệm
    return `${firstName} ${familyAndMiddle}`.toLowerCase();
  };

  // Filtered and Sorted Sessions
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

    // Sort strictly
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

  // Summary statistics
  const stats = useMemo(() => {
    const totalSubmitted = sessions.filter((s) => s.status === 'da_nop').length;
    const scores = sessions.filter((s) => s.status === 'da_nop' && s.score !== undefined).map((s) => s.score as number);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Per class counts
    const classStats: Record<string, { total: number; avg: number }> = {};
    for (const c of VALID_CLASSES) {
      const cSessions = sessions.filter((s) => s.studentClass === c && s.status === 'da_nop');
      const cScores = cSessions.map((s) => s.score ?? 0);
      const cAvg = cScores.length > 0 ? cScores.reduce((a, b) => a + b, 0) / cScores.length : 0;
      classStats[c] = { total: cSessions.length, avg: cAvg };
    }

    return { totalSubmitted, avgScore, maxScore, classStats };
  }, [sessions]);

  // Export to CSV with UTF-8 BOM for Microsoft Excel
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Họ và tên học sinh',
      'Lớp',
      'Mã đề thi',
      'Thời điểm bắt đầu',
      'Thời điểm nộp bài',
      'Thời gian làm bài',
      'Số câu đúng (trên 20)',
      'Số câu sai',
      'Số câu bỏ trống',
      'Tổng điểm (thang 10)',
      'Danh hiệu đạt được',
      'Trạng thái',
    ];

    const rows = filteredSessions.map((s, index) => {
      const startTime = s.startedAt ? new Date(s.startedAt).toLocaleString('vi-VN') : '';
      const submitTime = s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : '';
      const durationSeconds = s.submittedAt && s.startedAt ? Math.round((s.submittedAt - s.startedAt) / 1000) : 0;
      const durationFormatted = `${Math.floor(durationSeconds / 60)} phút ${durationSeconds % 60} giây`;

      return [
        index + 1,
        `"${s.fullName}"`,
        s.studentClass,
        s.examCode,
        `"${startTime}"`,
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
    link.download = `Bang_Diem_GDCD7_THCS_Tan_Hai_${selectedClass}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export Database as JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Du_Lieu_Bai_Thi_GDCD7_THCS_Tan_Hai_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Import Database from JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          const current = getLocalSessions();
          // Merge avoiding duplicates
          const map = new Map<string, StudentSession>();
          current.forEach((s) => map.set(s.studentId, s));
          parsed.forEach((s) => map.set(s.studentId, s));
          const merged = Array.from(map.values());
          saveLocalSessions(merged);
          alert(`Đã nhập thành công ${parsed.length} kết quả bài làm vào hệ thống.`);
          if (onRefresh) await onRefresh();
        } else {
          alert('Tệp JSON không đúng định dạng dữ liệu bài làm.');
        }
      } catch {
        alert('Lỗi đọc tệp JSON. Vui lòng kiểm tra lại tệp tải lên.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetAttempt = async (studentId: string, fullName: string) => {
    if (window.confirm(`Thầy/Cô có chắc chắn muốn hủy lượt nộp bài của học sinh "${fullName}" để học sinh làm lại không?`)) {
      const success = await onResetStudentAttempt(studentId);
      if (success) {
        alert(`Đã hủy khóa bài thi cho học sinh ${fullName}. Học sinh có thể đăng nhập làm lại.`);
        setViewingStudent(null);
      }
    }
  };

  const [copiedScript, setCopiedScript] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const googleAppsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Thời điểm nộp", "Họ và tên học sinh", "Lớp", "Mã đề thi", 
        "Điểm số (thang 10)", "Số câu đúng", "Số câu sai", "Số câu bỏ trống", 
        "Danh hiệu", "Bắt đầu lúc", "Thời gian làm (phút)"
      ]);
    }
    var data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.submittedAt || new Date().toLocaleString("vi-VN"),
      data.studentName,
      data.studentClass,
      data.examCode,
      data.score,
      data.correctCount,
      data.wrongCount,
      data.blankCount,
      data.rankTitle,
      data.startedAt,
      data.durationMinutes
    ]);
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    list.push({
      fullName: r[1],
      studentClass: r[2],
      examCode: r[3],
      score: Number(r[4]),
      correctCount: Number(r[5]),
      wrongCount: Number(r[6]),
      blankCount: Number(r[7]),
      rankTitle: r[8],
      status: "da_nop"
    });
  }
  return ContentService.createTextOutput(JSON.stringify({ sessions: list }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleTestWebhook = async () => {
    if (!cloudWebhookInput.trim()) {
      alert('Vui lòng dán URL Google Apps Script / Webhook trước khi thử nghiệm.');
      return;
    }
    setIsTestingWebhook(true);
    try {
      await fetch(cloudWebhookInput.trim(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          studentName: 'HỌC SINH THỬ NGHIỆM',
          studentClass: '7A10',
          examCode: 'MÃ ĐỀ 701',
          score: 10.0,
          correctCount: 20,
          wrongCount: 0,
          blankCount: 0,
          rankTitle: 'SIÊU SAO TRI THỨC',
          startedAt: new Date().toLocaleString('vi-VN'),
          submittedAt: new Date().toLocaleString('vi-VN'),
          durationMinutes: '15.0',
        }),
        mode: 'no-cors',
      });
      setCloudSaveMsg('✅ Đã gửi dữ liệu mẫu thành công! Hãy mở Google Sheet kiểm tra hàng dữ liệu mới.');
    } catch (err) {
      alert('Không thể kết nối tới Webhook: ' + String(err));
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSaveWebhook = () => {
    setCloudWebhookUrl(cloudWebhookInput.trim());
    setCloudSaveMsg('Đã lưu cấu hình đồng bộ đám mây thành công!');
    setTimeout(() => setCloudSaveMsg(null), 3000);
  };

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
            <Shield className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-black text-slate-900 mb-1">CỔNG QUẢN TRỊ GIÁO VIÊN</h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            Môn Giáo dục công dân 7 – Trường THCS Tân Hải
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Mật khẩu truy cập giáo viên</span>
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 text-sm font-bold outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                autoFocus
              />
              <p className="text-[11px] text-slate-500 mt-1.5 italic">
                * Gợi ý mật khẩu: <strong className="text-indigo-600 font-bold">tanhai2026</strong>
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-3 rounded-2xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                Hủy / Quay lại
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-400/25 transition-all cursor-pointer"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 overflow-y-auto p-4 sm:p-6 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto space-y-5">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border-2 border-blue-200 rounded-3xl p-5 sm:p-6 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-[11px] font-black uppercase tracking-wider">
                BẢNG TỔNG HỢP GIÁO VIÊN
              </span>
              <span className="text-xs text-slate-500 font-bold">GDCD 7 – THCS Tân Hải</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Quản Lý Kết Quả Kiểm Tra Trực Tuyến Cá Nhân
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAnswerKey(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-2 border-indigo-200 cursor-pointer shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Xem Đáp Án Chuẩn & Giải Thích</span>
            </button>

            <button
              onClick={() => setShowCloudConfig(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border-2 border-sky-200 cursor-pointer shadow-sm"
              title="Cấu hình Google Sheets hoặc máy chủ đồng bộ khi chia sẻ qua Netlify"
            >
              <Cloud className="w-4 h-4 text-sky-600" />
              <span>Đồng Bộ Đám Mây (Netlify)</span>
            </button>

            {onRefresh && (
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border-2 border-blue-200 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isRefreshing ? 'Đang tải...' : 'Làm Mới Danh Sách'}</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md shadow-emerald-600/30"
              title="Xuất bảng điểm ra tệp Excel CSV chuẩn tiếng Việt"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Tệp Excel (CSV)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer"
              title="Sao lưu dữ liệu JSON"
            >
              <Download className="w-4 h-4" />
              <span>Sao Lưu JSON</span>
            </button>

            <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Nhập JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Đóng</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-500 font-bold mb-1">Tổng học sinh đã nộp</div>
            <div className="text-3xl font-black text-blue-700 font-mono">
              {stats.totalSubmitted}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Khối 7 THCS Tân Hải</div>
          </div>

          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-500 font-bold mb-1">Điểm trung bình toàn khối</div>
            <div className="text-3xl font-black text-amber-600 font-mono">
              {stats.avgScore.toFixed(2)}
              <span className="text-sm font-sans text-slate-400 font-normal"> / 10</span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Thang điểm 10</div>
          </div>

          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-500 font-bold mb-1">Điểm cao nhất</div>
            <div className="text-3xl font-black text-emerald-600 font-mono">
              {stats.maxScore.toFixed(1)}
            </div>
            <div className="text-[11px] text-slate-400 font-medium mt-1">Danh hiệu Siêu sao tri thức</div>
          </div>

          <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 shadow-sm">
            <div className="text-xs text-slate-500 font-bold mb-1">Thống kê theo 5 lớp</div>
            <div className="flex flex-wrap gap-1 mt-1 text-[11px]">
              {VALID_CLASSES.map((c) => (
                <span key={c} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-bold font-mono">
                  {c}: {stats.classStats[c]?.total || 0}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Filter and Search Controls */}
        <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          {/* Class Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-black text-slate-800 mr-1">Lớp:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedClass('all')}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer border ${
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
                    className={`px-3 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer border ${
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

          {/* Search Box */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm họ tên học sinh..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all font-medium"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => {
                if (sortField === 'name') setSortField('score');
                else if (sortField === 'score') setSortField('time');
                else setSortField('name');
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-300 cursor-pointer shrink-0"
              title="Thay đổi tiêu chí sắp xếp"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Xếp theo: {sortField === 'name' ? 'Tên A-Z' : sortField === 'score' ? 'Điểm số' : 'Thời gian nộp'}
              </span>
            </button>
          </div>
        </div>

        {/* Aggregate Data Table */}
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
                  <th className="py-3 px-3 text-center text-slate-600">Trống</th>
                  <th className="py-3 px-3 text-center text-amber-700 font-black">Điểm</th>
                  <th className="py-3 px-3">Danh hiệu</th>
                  <th className="py-3 px-3">Trạng thái</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-500 font-medium">
                      Chưa có học sinh nào nộp bài phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((s, idx) => (
                    <tr key={s.studentId} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-3 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {s.fullName}
                      </td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-blue-700">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-200">
                          {s.studentClass}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono font-semibold text-slate-600">{s.examCode}</td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {s.submittedAt ? new Date(s.submittedAt).toLocaleTimeString('vi-VN') : 'Đang làm...'}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-emerald-600 font-mono">
                        {s.correctCount ?? 0}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-rose-600 font-mono">
                        {s.wrongCount ?? 0}
                      </td>
                      <td className="py-3.5 px-3 text-center font-bold text-slate-400 font-mono">
                        {s.blankCount ?? 0}
                      </td>
                      <td className="py-3.5 px-3 text-center font-black text-amber-600 font-mono text-sm">
                        {s.score !== undefined ? s.score.toFixed(1) : '-'}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-[11px] font-bold text-blue-900">
                        {s.rankTitle || 'Hoàn thành xuất sắc'}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {s.status === 'da_nop' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold">
                            Đã nộp bài
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-extrabold">
                            Đang làm bài
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingStudent(s)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-bold cursor-pointer transition-colors"
                            title="Xem chi tiết"
                          >
                            Chi tiết
                          </button>
                          <button
                            onClick={() => handleResetAttempt(s.studentId, s.fullName)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold cursor-pointer transition-colors"
                            title="Hủy khóa cho học sinh làm lại"
                          >
                            Làm lại
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Cloud Webhook Configuration */}
        {showCloudConfig && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-xl bg-white border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Đồng Bộ Dữ Liệu Đám Mây (Netlify)</h3>
                    <p className="text-xs text-slate-500">Tự động cập nhật bài làm của học sinh khi chia sẻ qua mạng</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCloudConfig(false)}
                  className="px-3 py-1 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-4 text-xs text-slate-700">
                <div className="bg-sky-50 border-2 border-sky-200 rounded-2xl p-4">
                  <p className="font-black text-sky-950 mb-1.5 flex items-center gap-1.5 text-xs">
                    <Cloud className="w-4 h-4 text-sky-600" />
                    <span>GIẢI PHÁP ĐỒNG BỘ DỮ LIỆU TỰ ĐỘNG KHI CHIA SẺ QUA NETLIFY:</span>
                  </p>
                  <p className="leading-relaxed text-sky-900 font-medium">
                    Do Netlify chỉ phục vụ tệp tĩnh, để toàn bộ học sinh làm bài trên điện thoại/máy tính cá nhân tại nhà tự động gửi điểm về máy Thầy/Cô, Thầy/Cô có thể liên kết trực tiếp với <strong>Google Trang tính (Google Sheets)</strong> hoàn toàn miễn phí và không giới hạn lượt làm!
                  </p>
                </div>

                {/* 3 Step Guide */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900">Hướng dẫn cài đặt Google Sheets trong 1 phút:</div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] font-medium leading-relaxed">
                    <li>Mở một Google Trang tính mới trên Google Drive của Thầy/Cô.</li>
                    <li>Vào menu <strong>Tiện ích mở rộng ➔ Apps Script</strong>.</li>
                    <li>Xóa mã cũ, dán đoạn mã bên dưới rồi nhấn <strong>Triển khai ➔ Triển khai mới ➔ Ứng dụng web</strong> (chọn quyền truy cập: <em>Bất kỳ ai</em>).</li>
                    <li>Sao chép URL ứng dụng web và dán vào ô bên dưới.</li>
                  </ol>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={handleCopyScript}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedScript ? 'Đã sao chép mã Apps Script!' : 'Sao chép mã Google Apps Script mẫu'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    URL Google Apps Script Web App (Webhook):
                  </label>
                  <input
                    type="url"
                    placeholder="https://script.google.com/macros/s/.../exec"
                    value={cloudWebhookInput}
                    onChange={(e) => setCloudWebhookInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-mono text-xs outline-none focus:border-blue-500 focus:bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Khi điền URL, bất cứ khi nào học sinh nộp bài thì kết quả (tên, lớp, điểm, đúng/sai, thời gian) sẽ tự động ghi vào Google Trang tính ngay lập tức.
                  </p>
                </div>

                {cloudSaveMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-800 font-bold text-center text-xs">
                    {cloudSaveMsg}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={isTestingWebhook || !cloudWebhookInput.trim()}
                    className="px-4 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold disabled:opacity-50 transition-all cursor-pointer"
                  >
                    {isTestingWebhook ? 'Đang gửi thử...' : '⚡ Thử nghiệm gửi dữ liệu mẫu'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCloudConfig(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={handleSaveWebhook}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-600/30 cursor-pointer"
                    >
                      Lưu Cấu Hình
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: View Student Detail */}
        {viewingStudent && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{viewingStudent.fullName}</h3>
                  <p className="text-xs text-blue-700 font-bold">
                    Lớp {viewingStudent.studentClass} · {viewingStudent.examCode} · Nộp lúc: {viewingStudent.submittedAt ? new Date(viewingStudent.submittedAt).toLocaleTimeString('vi-VN') : 'Đang làm...'}
                  </p>
                </div>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-6">
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-600">Điểm số</div>
                  <div className="text-2xl font-black text-amber-600 font-mono">
                    {viewingStudent.score !== undefined ? viewingStudent.score.toFixed(1) : '-'}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-600">Đúng</div>
                  <div className="text-2xl font-black text-emerald-600 font-mono">{viewingStudent.correctCount ?? 0}</div>
                </div>
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-600">Sai</div>
                  <div className="text-2xl font-black text-rose-600 font-mono">{viewingStudent.wrongCount ?? 0}</div>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                  <div className="text-[11px] font-bold text-slate-600">Bỏ trống</div>
                  <div className="text-2xl font-black text-slate-600 font-mono">{viewingStudent.blankCount ?? 0}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Chi tiết 20 câu trả lời của học sinh:
                </h4>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {MASTER_QUESTIONS.map((q) => {
                    const ans = viewingStudent.answers?.[q.id];
                    const isCorrect = ans?.isCorrect;
                    let displayAns = 'Chưa trả lời / Hết giờ';
                    if (ans?.userMultipleChoice) displayAns = `Đã chọn: ${ans.userMultipleChoice}`;
                    else if (ans?.userFillBlank) displayAns = `Đã điền: "${ans.userFillBlank}"`;
                    else if (ans?.userMatching) displayAns = `Đã nối: ${JSON.stringify(ans.userMatching)}`;
                    else if (ans?.userOrder) displayAns = `Đã xếp: ${ans.userOrder.join(' ➔ ')}`;

                    return (
                      <div
                        key={q.id}
                        className={`p-3 rounded-2xl border-2 text-xs flex items-start justify-between gap-3 ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                            : ans?.isSkippedOrTimeout
                            ? 'bg-slate-50 border-slate-200 text-slate-600'
                            : 'bg-rose-50/80 border-rose-300 text-rose-950'
                        }`}
                      >
                        <div>
                          <span className="font-black">Câu {q.id} ({q.type}):</span> {q.questionText}
                          <div className="mt-1 font-mono font-bold text-[11px] text-blue-900">{displayAns}</div>
                          <div className="mt-0.5 text-[10px] text-slate-500 italic">Đáp án & Giải thích: {q.explanation}</div>
                        </div>
                        <span className="shrink-0 font-black text-sm">
                          {isCorrect ? '+0.5đ' : '0.0đ'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Master Answer Key */}
        {showAnswerKey && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-3xl bg-white border-2 border-indigo-200 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <span>Bộ Đề Chuẩn 20 Câu Hỏi & Đáp Án GDCD 7</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Trường THCS Tân Hải – Bộ sách Kết nối tri thức với cuộc sống
                  </p>
                </div>
                <button
                  onClick={() => setShowAnswerKey(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                >
                  Đóng
                </button>
              </div>

              <div className="space-y-3.5">
                {MASTER_QUESTIONS.map((q) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-blue-900">
                        Câu {q.id} ({q.level} · {q.lesson})
                      </span>
                      <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-mono font-bold text-[11px]">
                        0.5 điểm
                      </span>
                    </div>
                    <p className="text-slate-800 font-bold">{q.questionText}</p>
                    <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-950 font-medium">
                      <strong>Đáp án & Giải thích:</strong> {q.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
