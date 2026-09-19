import type { Dispatch, SetStateAction } from "react";

type AgeGroupSelectorProps = {
  value: string[];
  onChange: Dispatch<SetStateAction<string[]>>;
};

const AGE_GROUPS = [
  "NB",
  "0-3M",
  "3-6M",
  "6-12M",
  "1-2Y",
  "2-3Y",
  "3-4Y",
  "4-5Y",
  "5-6Y",
  "6-8Y",
  "8-10Y",
];

export default function AgeGroupSelector({
  value,
  onChange,
}: AgeGroupSelectorProps) {
  function toggleAgeGroup(ageGroup: string): void {
    onChange((current) => {
      if (current.includes(ageGroup)) {
        return current.filter(
          (item) => item !== ageGroup,
        );
      }

      return [...current, ageGroup];
    });
  }

  return (
    <section className="mt-8">
      <div>
        <h4 className="font-semibold">
          Age groups
        </h4>

        <p className="mt-1 text-xs text-black/50">
          Select all age groups available for this product.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {AGE_GROUPS.map((ageGroup) => {
          const selected =
            value.includes(ageGroup);

          return (
            <label
              key={ageGroup}
              className={`flex cursor-pointer items-center gap-3 border p-4 text-sm font-semibold transition ${
                selected
                  ? "border-[#D4AF37] bg-[#FFF9ED]"
                  : "border-black/10 bg-white hover:border-[#D4AF37]"
              }`}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  toggleAgeGroup(ageGroup)
                }
                className="h-4 w-4"
              />

              {ageGroup}
            </label>
          );
        })}
      </div>

      {value.length === 0 && (
        <p className="mt-3 text-xs text-red-600">
          Select at least one age group.
        </p>
      )}
    </section>
  );
}