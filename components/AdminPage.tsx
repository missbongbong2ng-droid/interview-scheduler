
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
  const [newSlot, setNewSlot] = useState({ date: '', startTime: '' });

  useEffect(() => {
    const load = async () => {
      const [s, c] = await Promise.all([fetchSlots(), fetchConfig()]);
      setSlots(s);
      setConfig(c);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleSaveAndExit = async () => {
    try {
      if (config) await saveConfig(config);
      await saveSlots(slots);
      alert('모든 설정이 성공적으로 저장되었습니다.');
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

  if (isLoading) return (
    <div className="p-20 text-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      <p className="mt-4 font-bold text-gray-400">시스템 설정 불러오는 중...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="border-b pb-6 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">시스템 관리</h2>
          <p className="text-sm text-gray-400 mt-1 font-medium">채용 정보와 면접 시간대를 실시간으로 관리합니다.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black text-green-700 uppercase">AI Service Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 채용 정보 및 안내사항 수정 */}
        <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm space-y-6">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            채용 공고 및 안내 설정
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">회사명</label>
              <input value={config?.name} onChange={e => setConfig({...config!, name: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-blue-500 font-bold transition-all bg-gray-50/30" />
            </div>
            
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">모집 직무</label>
              <input value={config?.jobTitle} onChange={e => setConfig({...config!, jobTitle: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-blue-500 font-bold transition-all bg-gray-50/30" />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">지원자 안내사항 (Guidelines)</label>
              <div className="space-y-3">
                {config?.guidelines.map((g, idx) => (
                  <div key={idx} className="flex gap-2 group animate-in slide-in-from-left-2" style={{ animationDelay: `${idx * 50}ms` }}>
                    <div className="flex-none w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-400 mt-1">{idx + 1}</div>
                    <textarea 
                      value={g} 
                      onChange={e => updateGuideline(idx, e.target.value)} 
                      rows={1}
                      className="flex-1 p-3 rounded-xl border border-gray-100 outline-none focus:border-blue-300 text-sm font-medium transition-all resize-none overflow-hidden"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = target.scrollHeight + 'px';
                      }}
                    />
                    <button 
                      onClick={() => removeGuideline(idx)} 
                      className="flex-none p-2 text-gray-300 hover:text-red-500 transition-colors self-start"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button 
                  onClick={addGuideline}
                  className="w-full py-3 mt-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  안내사항 추가하기
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 일정 관리 섹션 */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2rem] border-2 border-gray-50 shadow-sm space-y-6">
            <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              새 면접 시간 추가
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">날짜</label>
                <input type="date" value={newSlot.date} onChange={e => setNewSlot({...newSlot, date: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-indigo-500 font-medium bg-gray-50/30" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">시작 시간</label>
                <input type="time" value={newSlot.startTime} onChange={e => setNewSlot({...newSlot, startTime: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 outline-none focus:border-indigo-500 font-medium bg-gray-50/30" />
              </div>
            </div>
            <button 
              onClick={() => {
                if(!newSlot.date || !newSlot.startTime) return;
                setSlots([{ id: Date.now().toString(), date: newSlot.date, startTime: newSlot.startTime, endTime: '', isBooked: false, isActive: true }, ...slots]);
                setNewSlot({ date: '', startTime: '' });
              }} 
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-black hover:bg-black transition-all active:scale-95 shadow-lg"
            >
              리스트에 추가
            </button>
          </div>

          <div className="bg-white border-2 border-gray-50 rounded-[2rem] overflow-hidden">
            <div className="p-4 bg-gray-50/50 border-b font-black text-gray-400 text-[10px] uppercase tracking-widest flex justify-between items-center">
              <span>운영 중인 시간대</span>
              <span className="text-gray-900">{slots.length}개</span>
            </div>
            <div className="divide-y max-h-60 overflow-y-auto scrollbar-hide">
              {slots.length > 0 ? slots.map(s => (
                <div key={s.id} className="p-4 flex justify-between items-center hover:bg-gray-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 px-2 py-1 bg-gray-100 rounded">{s.date}</span>
                    <span className="font-black text-gray-800 text-sm">{s.startTime}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-2 py-1 rounded-md ${s.isBooked ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                      {s.isBooked ? '예약됨' : '대기중'}
                    </span>
                    <button onClick={() => setSlots(slots.filter(x => x.id !== s.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center text-gray-300 text-xs font-bold uppercase tracking-widest">No slots added</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 최종 저장 버튼 */}
      <div className="pt-4">
        <button 
          onClick={handleSaveAndExit} 
          className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all text-xl active:scale-[0.98] border-b-8 border-blue-800 flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          설정 저장 및 나가기
        </button>
      </div>
    </div>
  );
};

export default AdminPage;
