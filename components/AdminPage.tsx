
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
      onClose();
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const updateGuideline = (index: number, value: string) => {
    if (!config) return;
    const newGuidelines = [...config.guidelines];
    newGuidelines[index] = value;
    setConfig({ ...config, guidelines: newGuidelines });
  };

  const addGuideline = () => {
    if (!config) return;
    setConfig({ ...config, guidelines: [...config.guidelines, ''] });
  };

  const removeGuideline = (index: number) => {
    if (!config) return;
    const newGuidelines = config.guidelines.filter((_, i) => i !== index);
    setConfig({ ...config, guidelines: newGuidelines });
  };

  const bookedSlots = slots.filter(s => s.isBooked);

  if (isLoading) return (
    <div className="p-20 text-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 font-bold text-gray-400">시스템 설정 불러오는 중...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="border-b pb-6">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">시스템 관리</h2>
        <p className="text-sm text-gray-400 mt-1 font-medium">채용 정보와 면접 가능 시간대를 관리합니다.</p>
      </div>

      {/* AI 연동 섹션 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-100">
        <div className="text-center md:text-left">
          <h3 className="font-bold text-xl flex items-center justify-center md:justify-start gap-2">🤖 Gemini AI 연결</h3>
          <p className="text-blue-100 text-sm mt-1">지원자별 맞춤형 인사말 기능을 사용하려면 키를 연결하세요.</p>
        </div>
        <button 
          onClick={handleConnectAI}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg active:scale-95 ${hasApiKey ? 'bg-white text-blue-600' : 'bg-yellow-400 text-yellow-900'}`}
        >
          {hasApiKey ? "AI 연동 완료" : "AI Studio 키 연결하기"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 채용 정보 수정 */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm space-y-6">
          <h3 className="font-black text-gray-900 flex items-center gap-2">📝 채용 공고 정보</h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">회사명</label>
              <input value={config?.name} onChange={e => setConfig({...config!, name: e.target.value})} placeholder="회사명 입력" className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-blue-500 font-bold transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">모집 직무</label>
              <input value={config?.jobTitle} onChange={e => setConfig({...config!, jobTitle: e.target.value})} placeholder="직무명 입력" className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-blue-500 font-bold transition-all" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">면접 안내사항</label>
              <div className="space-y-2">
                {config?.guidelines.map((g, idx) => (
                  <div key={idx} className="flex gap-2 group">
                    <input 
                      value={g} 
                      onChange={e => updateGuideline(idx, e.target.value)} 
                      placeholder="안내사항 입력" 
                      className="flex-1 p-3 rounded-lg border border-gray-100 outline-none focus:border-blue-300 text-sm font-medium transition-all"
                    />
                    <button 
                      onClick={() => removeGuideline(idx)} 
                      className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      title="삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addGuideline}
                  className="w-full py-2 mt-2 border-2 border-dashed border-gray-100 rounded-xl text-xs font-bold text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all"
                >
                  + 안내사항 추가
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 신규 슬롯 추가 */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm space-y-6">
          <h3 className="font-black text-gray-900 flex items-center gap-2">⏰ 신규 면접 일시 추가</h3>
          <div className="space-y-4">
            <input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-blue-500 font-medium" />
            <div className="flex gap-2">
              <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} className="flex-1 p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-blue-500 font-medium" />
              <button 
                onClick={() => {
                  if(!newSlot.date || !newSlot.startTime) return;
                  setSlots([{ id: Date.now().toString(), date: newSlot.date, startTime: newSlot.startTime, endTime: '', isBooked: false, isActive: true }, ...slots]);
                  setNewSlot({ date: '', startTime: '' });
                }} 
                className="bg-gray-900 text-white px-8 rounded-xl font-black hover:bg-black transition-all active:scale-95"
              >추가</button>
            </div>
          </div>
        </div>
      </div>

      {/* 예약 현황 테이블 */}
      <div className="bg-white border-2 border-gray-50 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="p-6 bg-gray-50 border-b flex justify-between items-center">
          <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            면접 예약 명단
          </h3>
          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{bookedSlots.length}명 예약됨</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b">
                <th className="px-6 py-4">면접 일시</th>
                <th className="px-6 py-4">지원자 성함</th>
                <th className="px-6 py-4">연락처 정보</th>
                <th className="px-6 py-4 text-center">상태</th>
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
                    <div className="text-xs text-gray-500 font-medium">{s.candidateEmail}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{s.candidatePhone}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2.5 py-1.5 rounded-lg">확정됨</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-gray-300 font-bold">아직 접수된 예약이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 전체 슬롯 리스트 */}
      <div className="bg-white border-2 border-gray-50 rounded-[2rem] overflow-hidden">
        <div className="p-4 bg-gray-50 border-b font-black text-gray-400 text-[10px] uppercase tracking-tighter">운영 중인 면접 시간대 ({slots.length})</div>
        <div className="divide-y max-h-64 overflow-y-auto scrollbar-hide">
          {slots.map(s => (
            <div key={s.id} className="p-4 flex justify-between items-center hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-400 w-24">{s.date}</span>
                <span className="font-black text-gray-800">{s.startTime}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[9px] font-black px-2 py-1 rounded-md ${s.isBooked ? 'bg-red-50 text-red-400' : 'bg-green-50 text-green-500'}`}>
                  {s.isBooked ? '예약됨' : '대기중'}
                </span>
                <button onClick={() => setSlots(slots.filter(x => x.id !== s.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 최종 저장 버튼 */}
      <button 
        onClick={handleSaveAndExit} 
        className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all text-xl active:scale-[0.98] border-b-4 border-blue-800"
      >
        모든 설정 저장 및 나가기
      </button>
    </div>
  );
};

export default AdminPage;
