"use client";

import { useMemo, useState } from "react";

type SpecItem = {
  label: string;
  value: string;
};

type SpecSection = {
  title: string;
  specs: SpecItem[];
};

type ProductDetailsPanelsProps = {
  primarySpecsTitle: string;
  importedBadge?: string;
  originalSpecLabel?: string;
  originalSpecHref?: string;
  primarySpecs: SpecItem[];
  secondarySpecs: SpecItem[];
  specSections: SpecSection[];
};

type PanelKey = "specs" | "reference";

export default function ProductDetailsPanels({
  primarySpecsTitle,
  importedBadge,
  originalSpecLabel,
  originalSpecHref,
  primarySpecs,
  secondarySpecs,
  specSections,
}: ProductDetailsPanelsProps) {
  const [activePanel, setActivePanel] = useState<PanelKey>("specs");
  const hasReference = Boolean(originalSpecHref || specSections.length > 0 || secondarySpecs.length > 0);

  const tabs = useMemo(
    () =>
      [
        { key: "specs" as const, label: "Specs" },
        { key: "reference" as const, label: "More" },
      ].filter((tab) => (tab.key === "reference" ? hasReference : true)),
    [hasReference],
  );

  return (
    <section className="mt-12 border-t border-gray-100 pt-8 sm:mt-16 sm:pt-10">
      <div className="sticky top-[112px] z-20 -mx-1 mb-6 overflow-x-auto px-1 pb-1 sm:top-[88px]">
        <div className="inline-grid min-w-full grid-flow-col gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1 shadow-sm">
          {tabs.map((tab) => {
            const isActive = activePanel === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActivePanel(tab.key)}
                className={`rounded-xl px-4 py-3 text-sm font-black uppercase tracking-[0.14em] transition lg:text-base ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {activePanel === "specs" ? (
        specSections.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {specSections.map((section) => (
              <div
                key={section.title}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-4 sm:px-6">
                  <h3 className="text-sm font-black uppercase tracking-[0.18em] text-gray-700 lg:text-base">
                    {section.title}
                  </h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {section.specs.map((spec) => (
                    <div
                      key={`${section.title}-${spec.label}`}
                      className="grid gap-2 px-4 py-4 md:grid-cols-[160px_1fr] md:items-start md:px-6"
                    >
                      <span className="text-xs font-black uppercase tracking-[0.15em] text-gray-400 lg:text-[13px]">
                        {spec.label}
                      </span>
                      <span className="text-sm font-semibold leading-relaxed text-gray-900 lg:text-base">
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[...primarySpecs, ...secondarySpecs].map((spec) => (
              <div
                key={spec.label}
                className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 lg:text-[11px]">
                  {spec.label}
                </p>
                <p className="mt-2 text-sm font-semibold leading-6 text-gray-900 lg:text-base lg:leading-7">
                  {spec.value}
                </p>
              </div>
            ))}
          </div>
        )
      ) : null}

      {activePanel === "reference" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          {secondarySpecs.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {secondarySpecs.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-2xl border border-gray-100 bg-white px-4 py-4 shadow-sm"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400 lg:text-[11px]">
                    {spec.label}
                  </p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-gray-900 lg:text-base lg:leading-7">
                    {spec.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-gray-50 px-5 py-6 text-sm leading-6 text-gray-500">
              No additional reference fields for this product.
            </div>
          )}

          <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="text-[11px] font-black uppercase tracking-[0.22em] text-gray-600 lg:text-xs">
              Reference
            </h3>
            {importedBadge ? (
              <span className="mt-4 inline-flex rounded-full bg-gray-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 lg:text-[11px]">
                {importedBadge}
              </span>
            ) : null}
            <p className="mt-4 text-sm leading-6 text-gray-500 lg:text-base lg:leading-7">
              Open the original source when you want to compare the stored sheet against the manufacturer page.
            </p>
            {originalSpecHref && originalSpecLabel ? (
              <a
                href={originalSpecHref}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center rounded-full bg-yellow-500 px-5 py-3 text-sm font-black text-black transition hover:bg-yellow-400 lg:text-base"
              >
                {originalSpecLabel}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
