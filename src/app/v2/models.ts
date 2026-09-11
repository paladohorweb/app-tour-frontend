export interface Experience {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  kind: 'TOUR' | 'STAY' | 'EVENT';
  department: string;
  municipality: string;
  address: string;
  latitude: number;
  longitude: number;
  meetingLatitude: number;
  meetingLongitude: number;
  meetingInstructions: string;
  whatsapp: string;
  imageUrl: string;
  rnt: string;
  cancellationPolicy: string;
  price: number;
  active: boolean;
}
export interface Slot {
  id: number;
  experienceId?: number;
  date: string;
  time: string;
  capacity: number;
  available: number;
}
export interface Booking {
  id: number;
  experienceId: number;
  slotId: number;
  userId: number;
  ownerId: number;
  people: number;
  total: number;
  status: string;
  paymentStatus: string;
  title: string;
  reference: string;
  date: string;
  endDate?: string;
  cancellationSnapshot: string;
  meetingLatitude: number;
  meetingLongitude: number;
  meetingInstructions: string;
  whatsapp: string;
}
export interface Notice {
  id: number;
  userId: number;
  title: string;
  message: string;
  seen: boolean;
  promotional: boolean;
  createdAt: string;
}
export const STATUS: Record<string, string> = {
  REQUESTED: 'Pendiente de confirmación',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  PENDING: 'Pendiente de verificación',
  VERIFIED: 'Pago verificado',
  REFUND_REVIEW: 'Reembolso en revisión',
};
