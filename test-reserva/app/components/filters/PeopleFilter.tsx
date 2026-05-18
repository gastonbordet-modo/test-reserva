"use client";

import { useSearchContext } from "../../context/SearchContext";
import { NumberStepper } from "../NumberStepper";

const PEOPLE_MIN = 1;

type Props = {
  onEnter: () => void;
};

export function PeopleFilter({ onEnter }: Props) {
  const { people, setPeople } = useSearchContext();

  return (
    <NumberStepper
      value={people}
      onChange={setPeople}
      min={PEOPLE_MIN}
      ariaLabel="Cantidad de personas"
      decrementAriaLabel="Restar persona"
      incrementAriaLabel="Sumar persona"
      inputWidthClass="w-24"
      onEnter={onEnter}
    />
  );
}
