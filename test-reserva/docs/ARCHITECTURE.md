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
    bookings.ts               Seed estático + store in-memory de reservas (mock pendiente)
  services/
    venues.ts                 fetchVenues, getVenueById (Supabase real). Venue = cancha; trae merchant embebido
    merchants.ts              fetchMerchants (Supabase real). Deriva imageUrl por slug
    slots.ts                  fetchSlots (Supabase real); flat Slot[] con venue embebido
    bookings.ts               createReservations (real); fetchUserBookings/cancelBooking (mock, pendientes)
    parseSearch.ts            parseSearchQuery (cliente del route handler)
  api/
    parse-search/
      route.ts                POST: infiere filtros del texto vía Claude (server-only)
  hooks/
    useMerchants.ts           Fetch list-venues + agrupa por merchant client-side
  lib/
    api.ts                    apiFetch + ApiError + snakeCase params (cliente Supabase Edge)
    format.ts                 formatPrice, formatDateLabel, todayIso, addDays
    auth.ts                   getUserId (lee sessionStorage, auto-seed mock 'landing-demo-001')
  components/
    SearchExperience.tsx      Orquestador del home (input + pills + lista)
    SearchBar.tsx             Input + submit async (Claude parser) + fallback detectSport
    FilterPill.tsx            Pill genérico (3 estados visuales)
    NumberStepper.tsx         Stepper reusable
    MerchantList.tsx          Renderiza loading/empty/list de complejos
    MerchantCard.tsx          Card de complejo (link a /merchants/[id]?sport=X)
    SlotBookingPanel.tsx      Tabs por cancha + N fetchSlots paralelos + CTA fijo + modal
    SlotCard.tsx              Card individual de slot
    CourtTabs.tsx             Tabs horizontales por cancha (Venue[])
    ConfirmBookingModal.tsx   Bottom sheet de confirmación de reserva
    BookingsList.tsx          Tabs Próximas/Pasadas + fetch en mount
    BookingCard.tsx           Card individual de reserva con variants
    filters/
      LocationFilter.tsx
      PriceFilter.tsx
      DateFilter.tsx
  merchants/
    [merchantId]/
      page.tsx                Server component: fetchVenues filtrado por merchant + <SlotBookingPanel />
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

Solo queda `bookings.ts` con el store in-memory de reservas mock (pendiente migración a `list-user-reservations`). Los mocks de venues/slots se borraron al integrar el backend real.

### `services/`

Cada función habla con Supabase Edge Functions vía `apiFetch` (excepto las funciones aún mockeadas).

- `fetchMerchants({ sport?, withDeposit? }): Promise<Merchant[]>` — `GET /list-merchants`. Ordena por `minPrice` asc. El service deriva `imageUrl` por slug.
- `fetchVenues(params): Promise<Venue[]>` — `GET /list-venues`. Filtra por sport (req), location, maxPrice, withDeposit. Devuelve canchas con `merchant` embebido.
- `getVenueById(id): Promise<Venue | null>` — `GET /get-venue?id=`. 404 → `null`.
- `fetchSlots(venueId, date?): Promise<Slot[]>` — `GET /list-slots?venue_id&date?`. Devuelve flat array; cada slot trae `venue` embebido (redundante con el listado pero útil).
- `createReservations({ slotIds }): Promise<Reservation[]>` — `POST /create-reservations-bulk`.

### `hooks/useMerchants`

Wrappea `fetchMerchants` + post-filter client-side de `location` (substring sobre `address`) y `maxPrice` (contra `minPrice` de cada merchant). Patrón `cancelled` flag dentro del effect para evitar race conditions cuando el usuario cambia filtros rápido. Refetchea ante cambio de cualquier filtro (dep array exhaustivo).

### Modelo de datos y flujo de navegación

Backend modela 3 niveles que el FE refleja 1-a-1:

- **Merchant** = complejo (ej. "Polideportivo Norte"). Tiene N venues. Datos: nombre, dirección, contactos, `requiresDeposit`.
- **Venue** = cancha individual (ej. "Paddle #4"). Pertenece a un merchant. Tiene `sport`, `capacity`, `isCovered`, `price` base. Cada venue tiene slots.
- **Slot** = horario de una venue. Tiene `startTime`/`endTime`, `price`, `status: available | blocked | reserved`.

**Decisión clave**: la home consume `list-merchants` directamente (en lugar de pedir todos los venues y agrupar). El backend ya devuelve `minPrice`, `sports[]` y `venuesCount` calculados, por lo que el FE recibe la lista lista para renderear.

Limitaciones del endpoint que se compensan client-side:

- `list-merchants` solo acepta `sport` y `with_deposit`. Los filtros `location` (substring sobre `merchant.address`) y `maxPrice` (`m.minPrice <= maxPrice`) se aplican **post-fetch** en el hook `useMerchants`.
- `Merchant` no trae `imageUrl` en el shape backend. El service deriva una URL determinística `https://picsum.photos/seed/${slug}/240/240` en `withImageUrl()`. Cuando backend agregue imagen real, alcanza con borrar el helper.

Flow completo end-to-end:

| Paso | Pantalla | HTTP calls |
|---|---|---|
| Search submit | `/` | 1 × `list-merchants?sport=X&with_deposit?=true` |
| Tap merchant | `/merchants/[id]?sport=X` | 1 × `list-venues?sport=X` (server-side, filtra por `merchant.id` client-side) + N × `list-slots?venue_id=Y` (paralelos, 1 por cancha del merchant) |
| Confirmar reserva | (modal) | 1 × `create-reservations-bulk` |
| Redirect a mis reservas | `/mis-reservas` | 1 × `list-user-reservations` (cuando se integre — hoy mock) |

### Cliente HTTP (`lib/api.ts`)

Wrapper único contra Supabase Edge Functions. Centraliza:

- `API_BASE` armado a partir de `NEXT_PUBLIC_SUPABASE_URL` + `/functions/v1`.
- `ANON_KEY` desde `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pública, segura en el bundle porque RLS está deny-all y todo pasa por edge functions con `service_role`).
- `apiFetch<T>(path, { method, query, body, userId, signal })`: hace el `fetch`, agrega siempre header `apikey`, agrega `X-User-Id` si se pasa `userId`, serializa body como JSON.
- `toSnakeCaseParams()`: convierte keys camelCase del FE (`maxPrice`, `withDeposit`) a snake_case del backend (`max_price`, `with_deposit`), omitiendo `undefined`/`null`/string vacío.
- **`ApiError`**: subclase de `Error` con `code` (del body `error.code` cuando existe, ej. `slot_not_available`) + `status` HTTP + `body` raw. Los services hacen `instanceof ApiError` para detectar errores tipados (ej. 404 → `null` en `getVenueById`, 409 → snackbar específico en `SlotBookingPanel`).

### Auth

El bridge real de MODO va a inyectar un `userId` opaco en `sessionStorage["modo_user_id"]` antes de que cargue la mini-app. La estrategia hoy:

- **`app/lib/auth.ts`** expone `getUserId()`. Lee `sessionStorage["modo_user_id"]`; si está vacío auto-seedea con `landing-demo-001` para que dev funcione sin estar embebido.
- **userId opaco**: nunca lo parseamos. Lo mandamos crudo al backend como header `X-User-Id` en los endpoints que lo requieren (`create-reservations-bulk`, `list-user-reservations`, `cancel-user-reservation`). El backend resuelve el usuario.
- **Solo cliente**: `getUserId()` throwa si lo invocan en server (depende de `window`). Los servicios que lo necesitan son client-callable.
- Nota: el MVP del hackathon del backend **no valida JWT**, confía en el `X-User-Id` que llega. Cuando MODO lo cablée real, va a ser otro string opaco — el contrato del FE no cambia.

### Reservas (transición backend real / mock)

- **`app/services/bookings.ts`**:
  - `createReservations({ slotIds })`: **real**. `POST /create-reservations-bulk` con body `{ slot_ids }` + header `X-User-Id`. Devuelve `Reservation[]` (1 por slot reservado), shape backend con campos de seña que el FE ignora en v1 (`deposit_amount`, `balance_amount`, etc.). El backend deduce la modalidad por merchant. 409 con `slot_not_available`/`slot_already_reserved` se mapea en `SlotBookingPanel` a "Ese turno ya no está disponible".
  - `fetchUserBookings()`: **mock** todavía. Lee del store mutable en `app/data/bookings.ts`. Pendiente migrar a `GET /list-user-reservations` cuando llegue el contrato de respuesta.
  - `cancelBooking(bookingId)`: **mock**. Soft-delete en el store. Pendiente migrar a `DELETE /cancel-user-reservation?id=<uuid>`.
- **`app/data/bookings.ts`** sigue funcionando como store de mock con seed (5 reservas, mix pasadas/futuras/canceladas) hasta que ambos endpoints de "Mis reservas" estén disponibles.
- **Cacheo transicional**: tras un `createReservations` exitoso, `SlotBookingPanel` llama a `recordReservationsAsMockBooking(reservations, snapshot)` que arma un `Booking` con la info que el FE ya tenía (merchant, venue, slots seleccionados, fecha) y lo agrega al store mock. Así la reserva nueva aparece inmediatamente en `/mis-reservas` aunque `fetchUserBookings` siga sirviendo del store local. El helper se borra cuando el listado consuma `list-user-reservations`. Recordá que el store se resetea al recargar la página: lo que reserves persiste solo durante la vida del bundle JS.

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
| `/` | Client (vía `SearchExperience`) | Home con search + lista de merchants |
| `/merchants/[merchantId]?sport=X` | Server | Async `params`+`searchParams`. Filtra venues por `merchant.id` y delega a `<SlotBookingPanel />`. Sport inválido o merchant vacío → `notFound()` |
| `/mis-reservas` | Server shell | Lee `searchParams.confirmed`, pasa `justConfirmed` a `<BookingsList />` client. `BookingsList` fetchea bookings en mount, separa Próximas/Pasadas, dispara snackbar si viene de un confirm y limpia la URL con `router.replace` |
| `POST /api/parse-search` | Route Handler server | Recibe `{ query, today }`, llama Claude vía AI SDK, devuelve los 4 filtros (nullables) |

### Endpoints externos (Supabase Edge Functions)

Base: `${NEXT_PUBLIC_SUPABASE_URL}/functions/v1`. Headers comunes: `apikey` siempre; `X-User-Id` cuando aplica.

| Endpoint | Estado FE | Notas |
|---|---|---|
| `GET /list-merchants` | **integrado** | Query: `sport?`, `with_deposit?`. Usado por el home. |
| `GET /list-venues` | **integrado** | Query: `sport` (req), `location?`, `max_price?`, `with_deposit?`. Usado por merchant detail page (server). |
| `GET /get-venue?id=<uuid>` | **integrado** | 404 → `null` (capturado vía `ApiError`) |
| `GET /list-slots?venue_id&date?` | **integrado** | Flat `Slot[]`; cada slot trae `venue` embebido |
| `POST /create-reservations-bulk` | **integrado** | Body `{ slot_ids }` + `X-User-Id`. 409 → snackbar específico |
| `GET /list-user-reservations?status?&page?&page_size?` | mock | Pendiente contrato de respuesta |
| `DELETE /cancel-user-reservation?id=<uuid>` | mock | Pendiente contrato de respuesta |

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
- **Auth bridge real**: hoy `getUserId()` auto-seedea mock; cuando estemos embebidos en MODO el userId ya estará en `sessionStorage["modo_user_id"]`.
- **`fetchSlots` real (`GET /list-slots`)**: hoy sigue mock. Pendiente alineación con backend sobre cómo se modela el "court" (en el backend cada venue parece ser ya un único court, lo cual elimina `CourtTabs` o lo deja con una sola pestaña).
- **`fetchUserBookings` real (`GET /list-user-reservations`)**: pendiente que backend documente el shape de respuesta (paginación, embebido de slot+venue para poder renderizar cards).
- **`cancelBooking` real (`DELETE /cancel-user-reservation`)**: pendiente shape de respuesta (204 vs 200 con reserva actualizada).
- **MODO Pay bridge** real con manejo de success/failure/timeout. Hoy `createReservations` confirma directo sin pago.
- **Server-side hold** con expiración a 5min y liberación on-timeout.
- **Reembolso real vía MODO** post-cancelación. El backend ya modela `deposit_status: 'refunded'`, falta cablear el bridge de MODO desde el FE.
- **Seña en v1**: backend ya soporta y crea reservas `with_deposit` para Club Padel Demo. El FE las ignora visualmente; cuando producto defina UX para mostrarlas (badge, total + seña, balance pendiente), sumarlo a `BookingCard` y al modal de confirmación.
- **Contact data en `createReservations`**: backend acepta `clientName/Phone/Email` opcionales. Hoy no los mandamos; si el merchant los pide en su backoffice, agregar un formulario previo a la confirmación.
- **Seed limitado**: backend solo tiene paddle + fútbol seeded; tenis y básquet devuelven lista vacía. Si Backend no los agrega a corto plazo, evaluar deshabilitar visualmente esos chips en el `SearchBar`/`SearchExperience`.
- **Contador en tabs de reservas** (`Próximas (3)` / `Pasadas (7)`).
- **Rate limiting del parser** (`/api/parse-search`): hoy expuesto sin control. Antes de prod, limit por IP o por userId + budget alert en Anthropic console.
- **Feedback visible de inferencia**: línea bajo el input tipo "Detectado: Fútbol · Mañana · Palermo · hasta $4000" para que el usuario entienda qué filtros se autocompletaron. Hoy se ve solo a través del cambio de los pills.
