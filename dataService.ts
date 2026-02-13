
import { TimeSlot, BookingDetails, CompanyInfo } from "../types";

const SLOTS_KEY = 'INTERVIEW_SLOTS';
const CONFIG_KEY = 'INTERVIEW_CONFIG';

const DEFAULT_CONFIG: CompanyInfo = {
  name: '미래 테크놀로지',
  jobTitle: '프론트엔드 개발자',
  description: '혁신적인 서비스를 함께 만들 인재를 찾습니다.',
  guidelines: [
    '면접 시작 5분 전 접속 부탁드립니다.',
    '카메라와 마이크 상태를 미리 점검해 주세요.',
    '조용한 장소에서 참여해 주시기 바랍니다.'
  ]
};

const DEFAULT_SLOTS: TimeSlot[] = [
  { id: '1', date: '2024-12-20', startTime: '10:00', endTime: '11:00', isBooked: false, isActive: true },
  { id: '2', date: '2024-12-20', startTime: '14:00', endTime: '15:00', isBooked: false, isActive: true },
  { id: '3', date: '2024-12-21', startTime: '11:00', endTime: '12:00', isBooked: false, isActive: true },
];

export const fetchSlots = async (): Promise<TimeSlot[]> => {
  const data = localStorage.getItem(SLOTS_KEY);
  return data ? JSON.parse(data) : DEFAULT_SLOTS;
};

export const saveSlots = async (slots: TimeSlot[]): Promise<void> => {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
};

export const fetchConfig = async (): Promise<CompanyInfo> => {
  const data = localStorage.getItem(CONFIG_KEY);
  return data ? JSON.parse(data) : DEFAULT_CONFIG;
};

export const saveConfig = async (config: CompanyInfo): Promise<void> => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const bookSlot = async (details: BookingDetails): Promise<boolean> => {
  const slots = await fetchSlots();
  const slotIndex = slots.findIndex(s => s.id === details.slotId);
  
  if (slotIndex > -1 && !slots[slotIndex].isBooked) {
    slots[slotIndex].isBooked = true;
    slots[slotIndex].bookedBy = details.candidateName;
    slots[slotIndex].candidateEmail = details.email;
    slots[slotIndex].candidatePhone = details.phoneNumber;
    await saveSlots(slots);
    return true;
  }
  return false;
};
