"use client";

import { useEffect, useState } from "react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

type ProductFormFieldsProps = {
  initialBrandName?: string;
  initialModelName?: string;
  initialHandle?: string;
};

export default function ProductFormFields({
  initialBrandName = "",
  initialModelName = "",
  initialHandle = "",
}: ProductFormFieldsProps) {
  const [brandName, setBrandName] = useState(initialBrandName);
  const [modelName, setModelName] = useState(initialModelName);
  const [handle, setHandle] = useState(initialHandle);
  const [isHandleManual, setIsHandleManual] = useState(
    Boolean(initialHandle) &&
      initialHandle !== slugify(`${initialBrandName} ${initialModelName}`),
  );

  useEffect(() => {
    if (isHandleManual) {
      return;
    }

    setHandle(slugify(`${brandName} ${modelName}`));
  }, [brandName, modelName, isHandleManual]);

  return (
    <>
      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
          Brand Name
        </span>
        <input
          type="text"
          name="brandName"
          required
          value={brandName}
          onChange={(event) => setBrandName(event.target.value)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
          placeholder="Samsung"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
          Model
        </span>
        <input
          type="text"
          name="modelName"
          required
          value={modelName}
          onChange={(event) => setModelName(event.target.value)}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
          placeholder="Galaxy S24 Ultra"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-500">
          Handle
        </span>
        <input
          type="text"
          name="handle"
          value={handle}
          onChange={(event) => {
            setIsHandleManual(true);
            setHandle(event.target.value);
          }}
          className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-yellow-400"
          placeholder="auto-generated-from-brand-and-model"
        />
        <span className="mt-2 block text-xs text-gray-400">
          Auto-generated from brand and model. You can still edit it manually.
        </span>
      </label>
    </>
  );
}
