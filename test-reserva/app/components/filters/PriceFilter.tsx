"use client";

import { useSearchContext } from "../../context/SearchContext";
import { NumberStepper } from "../NumberStepper";

const PRICE_MIN = 0;
const PRICE_STEP = 500;

type Props = {
  onEnter: () => void;
};

export function PriceFilter({ onEnter }: Props) {
  const { maxPrice, setMaxPrice } = useSearchContext();

  return (
    <NumberStepper
      value={maxPrice}
      onChange={setMaxPrice}
      min={PRICE_MIN}
      step={PRICE_STEP}
      prefix="$"
      ariaLabel="Precio máximo"
      decrementAriaLabel="Bajar precio"
      incrementAriaLabel="Subir precio"
      inputWidthClass="w-36"
      onEnter={onEnter}
    />
  );
}
