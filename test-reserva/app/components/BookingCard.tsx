import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { Booking } from "../services/bookings";
import { formatPrice, formatDateLabel } from "../lib/format";

type Props = {
  booking: Booking;
  variant: "upcoming" | "past";
  onCancel?: (booking: Booking) => void;
};

function formatSlotRange(slots: Booking["slots"]): string {
  if (slots.length === 0) return "";
  const first = slots[0];
  const last = slots[slots.length - 1];
  const range = `${first.startTime} - ${last.endTime}`;
  if (slots.length === 1) return range;
  return `${range} · ${slots.length} slots`;
}

export function BookingCard({ booking, variant, onCancel }: Props) {
  const cancelled = booking.status === "cancelled";

  const containerClass =
    variant === "upcoming"
      ? "bg-paper border-gray-20"
      : cancelled
        ? "bg-paper border-gray-20 opacity-80"
        : "bg-paper border-gray-20 opacity-60";

  const textColorMain = variant === "upcoming" ? "text-text-light" : "text-text-gray";
  const totalColor = variant === "upcoming" ? "text-brand" : "text-text-gray";

  return (
    <article
      className={`flex gap-3 sm:gap-4 p-3 border rounded-modo-md shadow-modo w-full ${containerClass}`}
      aria-disabled={variant === "past"}
    >
      <Image
        src={booking.venue.imageUrl}
        alt=""
        width={96}
        height={96}
        className={`rounded-modo-sm object-cover flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 ${
          variant === "past" ? "grayscale" : ""
        }`}
      />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className={`font-bold truncate ${textColorMain}`}>
            {booking.venue.name}
          </h3>
          {cancelled && (
            <span className="flex-shrink-0 bg-system-error-light text-system-error text-xs font-semibold px-2 py-0.5 rounded-modo-button">
              Cancelada
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-text-gray truncate">
          {booking.court.name} · {booking.court.description}
        </p>
        <p className="text-xs sm:text-sm text-text-gray truncate">
          {formatDateLabel(booking.date)} · {formatSlotRange(booking.slots)}
        </p>
        <div className="flex items-end justify-between gap-2 mt-auto">
          <p className={`text-sm sm:text-base font-semibold ${totalColor}`}>
            ${formatPrice(booking.totalPrice)}
          </p>
          {variant === "upcoming" && onCancel && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel(booking);
              }}
              aria-label="Cancelar reserva"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-system-error hover:opacity-80 cursor-pointer transition-opacity"
            >
              <FontAwesomeIcon icon={faXmark} />
              <span>Cancelar</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
