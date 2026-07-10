import Link from "next/link";
import {
  Footprints,
  Headphones,
  Laptop,
  Package,
  Sparkles,
  Smartphone,
  Watch,
} from "lucide-react";

import { buildPageMetadata } from "@/lib/seo";
import { getTranslator } from "@/lib/translations";
import { LifestyleFlipLink } from "./lifestyle-flip-link";

export const dynamic = "force-dynamic";

type CollectionsPageProps = {
  params: { locale: string };
};

export function generateMetadata({ params: { locale } }: CollectionsPageProps) {
  return buildPageMetadata({
    locale,
    pathname: "/collections",
    title: "Collections",
    description:
      "Browse Aman Mobiles by category, including phones, audio, computing, wearables, accessories, skincare, and shoes.",
  });
}

export default async function CollectionsPage({
  params: { locale },
}: CollectionsPageProps) {
  const t = getTranslator(locale);
  const collections = [
    {
      title: t("collections.phonesTitle"),
      description: t("collections.phonesDescription"),
      href: `/${locale}/collections/phones`,
      cta: t("collections.phonesCta"),
      icon: Smartphone,
    },
    {
      title: t("collections.audioTitle"),
      description: t("collections.audioDescription"),
      href: `/${locale}/collections/audio`,
      cta: t("collections.audioCta"),
      icon: Headphones,
    },
    {
      title: t("collections.computingTitle"),
      description: t("collections.computingDescription"),
      href: `/${locale}/collections/computing`,
      cta: t("collections.computingCta"),
      icon: Laptop,
    },
    {
      title: t("collections.wearablesTitle"),
      description: t("collections.wearablesDescription"),
      href: `/${locale}/collections/wearables`,
      cta: t("collections.wearablesCta"),
      icon: Watch,
    },
    {
      title: t("collections.accessoriesTitle"),
      description: t("collections.accessoriesDescription"),
      href: `/${locale}/collections/accessories`,
      cta: t("collections.accessoriesCta"),
      icon: Package,
    },
    {
      title: t("collections.skincareTitle"),
      description: t("collections.skincareDescription"),
      href: `/${locale}/collections/lifestyle`,
      cta: t("collections.skincareCta"),
      icon: Sparkles,
      side: "lifestyle",
    },
    {
      title: t("collections.shoesTitle"),
      description: t("collections.shoesDescription"),
      href: `/${locale}/collections/lifestyle`,
      cta: t("collections.shoesCta"),
      icon: Footprints,
      side: "lifestyle",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <section className="border-b border-gray-100 pb-8 sm:pb-10">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-yellow-600">
          {t("collections.eyebrow")}
        </p>
        <h1 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
          {t("collections.title")}{" "}
          <span className="text-yellow-500">
            {t("collections.titleAccent")}
          </span>
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-gray-500 sm:text-base lg:text-lg">
          {t("collections.description")}
        </p>
        <p className="mt-4 text-sm text-gray-500">
          {t("collections.categorySummary")}
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {collections.map((collection) => {
          const CardLink =
            collection.side === "lifestyle" ? LifestyleFlipLink : Link;
          const cardKey =
            collection.side === "lifestyle"
              ? `${collection.title}-${collection.href}`
              : collection.href;

          return (
            <CardLink
              key={cardKey}
              href={collection.href}
              className="group rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-yellow-600">
                <collection.icon className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-xl font-black text-gray-900 sm:mt-6 sm:text-2xl">
                {collection.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                {collection.description}
              </p>
              <div className="mt-6 text-sm font-bold text-yellow-600 transition-colors group-hover:text-yellow-700 sm:mt-8">
                {collection.cta}
              </div>
            </CardLink>
          );
        })}
      </section>
    </div>
  );
}
