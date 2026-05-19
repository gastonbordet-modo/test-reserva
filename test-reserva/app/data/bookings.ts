import { addDays, todayIso } from "../lib/format";

export type BookingSlot = {
  id: string;
  startTime: string;
  endTime: string;
  price: number;
};

export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  venue: {
    id: string;
    name: string;
    address: string;
    imageUrl: string;
  };
  court: {
    id: string;
    name: string;
    description: string;
  };
  slots: BookingSlot[];
  date: string;
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
};

function buildSeed(): Booking[] {
  const today = todayIso();
  return [
    {
      id: "bk-seed-1",
      venue: {
        id: "f1",
        name: "Cancha El Potrero",
        address: "Av. Cabildo 1234, Belgrano",
        imageUrl: "https://picsum.photos/seed/f1/240/240",
      },
      court: {
        id: "f1-c1",
        name: "Cancha 1",
        description: "Fútbol 5",
      },
      slots: [
        { id: "f1-c1-11", startTime: "19:00", endTime: "20:00", price: 6000 },
      ],
      date: addDays(today, -7),
      totalPrice: 6000,
      status: "confirmed",
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "bk-seed-2",
      venue: {
        id: "t1",
        name: "Club Tenis Norte",
        address: "Av. Lugones 3500, Belgrano",
        imageUrl: "https://picsum.photos/seed/t1/240/240",
      },
      court: {
        id: "t1-c2",
        name: "Cancha 2",
        description: "Polvo de ladrillo",
      },
      slots: [
        { id: "t1-c2-2", startTime: "10:00", endTime: "11:00", price: 8000 },
      ],
      date: addDays(today, -2),
      totalPrice: 8000,
      status: "confirmed",
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "bk-seed-3",
      venue: {
        id: "p1",
        name: "Paddle Club Recoleta",
        address: "Vicente López 1900, Recoleta",
        imageUrl: "https://picsum.photos/seed/p1/240/240",
      },
      court: {
        id: "p1-c1",
        name: "Cancha 1",
        description: "Cristal",
      },
      slots: [
        { id: "p1-c1-2", startTime: "11:00", endTime: "12:30", price: 5500 },
      ],
      date: addDays(today, 1),
      totalPrice: 5500,
      status: "confirmed",
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: "bk-seed-4",
      venue: {
        id: "b1",
        name: "Polideportivo Saavedra",
        address: "Crisólogo Larralde 5300, Saavedra",
        imageUrl: "https://picsum.photos/seed/b1/240/240",
      },
      court: {
        id: "b1-c2",
        name: "Cancha B",
        description: "Media cancha",
      },
      slots: [
        { id: "b1-c2-7", startTime: "15:00", endTime: "16:00", price: 3000 },
      ],
      date: addDays(today, 3),
      totalPrice: 3000,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
    {
      id: "bk-seed-5",
      venue: {
        id: "f3",
        name: "Fútbol 5 Palermo",
        address: "Honduras 4500, Palermo",
        imageUrl: "https://picsum.photos/seed/f3/240/240",
      },
      court: {
        id: "f3-c1",
        name: "Cancha Única",
        description: "Fútbol 5 sintética",
      },
      slots: [
        { id: "f3-c1-11", startTime: "19:00", endTime: "20:00", price: 7000 },
        { id: "f3-c1-12", startTime: "20:00", endTime: "21:00", price: 7000 },
      ],
      date: addDays(today, 5),
      totalPrice: 14000,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    },
  ];
}

let BOOKINGS: Booking[] = buildSeed();

export function getAllBookings(): Booking[] {
  return BOOKINGS;
}

export function addBooking(b: Booking): void {
  BOOKINGS = [b, ...BOOKINGS];
}
