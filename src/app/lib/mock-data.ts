export type PaymentStatus = 'Paid' | 'Pending' | 'Balance';

export interface Student {
  id: string;
  name: string;
  admissionNumber: string;
  grade: string;
  parentName: string;
  parentEmail: string;
  totalFees: number;
  paidAmount: number;
  status: PaymentStatus;
  background?: string;
}

export interface PaymentRecord {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  reference: string;
  method: string;
}

export const MOCK_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'Emma Thompson',
    admissionNumber: 'SCH-2024-001',
    grade: 'Primary 4',
    parentName: 'Sarah Thompson',
    parentEmail: 'sarah.t@example.com',
    totalFees: 1200,
    paidAmount: 800,
    status: 'Balance',
    background: 'Emma is a bright student with a passion for mathematics. She joined ScholarlyPay School in 2023.'
  },
  {
    id: 's2',
    name: 'James Wilson',
    admissionNumber: 'SCH-2024-002',
    grade: 'Primary 2',
    parentName: 'David Wilson',
    parentEmail: 'david.w@example.com',
    totalFees: 1200,
    paidAmount: 1200,
    status: 'Paid',
    background: 'James is very active in sports and recently won the inter-school swimming competition.'
  },
  {
    id: 's3',
    name: 'Olivia Garcia',
    admissionNumber: 'SCH-2024-003',
    grade: 'Primary 5',
    parentName: 'Maria Garcia',
    parentEmail: 'maria.g@example.com',
    totalFees: 1500,
    paidAmount: 0,
    status: 'Pending',
    background: 'Olivia is a transfer student from International Prep. She excels in creative arts.'
  },
];

export const MOCK_PAYMENTS: PaymentRecord[] = [
  {
    id: 'p1',
    studentId: 's1',
    amount: 500,
    date: '2024-01-15',
    reference: 'PAY-782345',
    method: 'Paystack Card'
  },
  {
    id: 'p2',
    studentId: 's1',
    amount: 300,
    date: '2024-02-10',
    reference: 'PAY-782991',
    method: 'Paystack Transfer'
  },
  {
    id: 'p3',
    studentId: 's2',
    amount: 1200,
    date: '2024-01-05',
    reference: 'PAY-781112',
    method: 'Paystack Mobile Money'
  },
];
