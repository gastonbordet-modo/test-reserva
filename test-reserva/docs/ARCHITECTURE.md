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
    SnackbarContext.tsx       Provider global de snackbars (success/error)
  data/
    venues.ts                 Mock data fuente (MockVenue + MOCK_VENUES + minCourtPrice)
    bookings.ts               Seed estático + store in-memory de reservas
  services/
    venues.ts                 fetchVenues, getVenueById (mockeado)
    slots.ts                  fetchSlots (mockeado, devuelve Court[])
    bookings.ts               createBooking, fetchUserBookings (mockeado)
    parseSearch.ts            parseSearchQuery (cliente del route handler)
  api/
    parse-search/
      route.ts                POST: infiere filtros del texto vía Claude (server-only)
  hooks/
    useVenues.ts              Refetch automático al cambiar filtros
  lib/
    format.ts                 formatPrice, formatDateLabel, todayIso, addDays
    auth.ts                   getAuthToken (lee sessionStorage, auto-seed mock)
  components/
    SearchExperience.tsx      Orquestador del home (input + pills + lista)
    SearchBar.tsx             Input + submit async (Claude parser) + fallback detectSport
    FilterPill.tsx            Pill genérico (3 estados visuales)
    NumberStepper.tsx         Stepper reusable
    VenueList.tsx             Renderiza loading/empty/list
    VenueCard.tsx             Link a /venues/[id]
    SlotBookingPanel.tsx      Multi-select + CTA fijo + modal de confirmación
    SlotCard.tsx              Card individual de slot
    ConfirmBookingModal.tsx   Bottom sheet de confirmación de reserva
    BookingsList.tsx          Tabs Próximas/Pasadas + fetch en mount
    BookingCard.tsx           Card individual de reserva con variants
    filters/
      LocationFilter.tsx
      PriceFilter.tsx
      DateFilter.tsx
  venues/
    [venueId]/
      page.tsx                Server component: fetch + <SlotBookingPanel />
  mis-reservas/
    page.tsx                  Server shell; reads `?confirmed=1` y delega a BookingsList
```

## 3. Estado global

### `SearchContext`

Provider en root layout. Mantiene:

- `query: string` — texto crudo del search bar.
- `sport: Sport | null` — deporte detectado al submitar (gateway al resto del flow).
- `date: string` — ISO `YYYY-MM-DD`, default hoy.
- `location: string` (default `"CABA"`)
- `maxPrice: number` (default 5000)
- `withDeposit: boolean`
- `appliedFilters: Set<FilterId>` — qué filtros muestran estilo "aplicado" (con check). Se siembra con `["location", "price"]` en el initial state y se le agrega `"date"` en el `useEffect` de mount (junto con el seteo de `todayIso()`). Resultado: el usuario ve el home con los tres filtros con defaults ya marcados como aplicados, igual que si los hubiera ingresado a mano.

**Patrón de setters envueltos**: `setLocation`, `setMaxPrice`, `setDate` actualizan automáticamente `appliedFilters`. El componente nunca tiene que mantener "está aplicado o no" por su cuenta.

**`applyParsedFilters({ sport?, date?, location?, maxPrice? })`**: setter batch usado por el `SearchBar` al recibir la respuesta del parser LLM. Solo aplica los campos no-null (los campos `null`/`undefined` se ignoran → preservan el valor previo, que es el default si nunca se tocó). Marca cada campo tocado como aplicado en una sola transición de `appliedFilters` para evitar renders intermedios.

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

### Auth

El bridge real de MODO va a inyectar un JWT en `sessionStorage["modo_auth_token"]` antes de que cargue la mini-app. La estrategia hoy:

- **`app/lib/auth.ts`** expone `getAuthToken()`. Lee `sessionStorage`; si está vacío auto-seedea con `mock-modo-token-abc123` para que el flujo dev funcione sin estar embebido.
- **Token opaco**: nunca parseamos el JWT ni extraemos el `userId`. Lo único que hacemos con él es pasarlo crudo al backend como `Authorization: Bearer <token>` cuando conectemos la API real. El backend resuelve el usuario.
- **Solo cliente**: `getAuthToken()` throwa si lo invocan en server (depende de `window`). Los servicios que lo necesitan (`createBooking`, `fetchUserBookings`) son client-callable.

### Reservas (mock)

- **`app/data/bookings.ts`** mantiene un store mutable a nivel módulo: `BOOKINGS: Booking[]`. Arranca con un seed de 5 reservas (mezcla pasadas/futuras, dates relativos a hoy vía `addDays(todayIso(), n)`).
- `addBooking()` hace push al store; `getAllBookings()` lo devuelve.
- El store **persiste durante la vida del bundle JS** (sobrevive a navegaciones client-side) pero se resetea al recargar la página. Es la limitación esperada de un mock sin backend.
- **`app/services/bookings.ts`**:
  - `createBooking({ venueId, courtId, slotIds, date })`: regenera los slots de la cancha (mismo algoritmo que `fetchSlots`), filtra por `slotIds`, arma el `Booking` con snapshot denormalizado de venue/court/slots y lo agrega al store. Llama `getAuthToken()` aunque no lo use (refleja el contrato real).
  - `fetchUserBookings()`: devuelve todas las reservas del store ordenadas por fecha desc. También llama `getAuthToken()`.
  - `cancelBooking(bookingId)`: soft-delete (muta `status` a `"cancelled"` en el store, no remueve el registro). Devuelve el booking actualizado o throwa si no existe. Token por header (mismo patrón).

### Inferencia de filtros (Claude)

El `SearchBar` no parsea el texto a mano; delega en un route handler `POST /api/parse-search` que llama a Claude (Haiku 4.5) para inferir los 4 filtros (`sport`, `date`, `location`, `maxPrice`) en una sola pasada, tolerando typos y fechas relativas en español rioplatense.

- **`app/api/parse-search/route.ts`** (server-only): valida el input con Zod (`query` ≤ 200 chars, `today` ISO), llama `generateObject` del Vercel AI SDK con `@ai-sdk/anthropic` directo (sin Gateway, sin coupling con Vercel). `temperature: 0`. El system prompt fija el contrato: 4 campos siempre presentes en el output, `null` cuando el campo no aparece en el texto, conversión de fechas relativas usando `today` como ancla, "lucas" → miles. Cualquier error (Anthropic caído, JSON malformado, body inválido) devuelve 200 con todos los campos en `null` (degradación graceful).
- **`app/services/parseSearch.ts`** (cliente): `parseSearchQuery(query, today)` postea al route, sanitiza la respuesta contra un whitelist (sport enum, regex ISO en date, número finito positivo en maxPrice) y devuelve `ParsedFilters`. En cualquier fallo de red/parsing también devuelve todo `null`.
- **`SearchBar`**: al submit, llama `parseSearchQuery`. Si `sport` viene `null`, cae al `detectSport()` regex local como red de seguridad. Si tampoco detecta, muestra el error de "deporte no identificado" (igual que antes del LLM). Si hay deporte, llama `applyParsedFilters` y deja al provider decidir qué pills marcar aplicadas.
- **Key**: `ANTHROPIC_API_KEY` en `.env` (o `.env.local` para no commitearla). El provider de `@ai-sdk/anthropic` la lee automático; nunca se pasa a la URL ni al cliente.

Los campos que no vinieron del LLM mantienen el default actual del context (`date = hoy`, `location = "CABA"`, `maxPrice = 5000`).

### Modal de confirmación genérico

`ConfirmBookingModal` se usa tanto para confirmar como para cancelar. Props relevantes para variar el comportamiento: `title`, `description`, `actionLabel`, `submittingLabel`, `actionVariant: "primary" | "destructive"`, `showDepositBadge`. El tipo de slots aceptado es un shape mínimo (`{ id, startTime, endTime, price }`) compatible con `Slot` (servicios) y `BookingSlot` (reservas).

## 5. Routing

| Ruta | Tipo | Notas |
|---|---|---|
| `/` | Client (vía `SearchExperience`) | Home con search + lista |
| `POST /api/parse-search` | Route Handler server | Recibe `{ query, today }`, llama Claude vía AI SDK, devuelve los 4 filtros (nullables) |
| `/venues/[venueId]` | Server | `params: Promise<...>` (async), fetchea data y pasa a `<SlotBookingPanel />` |
| `/mis-reservas` | Server shell | Lee `searchParams.confirmed`, pasa `justConfirmed` a `<BookingsList />` client. `BookingsList` fetchea bookings en mount, separa Próximas/Pasadas, dispara snackbar si viene de un confirm y limpia la URL con `router.replace`. |

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
- **Auth**: los servicios que requieren token llaman a `getAuthToken()` internamente. Los componentes nunca tocan el token ni lo pasan como parámetro.
- **Feedback**: el feedback efímero (success/error post-operación) usa `useSnackbar()` global. Cola de 1 — un nuevo `show()` reemplaza el anterior. Variants `success` (3s) y `error` (8s). Acciones importantes (confirmar reserva) se gatean detrás de un modal bottom-sheet (`ConfirmBookingModal`) con escape, click en backdrop y foco inicial al CTA.

## 8. Pendiente / siguiente iteración

- **AppHeader global**: hoy solo el home tiene link a `/mis-reservas` (top-right). Si crece la cantidad de pantallas con navegación principal, abstraer a un header global.
- **Auth bridge real**: hoy `getAuthToken()` auto-seedea mock; cuando estemos embebidos en MODO el token ya estará en `sessionStorage`.
- **MODO Pay bridge** real con manejo de success/failure/timeout. Hoy `createBooking` confirma directo sin pago.
- **Server-side hold** con expiración a 5min y liberación on-timeout.
- **Reembolso real vía MODO** post-cancelación. Hoy `cancelBooking` solo actualiza el status; en producción tiene que disparar el bridge de MODO para reembolsar el pago.
- **Contador en tabs de reservas** (`Próximas (3)` / `Pasadas (7)`).
- **Rate limiting del parser** (`/api/parse-search`): hoy expuesto sin control. Antes de prod, limit por IP o por token MODO + budget alert en Anthropic console.
- **Feedback visible de inferencia**: línea bajo el input tipo "Detectado: Fútbol · Mañana · Palermo · hasta $4000" para que el usuario entienda qué filtros se autocompletaron. Hoy se ve solo a través del cambio de los pills.
