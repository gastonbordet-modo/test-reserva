import type { Sport } from "../context/SearchContext";

export type MockCourt = {
  id: string;
  name: string;
  description: string;
  pricePerSlot: number;
  slotDurationMinutes: number;
};

export type MockVenue = {
  id: string;
  sport: Sport;
  name: string;
  address: string;
  imageUrl: string;
  hasDeposit: boolean;
  courts: MockCourt[];
};

export function minCourtPrice(v: MockVenue): number {
  return v.courts.reduce((min, c) => Math.min(min, c.pricePerSlot), Infinity);
}

export const MOCK_VENUES: MockVenue[] = [
  {
    id: "f1",
    sport: "futbol",
    name: "Cancha El Potrero",
    address: "Av. Cabildo 1234, Belgrano, CABA",
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/f1/240/240",
    courts: [
      {
        id: "f1-c1",
        name: "Cancha 1",
        description: "Fútbol 5",
        pricePerSlot: 6000,
        slotDurationMinutes: 60,
      },
      {
        id: "f1-c2",
        name: "Cancha 2",
        description: "Fútbol 5 techada",
        pricePerSlot: 7500,
        slotDurationMinutes: 60,
      },
      {
        id: "f1-c3",
        name: "Cancha 3",
        description: "Fútbol 7",
        pricePerSlot: 9000,
        slotDurationMinutes: 90,
      },
    ],
  },
  {
    id: "f2",
    sport: "futbol",
    name: "Complejo La Boca",
    address: "Brandsen 805, La Boca, CABA",
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/f2/240/240",
    courts: [
      {
        id: "f2-c1",
        name: "Cancha A",
        description: "Fútbol 5",
        pricePerSlot: 5500,
        slotDurationMinutes: 90,
      },
      {
        id: "f2-c2",
        name: "Cancha B",
        description: "Fútbol 11",
        pricePerSlot: 11000,
        slotDurationMinutes: 90,
      },
    ],
  },
  {
    id: "f3",
    sport: "futbol",
    name: "Fútbol 5 Palermo",
    address: "Honduras 4500, Palermo, CABA",
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/f3/240/240",
    courts: [
      {
        id: "f3-c1",
        name: "Cancha Única",
        description: "Fútbol 5 sintética",
        pricePerSlot: 7000,
        slotDurationMinutes: 60,
      },
    ],
  },
  {
    id: "t1",
    sport: "tenis",
    name: "Club Tenis Norte",
    address: "Av. Lugones 3500, Belgrano, CABA",
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/t1/240/240",
    courts: [
      {
        id: "t1-c1",
        name: "Cancha 1",
        description: "Polvo de ladrillo",
        pricePerSlot: 8000,
        slotDurationMinutes: 60,
      },
      {
        id: "t1-c2",
        name: "Cancha 2",
        description: "Polvo de ladrillo",
        pricePerSlot: 8000,
        slotDurationMinutes: 60,
      },
      {
        id: "t1-c3",
        name: "Central",
        description: "Cemento",
        pricePerSlot: 9500,
        slotDurationMinutes: 60,
      },
    ],
  },
  {
    id: "t2",
    sport: "tenis",
    name: "Pista Central",
    address: "Av. del Libertador 2000, Núñez, CABA",
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/t2/240/240",
    courts: [
      {
        id: "t2-c1",
        name: "Cancha 1",
        description: "Sintética",
        pricePerSlot: 6500,
        slotDurationMinutes: 90,
      },
      {
        id: "t2-c2",
        name: "Cancha 2",
        description: "Sintética",
        pricePerSlot: 6500,
        slotDurationMinutes: 90,
      },
    ],
  },
  {
    id: "b1",
    sport: "basquet",
    name: "Polideportivo Saavedra",
    address: "Crisólogo Larralde 5300, Saavedra, CABA",
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/b1/240/240",
    courts: [
      {
        id: "b1-c1",
        name: "Cancha A",
        description: "Cancha completa",
        pricePerSlot: 4500,
        slotDurationMinutes: 60,
      },
      {
        id: "b1-c2",
        name: "Cancha B",
        description: "Media cancha",
        pricePerSlot: 3000,
        slotDurationMinutes: 60,
      },
    ],
  },
  {
    id: "b2",
    sport: "basquet",
    name: "Cancha Microcentro",
    address: "San Martín 600, Microcentro, CABA",
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/b2/240/240",
    courts: [
      {
        id: "b2-c1",
        name: "Cancha Indoor",
        description: "Cancha completa indoor",
        pricePerSlot: 5000,
        slotDurationMinutes: 60,
      },
    ],
  },
  {
    id: "p1",
    sport: "paddle",
    name: "Paddle Club Recoleta",
    address: "Vicente López 1900, Recoleta, CABA",
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/p1/240/240",
    courts: [
      {
        id: "p1-c1",
        name: "Cancha 1",
        description: "Cristal",
        pricePerSlot: 5500,
        slotDurationMinutes: 90,
      },
      {
        id: "p1-c2",
        name: "Cancha 2",
        description: "Cristal",
        pricePerSlot: 5500,
        slotDurationMinutes: 90,
      },
      {
        id: "p1-c3",
        name: "Cancha 3",
        description: "Outdoor cemento",
        pricePerSlot: 4800,
        slotDurationMinutes: 90,
      },
    ],
  },
  {
    id: "p2",
    sport: "paddle",
    name: "Pista Pádel Sur",
    address: "Caseros 3000, Boedo, CABA",
    hasDeposit: false,
    imageUrl: "https://picsum.photos/seed/p2/240/240",
    courts: [
      {
        id: "p2-c1",
        name: "Cancha A",
        description: "Cristal",
        pricePerSlot: 4500,
        slotDurationMinutes: 60,
      },
      {
        id: "p2-c2",
        name: "Cancha B",
        description: "Outdoor",
        pricePerSlot: 4000,
        slotDurationMinutes: 60,
      },
    ],
  },
  {
    id: "p3",
    sport: "paddle",
    name: "Club Lawn Pádel",
    address: "Av. Belgrano 4000, Almagro, CABA",
    hasDeposit: true,
    imageUrl: "https://picsum.photos/seed/p3/240/240",
    courts: [
      {
        id: "p3-c1",
        name: "Cancha 1",
        description: "Cristal techada",
        pricePerSlot: 6500,
        slotDurationMinutes: 90,
      },
      {
        id: "p3-c2",
        name: "Cancha 2",
        description: "Cristal techada",
        pricePerSlot: 6500,
        slotDurationMinutes: 90,
      },
    ],
  },
];
