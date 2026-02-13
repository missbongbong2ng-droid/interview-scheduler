
import React, { useState, useEffect } from 'react';
import { TimeSlot, CompanyInfo, AppStep, BookingDetails } from './types';
import { fetchSlots, bookSlot, fetchConfig } from './services/dataService';
import { getAIPersonnalizedGreeting } from './services/geminiService';
import SlotItem from './components/SlotItem';
import AdminPage from './components/AdminPage';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [config, setConfig] = useState<CompanyInfo | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [aiGreeting, setAiGreeting] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [fetchedSlots, fetchedConfig] = await Promise.all([
        fetchSlots(),
        fetchConfig()
      ]);
      setSlots(fetchedSlots);
      setConfig(fetchedConfig);
      getAIPersonnalizedGreeting(fetchedConfig).then(setAiGreeting);
    } catch (error) {
      console.error("데이터 로딩 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleCloseAdmin = () => {
    loadInitialData(); // 최신 데이터 다시 불러오기
    setStep(AppStep.WELCOME); // 관리자 페이지를 닫고 메인으로 이동
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId) return;

    setIsLoading(true);
    const success = await bookSlot({
      candidateName: formData.name,
      email: formData.email,
      phoneNumber: formData.phone,
      slotId: selectedSlotId
    });

    if (success) {
      setStep(AppStep.SUCCESS);
    } else {
      alert("이미 예약된 시간입니다.");
      loadInitialData();
      setSelectedSlotId(null);
      setStep(AppStep.SELECTION);
    }
    setIsLoading(false);
  };

  if (isLoading && step !== AppStep.SUCCESS) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 font-bold animate-pulse">로딩 중...</p>
      </div>
    );
  }

  const selectedSlot = slots.find(s => s.id === selectedSlotId);
  const activeSlots = slots.filter(s => s.isActive);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 border border-gray-100">
        <div className="bg-blue-600 p-8 text-white flex justify-between items-start">
          <div>
            <p className="text-blue-100 font-bold text-xs uppercase tracking-widest mb-1">{config?.name}</p>
            <h1 className="text-2xl font-black">{config?.jobTitle} 면접</h1>
          </div>
          <button 
            onClick={() => setStep(step === AppStep.ADMIN ? AppStep.WELCOME : AppStep.ADMIN)}
            className="bg-white/10 hover:bg-white/20 p-2 rounded-xl transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>

        <div className="p-8">
          {step === AppStep.ADMIN ? (
             <AdminPage onClose={handleCloseAdmin} />
          ) : (
            <>
              {step === AppStep.WELCOME && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4">
                  <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-500">
                    <p className="text-blue-900 font-medium italic leading-relaxed">
                      "{aiGreeting || '반갑습니다! 면접 시간을 선택해 주세요.'}"
                    </p>
                  </div>
                  <div className="space-y-3 font-medium text-gray-600">
                    <h3 className="font-bold text-gray-900">안내 사항</h3>
                    <ul className="space-y-2 text-sm">
                      {config?.guidelines.map((g, idx) => <li key={idx}>• {g}</li>)}
                    </ul>
                  </div>
                  <button onClick={() => setStep(AppStep.SELECTION)} className="w-full py-5 bg-blue-600 text-white font-black text-lg rounded-2xl shadow-lg hover:bg-blue-700 transition-all">예약 시작하기</button>
                </div>
              )}

              {step === AppStep.SELECTION && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <h3 className="text-xl font-black text-gray-900">면접 시간 선택</h3>
                  <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2">
                    {activeSlots.map(slot => (
                      <SlotItem key={slot.id} slot={slot} isSelected={selectedSlotId === slot.id} onSelect={setSelectedSlotId} />
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(AppStep.WELCOME)} className="px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl">이전</button>
                    <button disabled={!selectedSlotId} onClick={() => setStep(AppStep.CONFIRMATION)} className={`flex-1 py-4 font-black rounded-xl transition-all ${selectedSlotId ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-300'}`}>다음 단계</button>
                  </div>
                </div>
              )}

              {step === AppStep.CONFIRMATION && (
                <form onSubmit={handleBooking} className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="bg-gray-50 p-6 rounded-2xl">
                    <p className="text-xs font-bold text-blue-600 mb-1">선택된 일정</p>
                    <p className="text-xl font-black text-gray-900">{selectedSlot?.date} / {selectedSlot?.startTime}</p>
                  </div>
                  <div className="space-y-3">
                    <input required placeholder="성함" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none" />
                    <input required type="email" placeholder="이메일" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none" />
                    <input required placeholder="연락처" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-blue-500 outline-none" />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setStep(AppStep.SELECTION)} className="px-6 py-4 bg-gray-100 text-gray-500 font-bold rounded-xl">취소</button>
                    <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl shadow-lg">예약 확정</button>
                  </div>
                </form>
              )}

              {step === AppStep.SUCCESS && (
                <div className="text-center py-8 space-y-6 animate-in zoom-in-95">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">✓</div>
                  <h2 className="text-2xl font-black text-gray-900">예약이 완료되었습니다!</h2>
                  <button onClick={() => window.location.reload()} className="text-blue-600 font-bold hover:underline">홈으로 돌아가기</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
