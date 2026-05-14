export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'BENDAHARA' | 'USER';
  nik?: string;
  kk?: string;
  address?: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
}

export interface PaymentType {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  isActive: boolean;
}

export interface Payment {
  id: number;
  userId: number;
  paymentTypeId: number;
  amount: number;
  month?: number;
  year?: number;
  paymentDate: string;
  status: 'paid' | 'pending';
  notes?: string;
  user?: { id: number; name: string; email: string };
  paymentType?: PaymentType;
  receivedBy?: { id: number; name: string };
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  image?: string;
  isPinned: boolean;
  creator?: { id: number; name: string; role: string };
}
