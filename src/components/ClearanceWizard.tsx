import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  buildWizardHash,
  parseWizardHash,
  readStoredChecks,
  writeStoredChecks,
  type WizardRequestView,
} from '../lib/wizard';

interface ClearanceWizardProps {
  requests: WizardRequestView[];
}

type ChecksByRequest = Record<string, number[]>;

function normalizeIndices(indices: readonly number[], max: number): number[] {
  return [...new Set(indices.filter((i) => Number.isSafeInteger(i) && i >= 0 && i < max))].sort(
    (a, b) => a - b,
  );
}

export default function ClearanceWizard({ requests }: ClearanceWizardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checks, setChecks] = useState<ChecksByRequest>({});
  const [mounted, setMounted] = useState(false);

  const validIds = useMemo(() => new Set(requests.map((r) => r.id)), [requests]);
  const selected = useMemo(
    () => requests.find((r) => r.id === selectedId) ?? null,
    [requests, selectedId],
  );

  const applyHash = useCallback(
    (hash: string, stored: ChecksByRequest) => {
      const parsed = parseWizardHash(hash, validIds);
      if (!parsed) {
        setChecks(stored);
        setSelectedId(null);
        return;
      }
      const shared = parsed.checked;
      const merged = { ...stored };
      if (shared.length > 0) {
        const request = requests.find((r) => r.id === parsed.requestId);
        const max = request?.requirements.length ?? 0;
        merged[parsed.requestId] = normalizeIndices(
          [...(stored[parsed.requestId] ?? []), ...shared],
          max,
        );
      }
      setChecks(merged);
      setSelectedId(parsed.requestId);
    },
    [requests, validIds],
  );

  useEffect(() => {
    setMounted(true);
    applyHash(window.location.hash, readStoredChecks());

    const onHashChange = () => applyHash(window.location.hash, readStoredChecks());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [applyHash]);

  const replaceHash = useCallback((hash: string) => {
    const url = `${window.location.pathname}${hash}`;
    window.history.replaceState(null, '', url);
  }, []);

  const selectRequest = useCallback(
    (id: string) => {
      setSelectedId(id);
      replaceHash(buildWizardHash(id, checks[id] ?? []));
    },
    [checks, replaceHash],
  );

  const backToPicker = useCallback(() => {
    setSelectedId(null);
    replaceHash('');
  }, [replaceHash]);

  const toggleItem = useCallback((requestId: string, index: number, max: number) => {
    setChecks((prev) => {
      const current = prev[requestId] ?? [];
      const next = current.includes(index)
        ? current.filter((i) => i !== index)
        : normalizeIndices([...current, index], max);
      const updated = { ...prev, [requestId]: next };
      writeStoredChecks(updated);
      return updated;
    });
  }, []);

  // Keep URL hash in sync with checked state for the selected request.
  useEffect(() => {
    if (!mounted || !selectedId) return;
    const current = parseWizardHash(window.location.hash, validIds);
    const desired = buildWizardHash(selectedId, checks[selectedId] ?? []);
    if (!current || current.requestId !== selectedId || current.checked.join(',') !== (checks[selectedId] ?? []).join(',')) {
      replaceHash(desired);
    }
  }, [checks, mounted, selectedId, validIds, replaceHash]);

  const resetRequest = useCallback(() => {
    if (!selectedId) return;
    setChecks((prev) => {
      const updated = { ...prev, [selectedId]: [] };
      writeStoredChecks(updated);
      return updated;
    });
  }, [selectedId]);

  if (requests.length === 0) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface-subtle p-4 text-sm text-ink-secondary">
        No document requests are listed yet. Check back after more guides publish their
        requirements.
      </p>
    );
  }

  if (!mounted) {
    // Deterministic pre-hydration shell: request picker grid.
    return (
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Document requests">
        {requests.map((request) => (
          <li
            key={request.id}
            className="rounded-xl border border-border-subtle bg-surface-card p-5"
          >
            <p className="font-heading text-base font-semibold text-ink-primary">
              {request.title}
            </p>
            {request.summary ? (
              <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
                {request.summary}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    );
  }

  if (!selected) {
    return (
      <div>
        <p className="mb-4 text-sm leading-relaxed text-ink-secondary">
          Pick the request you are preparing for. Check off each requirement as you
          gather it — your progress saves on this device only.
        </p>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2" aria-label="Document requests">
          {requests.map((request) => {
            const done = checks[request.id]?.length ?? 0;
            const total = request.requirements.length;
            return (
              <li key={request.id}>
                <button
                  type="button"
                  onClick={() => selectRequest(request.id)}
                  className="group flex h-full w-full flex-col justify-between rounded-xl border border-border-subtle bg-surface-card p-5 text-left transition-colors duration-150 hover:border-brand-crimson focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson"
                >
                  <span>
                    <span className="block font-heading text-base font-semibold leading-snug text-ink-primary transition-colors duration-150 group-hover:text-brand-crimson">
                      {request.title}
                    </span>
                    {request.summary ? (
                      <span className="mt-1.5 block text-sm leading-relaxed text-ink-secondary">
                        {request.summary}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-ink-muted">
                      {done > 0 ? `${done} of ${total} checked` : `${total} requirements`}
                    </span>
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-base font-semibold text-brand-crimson transition-all duration-150 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const checkedIndices = checks[selected.id] ?? [];
  const doneCount = checkedIndices.length;
  const totalCount = selected.requirements.length;
  const guideHref = `/articles/${selected.articleSlug}${
    selected.guideAnchor ? `#${selected.guideAnchor}` : ''
  }`;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={backToPicker}
          className="text-sm font-medium text-brand-crimson hover:text-brand-crimson-hover hover:underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson rounded-sm"
        >
          ← All requests
        </button>
        <button
          type="button"
          onClick={resetRequest}
          disabled={doneCount === 0}
          className="text-sm font-medium text-ink-secondary hover:text-brand-crimson disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-ink-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson rounded-sm"
        >
          Reset checklist
        </button>
      </div>

      <div className="rounded-xl border border-border-subtle bg-surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-heading text-xl font-bold text-ink-primary">{selected.title}</h2>
          <p
            aria-live="polite"
            className={`text-sm font-semibold ${
              doneCount === totalCount ? 'text-brand-crimson' : 'text-ink-secondary'
            }`}
          >
            {doneCount} of {totalCount} checked
          </p>
        </div>
        {selected.summary ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary">{selected.summary}</p>
        ) : null}

        {(selected.office || selected.fee || selected.processingTime) && (
          <dl className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-surface-subtle p-4 text-sm sm:grid-cols-3">
            {selected.office ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Office
                </dt>
                <dd className="mt-0.5 text-ink-primary">{selected.office}</dd>
              </div>
            ) : null}
            {selected.fee ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Fee
                </dt>
                <dd className="mt-0.5 text-ink-primary">{selected.fee}</dd>
              </div>
            ) : null}
            {selected.processingTime ? (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                  Processing time
                </dt>
                <dd className="mt-0.5 text-ink-primary">{selected.processingTime}</dd>
              </div>
            ) : null}
          </dl>
        )}

        <ul className="mt-5 space-y-1">
          {selected.requirements.map((req, index) => {
            const checked = checkedIndices.includes(index);
            return (
              <li key={`${selected.id}-${index}`}>
                <label className="flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-surface-subtle">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(selected.id, index, totalCount)}
                    className="mt-1 h-4 w-4 shrink-0 accent-brand-crimson"
                  />
                  <span className="min-w-0">
                    <span
                      className={`block text-sm font-medium leading-snug ${
                        checked ? 'text-ink-secondary' : 'text-ink-primary'
                      }`}
                    >
                      {req.label}
                    </span>
                    {req.note ? (
                      <span className="mt-0.5 block text-sm leading-relaxed text-ink-secondary">
                        {req.note}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>

        <aside
          aria-label="Verification notice"
          className="mt-5 rounded-xl border border-border-subtle bg-surface-subtle p-4 text-sm text-ink-secondary"
        >
          <p className="leading-relaxed">
            Fees, requirements, and schedules change across Academic Years. Always verify
            final details with the issuing office before your visit. Progress is saved on
            this device only — share this page&apos;s link to send someone your checklist.
          </p>
        </aside>

        <p className="mt-4 text-sm">
          <a
            href={guideHref}
            className="font-medium text-brand-crimson hover:text-brand-crimson-hover hover:underline underline-offset-2 transition-colors"
          >
            Read the full guide: {selected.articleTitle} →
          </a>
        </p>
      </div>
    </div>
  );
}
