
import React, { useState, useEffect } from 'react';
import { TimeSlot, CompanyInfo } from '../types';
import { fetchSlots, saveSlots, fetchConfig, saveConfig } from '../services/dataService';

interface AdminPageProps {
  onClose: () => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ onClose }) => {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [config, setConfig] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '' });

  useEffect(() => {
    const load = async () => {
      const [s, c] = await Promise.all([fetchSlots(), fetchConfig()]);
      setSlots(s);
      setConfig(c);
      
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(selected || !!process.env.API_KEY);
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const handleConnectAI = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    } else {
      alert('AI Studio 연동 기능은 지원되는 환경에서만 작동합니다.');
    }
  };

  const handleSaveAndExit = async () => {
    try {
      if (config) await saveConfig(config);
      await saveSlots(slots);
      alert('설정이 성공적으로 저장되었습니다.');
      onClose(); // 부모 컴포넌트의 step을 변경하여 관리자 페이지를 닫음
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const bookedSlots = slots.filter(s => s.isBooked);

  if (isLoading) return <div className="p-10 text-center font-bold text-gray-400">데이터 로딩 중...</div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center border-b pb-6">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">시스템 관리</h2>
        {/* 상단 버튼 제거됨 - 하단 저장 버튼으로 통합 */}
      </div>

      {/* AI 연동 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-100">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2">🤖 Gemini AI 연결 상태</h3>
          <p className="text-blue-100 text-sm mt-1">지원자별 맞춤형 실시간 인사말 기능을 활성화합니다.</p>
        </div>
        <button 
          onClick={handleConnectAI}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${hasApiKey ? 'bg-white text-blue-600' : 'bg-yellow-400 text-yellow-900'}`}
        >
          {hasApiKey ? "AI 연동 완료" : "AI Studio 키 연결하기"}
        </button>
      </div>

      {/* 예약 현황 테이블 */}
      <div className="bg-white border-2 border-gray-50 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            면접 예약 명단
          </h3>
          <span className="text-sm font-bold text-gray-400">총 {bookedSlots.length}명</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">일시</th>
                <th className="px-6 py-4">성함</th>
                <th className="px-6 py-4">이메일/연락처</th>
                <th className="px-6 py-4">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookedSlots.length > 0 ? bookedSlots.map(s => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-xs font-bold text-gray-400">{s.date}</div>
                    <div className="text-sm font-black text-gray-900">{s.startTime}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{s.bookedBy || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">{s.candidateEmail}</div>
                    <div className="text-xs text-gray-400">{s.candidatePhone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg">확정</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-300 font-bold">예약 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm space-y-6">
          <h3 className="font-black text-gray-900">📝 채용 정보 수정</h3>
          <div className="space-y-4">
            <input value={config?.name} onChange={e => setConfig({...config!, name: e.target.value})} placeholder="회사명" className="w-full p-4 rounded-xl border-2 border-gray-50 outline-none focus:border-blue-500 font-bold" />
            <input value={config?.jobTitle} onChange={e => setConfig({...config!, jobTitle: e.target.value})} placeholder="직무명" className="w-full p-4 rounded-xl border-2 border-gray-50 outline-none focus:border-blue-500 font-bold" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm space-y-6">
          <h3 className="font-black text-gray-900">⏰ 시간대 추가</h3>
          <div className="space-y-4 text-center">
            <input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-50 outline-none" />
            <div className="flex gap-2">
              <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} className="flex-1 p-4 rounded-xl border-2 border-gray-50 outline-none" />
              <button 
                onClick={() => {
                  if(!newSlot.date || !newSlot.startTime) return;
                  setSlots([{ id: Date.now().toString(), date: newSlot.date, startTime: newSlot.startTime, endTime: '', isBooked: false, isActive: true }, ...slots]);
                  setNewSlot({ date: '', startTime: '' });
                }} 
                className="bg-gray-900 text-white px-8 rounded-xl font-black"
              >추가</button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-50 rounded-[2rem] overflow-hidden">
        <div className="p-4 bg-gray-50 border-b font-black text-gray-400 text-[10px] uppercase">전체 슬롯 목록 ({slots.length})</div>
        <div className="divide-y max-h-60 overflow-y-auto">
          {slots.map(s => (
            <div key={s.id} className="p-4 flex justify-between items-center">
              <span className="font-bold text-gray-700">{s.date} {s.startTime}</span>
              <button onClick={() => setSlots(slots.filter(x => x.id !== s.id))} className="text-gray-300 hover:text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSaveAndExit} 
        className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 transition-all text-xl active:scale-[0.98]"
      >
        설정 저장 및 관리자 페이지 나가기
      </button>
    </div>
  );
};

export default AdminPage;
