export interface Reservation {
  id: number;
  customerName: string;
  date: Date;
  time: string;
  numberOfPeople: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}