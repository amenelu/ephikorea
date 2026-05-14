"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

type SearchSuggestion = {
  id: string;
  title: string;
  handle: string;
  subtitle?: string;
};

export function GlobalSearch({
  locale,
  placeholder,
  inputId,
  className,
  inputClassName,
}: {
  locale: string;
  placeholder: string;
  inputId: string;
  className: string;
  inputClassName: string;
}) {
  const router = useRouter();
  const formId = `${inputId}-form`;
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/search-suggestions?q=${encodeURIComponent(trimmedQuery)}&limit=5`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Unable to load suggestions.");
        }

        const data = (await response.json()) as {
          suggestions?: SearchSuggestion[];
        };

        setSuggestions(Array.isArray(data.suggestions) ? data.suggestions : []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [query]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      router.push(`/${locale}/search`);
      return;
    }

    setIsOpen(false);
    router.push(`/${locale}/search?q=${encodeURIComponent(trimmedQuery)}`);
  }

  function handleBlur() {
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 120);
  }

  function handleFocus() {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }

    setIsOpen(true);
  }

  const showSuggestions = isOpen && query.trim().length >= 2;

  return (
    <div className="relative">
      <form
        id={formId}
        action={`/${locale}/search`}
        method="get"
        className={className}
        onSubmit={handleSubmit}
      >
        <label htmlFor={inputId} className="sr-only">
          Search products
        </label>
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
        <input
          id={inputId}
          type="search"
          name="q"
          autoComplete="off"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={inputClassName}
        />
      </form>

      {showSuggestions ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-black/10">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : suggestions.length > 0 ? (
            <div className="py-2">
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion.id}
                  href={`/${locale}/products/${suggestion.handle}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 transition hover:bg-gray-50"
                >
                  <div className="text-sm font-semibold text-gray-900">
                    {suggestion.title}
                  </div>
                  {suggestion.subtitle ? (
                    <div className="mt-0.5 text-xs text-gray-500">
                      {suggestion.subtitle}
                    </div>
                  ) : null}
                </Link>
              ))}
              <button
                type="submit"
                form={formId}
                onMouseDown={(event) => event.preventDefault()}
                className="block w-full border-t border-gray-100 px-4 py-3 text-left text-sm font-semibold text-yellow-700 transition hover:bg-yellow-50"
              >
                View all results for &quot;{query.trim()}&quot;
              </button>
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No matching products.
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
