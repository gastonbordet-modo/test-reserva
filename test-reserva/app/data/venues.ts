import type { Sport } from "../context/SearchContext";

export type MockVenue = {
  id: string;
  sport: Sport;
  name: string;
  address: string;
  price: number;
  imageUrl: string;
  hasDeposit: boolean;
  slotDurationMinutes: number;
};

export const MOCK_VENUES: MockVenue[] = [
  {
    id: "f1",
    sport: "futbol",
    name: "Cancha El Potrero",
    address: "Av. Cabildo 1234, Belgrano",
    price: 6000,
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/f1/240/240",
    slotDurationMinutes: 60,
  },
  {
    id: "f2",
    sport: "futbol",
    name: "Complejo La Boca",
    address: "Brandsen 805, La Boca",
    price: 5500,
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/f2/240/240",
    slotDurationMinutes: 90,
  },
  {
    id: "f3",
    sport: "futbol",
    name: "Fútbol 5 Palermo",
    address: "Honduras 4500, Palermo",
    price: 7000,
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/f3/240/240",
    slotDurationMinutes: 60,
  },
  {
    id: "t1",
    sport: "tenis",
    name: "Club Tenis Norte",
    address: "Av. Lugones 3500, Belgrano",
    price: 8000,
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/t1/240/240",
    slotDurationMinutes: 60,
  },
  {
    id: "t2",
    sport: "tenis",
    name: "Pista Central",
    address: "Av. del Libertador 2000, Núñez",
    price: 6500,
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/t2/240/240",
    slotDurationMinutes: 90,
  },
  {
    id: "b1",
    sport: "basquet",
    name: "Polideportivo Saavedra",
    address: "Crisólogo Larralde 5300, Saavedra",
    price: 4500,
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/b1/240/240",
    slotDurationMinutes: 60,
  },
  {
    id: "b2",
    sport: "basquet",
    name: "Cancha Microcentro",
    address: "San Martín 600, Microcentro",
    price: 5000,
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/b2/240/240",
    slotDurationMinutes: 60,
  },
  {
    id: "p1",
    sport: "paddle",
    name: "Paddle Club Recoleta",
    address: "Vicente López 1900, Recoleta",
    price: 5500,
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/p1/240/240",
    slotDurationMinutes: 90,
  },
  {
    id: "p2",
    sport: "paddle",
    name: "Pista Pádel Sur",
    address: "Caseros 3000, Boedo",
    price: 4500,
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/p2/240/240",
    slotDurationMinutes: 60,
  },
  {
    id: "p3",
    sport: "paddle",
    name: "Club Lawn Pádel",
    address: "Av. Belgrano 4000, Almagro",
    price: 6500,
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/p3/240/240",
    slotDurationMinutes: 90,
  },
];
