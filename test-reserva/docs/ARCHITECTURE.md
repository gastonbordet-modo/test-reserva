# Architecture — Modo Reservas

Spec técnica complementaria al [PRD](./PRD.md). Cubre stack, estructura de carpetas, capas, convenciones y decisiones que no son obvias leyendo el código.

## 1. Stack

- **Framework**: Next.js 16 (App Router, async params, server components por default).
- **Runtime**: React 19 con React Compiler.
- **Styling**: Tailwind CSS v4 (`@theme` directive para tokens).
- **Lenguaje**: TypeScript estricto.
- **Iconos**: `@fortawesome/react-fontawesome` (con `config.autoAddCss = false`).
- **Imágenes**: `next/image` con `picsum.photos` whitelisteado en `next.config.ts`.

> Importante: la versión de Next.js incluida tiene breaking changes respecto a versiones previas. Antes de tocar APIs internas leer `node_modules/next/dist/docs/`.

## 2. Estructura

```
app/
  layout.tsx                  Root layout + SearchProvider + FA config
  page.tsx                    Ruta /, renderiza <SearchExperience />
  globals.css                 Design tokens MODO, animaciones, resets
  context/
    SearchContext.tsx         Filtros + deporte detectado (estado global)
  data/
    venues.ts                 Mock data fuente (MockVenue + MOCK_VENUES)
  services/
    venues.ts                 fetchVenues, getVenueById (mockeado)
    slots.ts                  fetchSlots (mockeado)
  hooks/
    useVenues.ts              Refetch automático al cambiar filtros
  lib/
    format.ts                 formatPrice, formatDateLabel, todayIso
  components/
    SearchExperience.tsx      Orquestador del home (input + pills + lista)
    SearchBar.tsx             Input + submit + detectSport
    FilterPill.tsx            Pill genérico (3 estados visuales)
    NumberStepper.tsx         Stepper reusable
    VenueList.tsx             Renderiza loading/empty/list
    VenueCard.tsx             Link a /venues/[id]
    SlotBookingPanel.tsx      Multi-select + CTA fijo
    SlotCard.tsx              Card individual de slot
    filters/
      LocationFilter.tsx
      PeopleFilter.tsx
      PriceFilter.tsx
      DateFilter.tsx
  venues/
    [venueId]/
      page.tsx                Server component: fetch + <SlotBookingPanel />
```

## 3. Estado global

### `SearchContext`

Provider en root layout. Mantiene:

- `query: string` — texto crudo del search bar.
- `sport: Sport | null` — deporte detectado al submitar (gateway al resto del flow).
- `date: string` — ISO `YYYY-MM-DD`, default hoy.
- `location: string`
- `people: number` (default 2)
- `maxPrice: number` (default 5000)
- `withDeposit: boolean`
- `appliedFilters: Set<FilterId>` — qué filtros muestran estilo "aplicado" (con check).

**Patrón de setters envueltos**: `setLocation`, `setPeople`, `setMaxPrice`, `setDate` actualizan automáticamente `appliedFilters`. El componente nunca tiene que mantener "está aplicado o no" por su cuenta.

### Hidratación

`date` arranca como `""` en server y client, y un `useEffect` lo setea a hoy (`todayIso()`) en mount. Evita el mismatch que ocurriría si llamáramos `new Date()` en la inicialización del state (server y client podrían rendear distinto).

Todo el código de formato (`formatPrice`, `formatDateLabel`) es determinístico: regex y arrays propios en lugar de `Intl.NumberFormat` / `Intl.DateTimeFormat`, que dependen del locale del runtime.

## 4. Capas

### `data/`

Fuente mock de datos compartida entre servicios. `MockVenue` extiende `Venue` con campos privados (`sport`, `hasDeposit`, `slotDurationMinutes`) que no se exponen al cliente; los servicios los stripean con `toPublicVenue`.

### `services/`

Cada función define el **contrato que el backend real va a respetar**. Hoy están mockeadas con `setTimeout` (100–300ms) para que el código consumidor ya esté escrito asumiendo async.

- `fetchVenues(params): Promise<Venue[]>` — filtra por sport, location, maxPrice y deposit; ordena por precio.
- `getVenueById(id): Promise<Venue | null>`
- `fetchSlots(venueId): Promise<Slot[]>` — genera slots 08:00–22:00 a partir de `slotDurationMinutes` del venue.

### `hooks/useVenues`

Wraps fetch + estado. Patrón `cancelled` flag dentro del effect para evitar race conditions cuando el usuario cambia filtros rápido. Refetchea ante cambio de cualquier filtro (dep array exhaustivo).

## 5. Routing

| Ruta | Tipo | Notas |
|---|---|---|
| `/` | Client (vía `SearchExperience`) | Home con search + lista |
| `/venues/[venueId]` | Server | `params: Promise<...>` (async), fetchea data y pasa a `<SlotBookingPanel />` |
| `/mis-reservas` | **Pendiente** | Server + `<BookingsList />` client |

## 6. Design tokens

`app/globals.css` declara los tokens MODO en `@theme`. Se consumen como clases Tailwind:

- Colores: `bg-brand`, `bg-brand-10`, `bg-paper`, `text-text-light`, `text-text-gray`, `border-gray-20`.
- Radius: `rounded-modo-button`, `rounded-modo-md`.
- Sombra: `shadow-modo`.
- Tipografía: Red Hat Display (via `next/font`).

Animaciones custom: `filter-panel-enter` para los panels que se montan al abrir un filter pill.

## 7. Convenciones

- **`"use client"`** solo en componentes con estado o handlers de eventos. Páginas que fetchean datos son server components.
- **Mocks** simulan 100–300ms de latencia para que los loading states del UI se ejerciten.
- **Formato user-facing** siempre pasa por `lib/format.ts` para que sea determinístico (anti-mismatch).
- **Click-outside** se resuelve con un `pointerdown` listener + ref al contenedor. `pointerdown` corre antes que el click del próximo target, dándole UX previsible al toggle de filter pills.
- **`autoFocus`** en inputs de panel de filtro para que el teclado mobile aparezca solo.

## 8. Pendiente / siguiente iteración

- **`BookingsContext`** in-memory para acumular reservas confirmadas dentro de la sesión (el mock no persiste).
- **`AppHeader`** global con link a `/mis-reservas`.
- **Auth bridge real** (hoy `sessionStorage` mock).
- **MODO Pay bridge** real con manejo de success/failure/timeout.
- **Slots por cancha**: el backend va a exponer `courtId`/`courtName` por slot. Hoy se generan sin diferenciación. Requiere agrupar en UI.
- **Server-side hold** con expiración a 5min y liberación on-timeout.
- **Cancelación de reservas** + reembolso vía MODO.
