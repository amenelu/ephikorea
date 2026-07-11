"use client";

import { useRouter } from "next/navigation";

type BrandOption = {
  label: string;
  value: string;
};

type CollectionBrandFilterProps = {
  activeBrand?: string;
  activeCondition?: string;
  baseHref: string;
  options: BrandOption[];
};

export function CollectionBrandFilter({
  activeBrand = "all",
  activeCondition = "all",
  baseHref,
  options,
}: CollectionBrandFilterProps) {
  const router = useRouter();

  const handleBrandChange = (brand: string) => {
    const params = new URLSearchParams();

    if (activeCondition !== "all") {
      params.set("condition", activeCondition);
    }

    if (brand !== "all") {
      params.set("brand", brand);
    }

    const query = params.toString();
    router.push(query ? `${baseHref}?${query}` : baseHref);
  };

  return (
    <label className="block w-full max-w-xs">
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
        Brand
      </span>
      <select
        value={activeBrand}
        onChange={(event) => handleBrandChange(event.target.value)}
        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-700 outline-none transition focus:border-yellow-400"
      >
        <option value="all">All brands</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
