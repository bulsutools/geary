import { useEffect, useMemo, useState } from 'react';
import { formatLocalDateKey, pickDailyItems } from '../lib/articles';

export interface ExploreItem {
  slug: string;
  title: string;
  preview: string;
}

interface ExploreSpotlightProps {
  items: readonly ExploreItem[];
  initialDateKey: string;
  count?: number;
}

export default function ExploreSpotlight({
  items,
  initialDateKey,
  count = 3,
}: ExploreSpotlightProps) {
  const [dateKey, setDateKey] = useState(initialDateKey);

  useEffect(() => {
    const todayKey = formatLocalDateKey(new Date());
    if (todayKey !== initialDateKey) {
      setDateKey(todayKey);
    }
  }, [initialDateKey]);

  const picks = useMemo(
    () => pickDailyItems(items, dateKey, count, 0),
    [items, dateKey, count],
  );

  if (picks.length === 0) return null;

  return (
    <section aria-labelledby="featured-guides-heading" className="py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2
            id="featured-guides-heading"
            className="font-heading text-xl sm:text-2xl font-bold text-ink-primary"
          >
            Featured
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {picks.map((item) => (
            <a
              key={item.slug}
              href={`/articles/${item.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-border-subtle bg-white p-5 transition-colors duration-150 hover:border-brand-crimson"
            >
              <h3 className="font-heading text-base font-semibold leading-snug text-ink-primary transition-colors duration-150 group-hover:text-brand-crimson">
                {item.title}
              </h3>

              <div className="mt-1.5 flex items-end justify-between gap-3">
                <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-ink-secondary">
                  {item.preview}
                </p>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-base font-semibold leading-none text-brand-crimson transition-all duration-150 group-hover:translate-x-0.5 group-hover:text-brand-crimson-hover"
                >
                  →
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
