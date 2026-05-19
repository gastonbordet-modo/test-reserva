# PRD — Modo Reservas

## 1. Contexto

Mini-app embebida en MODO (WebView) para reservar canchas deportivas. v1 cubre **fútbol, tenis, básquet y paddle** en toda Argentina. El usuario llega ya autenticado y paga vía bridges nativos de MODO; la app solo se encarga de búsqueda, reserva y consulta de reservas.

## 2. Problema

Hoy reservar una cancha implica coordinar por WhatsApp con cada club: chequear disponibilidad, confirmar precio, transferir seña. La experiencia es fragmentada y manual. No existe en MODO un canal nativo para reservar canchas a pesar de que el ecosistema ya cuenta con auth y pagos resueltos.

## 3. Goals v1

- Llevar el flujo búsqueda → reserva → pago a **menos de 2 minutos** en mobile.
- Cobertura nacional: cualquier club onboardeado por ops de MODO.
- Cero fricción de auth y pago apalancando los bridges nativos.
- Cancelación con reembolso automático (sin intervención de soporte).

## 4. Non-goals v1

- Modificación de fecha, horario o cantidad de personas en una reserva (solo cancelar).
- Reseñas, rating o comentarios de venues.
- Geolocalización del usuario (la ubicación se ingresa como texto libre).
- Procesamiento de pagos (responsabilidad de MODO Pay).
- Autenticación y gestión de perfil (responsabilidad de MODO).
- Onboarding de venues self-service (lo hace ops offline).
- Notificaciones push, recordatorios o emails.

## 5. Persona

**Jugador casual amateur en cualquier ciudad de Argentina.** Juega esporádicamente con amigos, no quiere instalar otra app y ya tiene MODO instalado para pagar. Necesita disponibilidad rápida y precios claros.

## 6. Casos de uso

### UC-1 — Buscar y reservar

1. Usuario abre la mini-app desde MODO.
2. Escribe en el buscador (ej: "fútbol palermo").
3. Sistema autodetecta el deporte y aplica el chip correspondiente.
4. Usuario ajusta filtros (fecha, ubicación, personas, precio máximo, seña).
5. Sistema muestra venues filtrados y ordenados por precio.
6. Usuario selecciona un venue.
7. Sistema muestra slots disponibles agrupados por cancha.
8. Usuario marca uno o más slots.
9. Tap en "Reservar N slots · $X".
10. Sistema bloquea los slots por **5 minutos** y dispara el bridge a MODO Pay.
11. Pago exitoso → redirect a `/mis-reservas` tab "Próximas".
12. Pago fallido o timeout → el hold se libera, vuelve al detalle del venue.

### UC-2 — Consultar reservas

1. Usuario entra a `/mis-reservas`.
2. Por default ve la tab "Próximas".
3. Puede cambiar a "Pasadas" con estilo visualmente atenuado.

### UC-3 — Cancelar una reserva próxima

1. Usuario abre el detalle de una reserva próxima.
2. Tap en "Cancelar reserva".
3. Confirma → app marca la reserva como cancelada y dispara reembolso vía MODO.

## 7. Requisitos funcionales

### RF-1 Buscador

- Input de texto libre.
- Autodetección de deporte por normalización (`fútbol`/`futbol`, `paddle`/`padel`, `basquet`/`basket`, `tenis`).
- 4 deportes soportados en v1.

### RF-2 Filtros

| Filtro | Default | Tipo |
|---|---|---|
| Fecha | Hoy | Date picker (`min = hoy`) |
| Ubicación | (vacío) | Texto libre |
| Personas | 2 | Stepper |
| Precio máximo | $5000 | Stepper +$500 |
| Con seña | false | Toggle |

- Los filtros persisten en `SearchContext` global (sobreviven a navegación).
- Modificar cualquiera dispara refetch automático de venues.

### RF-3 Lista de venues

- Card con imagen, nombre, dirección y precio desde.
- Tap → `/venues/[venueId]`.
- Ordenamiento por precio ascendente.

### RF-4 Detalle de venue

- Header: nombre, dirección, botón "Volver".
- Slots agrupados por cancha (`courtId`).
- Multi-select sobre los slots.
- CTA fijo abajo con cantidad seleccionada + total.

### RF-5 Confirmación de reserva

- Tap "Reservar N slots · $X" abre un **modal de confirmación** (bottom-sheet en mobile) con resumen:
  - Venue, cancha (nombre + descripción), fecha legible, listado de horarios, total destacado.
  - Badge informativo "Sin seña" (v1 todas las reservas son sin seña, tanto en mock como en backend real).
- Acciones del modal: "Cancelar" (cierra) y "Confirmar".
- Al confirmar:
  - **v1 mock**: dispara `createBooking` directo. Success → modal se cierra + **snackbar verde** "¡Reserva confirmada!" (3s). Error → modal se cierra + **snackbar rojo** con el mensaje (8s, dismissible).
  - **v1 final con backend**: dispara hold de 5min y bridge a MODO Pay. Success → redirect a `/mis-reservas`. Failure/timeout → liberar hold + snackbar de error.

### RF-6 Mis reservas

- Token obtenido del bridge MODO (mock en sessionStorage para v1).
- Dos tabs: **Próximas** (default, estilo brand activo) y **Pasadas** (estilo gris muted).
- Card por reserva: foto del venue, nombre, fecha, slots, total.

### RF-7 Cancelación

- Disponible solo en reservas próximas.
- Pide confirmación.
- Marca la reserva como cancelada y dispara reembolso vía MODO.

## 8. Requisitos no funcionales

- **Plataforma**: WebView dentro de MODO, mobile-first. Soportar viewport mínimo 360px.
- **Idioma**: Español rioplatense ("Reservá", "Mañana", "Vie 17 May").
- **Performance**: lista de venues < 1s tras cambiar filtro; navegación a slots < 500ms.
- **Hidratación**: sin server/client mismatch en formato de fechas y precios.
- **Accesibilidad**: `aria-*` en filtros y botones, foco visible, soporte teclado.

## 9. Dependencias externas

- **MODO Auth Bridge** — inyecta el JWT en `sessionStorage["modo_auth_token"]`. La app lo lee opaco vía `getAuthToken()` y lo manda como `Authorization: Bearer <token>` en cada request al backend. Nunca lo parseamos; el backend resuelve el usuario. v1 con auto-seed de mock token cuando la app no corre dentro de MODO.
- **MODO Pay Bridge** — recibe `holdId` + total, devuelve success/failure. Aún no implementado: hoy `createBooking` confirma directo sin pago.
- **API de venues/slots/bookings** — v1 mockeado, contratos en `app/services/`:
  - `fetchVenues(params)` / `getVenueById(id)`
  - `fetchSlots(venueId)` → `Court[]` con slots y ocupación
  - `createBooking({ venueId, courtId, slotIds, date })` → `Booking`
  - `fetchUserBookings()` → `Booking[]`

## 10. Riesgos / preguntas abiertas

- ¿Qué pasa si el usuario cierra la WebView con un hold activo? **Asumido**: el hold expira a los 5 min.
- ¿Concurrencia? **Asumido**: gana el primero que confirma; los demás reciben "slot no disponible" al confirmar.
- ¿Onboarding de venues a escala nacional es viable con ops manual? Pendiente con producto/ops.
- ¿Notificación al usuario si el venue cancela una reserva próxima? Out of scope v1, requiere canal push.

## 11. Métricas de éxito

- % de búsquedas que terminan en pago confirmado.
- Tiempo medio entre apertura de la mini-app y tap en "Reservar".
- Tasa de holds expirados (proxy de fricción con MODO Pay).
- Tasa de cancelación post-reserva.
