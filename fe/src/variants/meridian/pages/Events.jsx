import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import { AddressField, Chip, Label, Mono, StateBlock, TagPicker } from '../parts';
import { useEventsSearch, useTags } from '../../../data/hooks';
import { formatDuration, splitDate, truncate } from '../../../data/format';
import { IconClock, IconSearch, IconX, IconUsers } from '../../../Components/Icons';

/* ── One entry in the index ─────────────────────────────────────────── */
function EventRow({ event, orgName }) {
  const { day, month, weekday } = splitDate(event.date);
  const visible  = event.tagObjects.slice(0, 3);
  const overflow = event.tagObjects.length - visible.length;

  return (
    <Link className="mrd-row" to={`/events/${event.id}`}>
      <div className="mrd-datemark">
        <span className="mrd-datemark-day">{day}</span>
        <span className="mrd-datemark-mon">{month}</span>
        <span className="mrd-datemark-wd">{weekday}</span>
      </div>

      <div>
        <span className="mrd-row-org">{orgName ?? `Org ${event.organizationId}`}</span>
        <h3>{event.title}</h3>
        {event.description && <p className="mrd-row-desc">{event.description}</p>}

        <div className="mrd-row-meta">
          <Chip solid><IconClock size={12} /> {formatDuration(event.duration)}</Chip>
          <Chip solid><IconUsers size={12} /> {event.capacity} needed</Chip>
          {visible.map(t => <Chip key={t.id} tone="land">{t.name}</Chip>)}
          {overflow > 0 && <Chip>+{overflow}</Chip>}
        </div>
      </div>

      <div className="mrd-row-thumb">
        {event.heroImage
          ? <img src={event.heroImage} alt="" />
          : <div className="mrd-thumb-blank" />}
        {event.address && (
          <span className="mrd-row-addr">{truncate(event.address, 46)}</span>
        )}
      </div>
    </Link>
  );
}

/* ── Page ───────────────────────────────────────────────────────────── */
export default function Events() {
  const s    = useEventsSearch();
  const tags = useTags();
  const resultsRef = useRef(null);

  useEffect(() => {
    if (s.page > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [s.page]);

  const countLabel = s.total !== null
    ? (s.total > s.limit
        ? `${s.rangeStart}–${s.rangeEnd} of ${s.total} events`
        : `${s.total} event${s.total !== 1 ? 's' : ''}`)
    : `Sheet ${s.page + 1}`;

  return (
    <Shell>
      <div className="mrd-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Events' }]} />

        <div className="mrd-page-head">
          <div>
            <Mono tone="signal">§ Opportunities</Mono>
            <h1 className="mrd-h1" style={{ marginTop: 12 }}>Find opportunities</h1>
            <p>Volunteer shifts posted by verified organizations near you.</p>
          </div>

          <div className="mrd-searchbar">
            <input
              type="search"
              placeholder="Search events by keyword"
              value={s.draft.keyword}
              autoComplete="off"
              onChange={e => s.setField('keyword', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && s.search()}
              aria-label="Search events"
            />
            <button onClick={s.search}><IconSearch size={14} /> Search</button>
          </div>
        </div>

        <div className="mrd-index-layout">
          {/* ── Filter rail ── */}
          <aside className="mrd-rail">
            <div className="mrd-rail-head">
              <Mono>Filters</Mono>
              {s.hasFilters && (
                <button className="mrd-rail-clear" onClick={s.reset}>Clear all</button>
              )}
            </div>

            <div className="mrd-rail-group">
              <Label>Causes</Label>
              <TagPicker
                tags={tags.tags}
                loading={tags.loading}
                selected={s.draft.selectedTags}
                onToggle={s.toggleTag}
              />
            </div>

            <div className="mrd-rail-group">
              <Label>Date</Label>
              <div className="mrd-rail-pair">
                <div>
                  <span className="mrd-sublabel">From</span>
                  <input
                    type="date"
                    className="mrd-field"
                    value={s.draft.dateFrom}
                    onChange={e => s.setField('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <span className="mrd-sublabel">To</span>
                  <input
                    type="date"
                    className="mrd-field"
                    value={s.draft.dateTo}
                    onChange={e => s.setField('dateTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mrd-rail-group">
              <Label>Time of day</Label>
              <div className="mrd-rail-pair">
                <div>
                  <span className="mrd-sublabel">From</span>
                  <input
                    type="time"
                    className="mrd-field"
                    value={s.draft.timeFrom}
                    onChange={e => s.setField('timeFrom', e.target.value)}
                  />
                </div>
                <div>
                  <span className="mrd-sublabel">To</span>
                  <input
                    type="time"
                    className="mrd-field"
                    value={s.draft.timeTo}
                    onChange={e => s.setField('timeTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="mrd-rail-group">
              <Label>Origin</Label>
              {s.draft.locationLat ? (
                <div className="mrd-picked">
                  <span className="mrd-picked-text">{s.locationLabel}</span>
                  <button className="mrd-chip-x" onClick={s.clearLocation} aria-label="Clear location">
                    <IconX size={12} />
                  </button>
                </div>
              ) : (
                <AddressField
                  value={s.locationLabel}
                  onTextChange={s.setLocationLabel}
                  onPick={s.setLocation}
                />
              )}

              {s.draft.locationLat && (
                <div className="mrd-radius">
                  <div className="mrd-radius-head">
                    <span className="mrd-sublabel">Radius</span>
                    <Mono tone="signal">{s.draft.radiusMi} mi</Mono>
                  </div>
                  <input
                    type="range"
                    className="mrd-range"
                    min="1" max="100" step="1"
                    value={s.draft.radiusMi}
                    style={{ '--pct': `${((s.draft.radiusMi - 1) / 99) * 100}%` }}
                    onChange={e => s.setField('radiusMi', Number(e.target.value))}
                  />
                  <div className="mrd-radius-ticks"><span>1 mi</span><span>100 mi</span></div>
                </div>
              )}
            </div>

            <div className="mrd-rail-group">
              <Label>Order</Label>
              <div className="mrd-rail-pair">
                <select
                  className="mrd-field"
                  value={s.draft.sort}
                  onChange={e => s.setField('sort', e.target.value)}
                  aria-label="Sort field"
                >
                  <option value="date">By date</option>
                  <option value="createdAt">By newest</option>
                </select>
                <select
                  className="mrd-field"
                  value={s.draft.order}
                  onChange={e => s.setField('order', e.target.value)}
                  aria-label="Sort direction"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>

            {s.validationError && <div className="mrd-rail-error">{s.validationError}</div>}

            <button className="mrd-btn mrd-btn--block" onClick={s.search}>
              <IconSearch size={14} /> Apply filters
            </button>
          </aside>

          {/* ── Results ── */}
          <div ref={resultsRef}>
            {s.loading ? (
              <StateBlock>Surveying</StateBlock>
            ) : s.error ? (
              <StateBlock error note="The API is not answering right now. Filters and layout still work.">
                Could not load events
              </StateBlock>
            ) : s.events.length === 0 ? (
              <StateBlock note="Widen the radius or clear a filter or two.">Nothing on this sheet</StateBlock>
            ) : (
              <>
                <div className="mrd-results-bar">
                  <Mono>{countLabel}</Mono>
                  <label className="mrd-perpage">
                    <Mono>Per sheet</Mono>
                    <select
                      className="mrd-field"
                      value={s.draft.limit}
                      onChange={e => s.setLimit(Number(e.target.value))}
                    >
                      {[4, 8, 12, 16, 20].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </label>
                </div>

                <div className="mrd-rows">
                  {s.events.map(evt => (
                    <EventRow
                      key={evt.id}
                      event={evt}
                      orgName={s.orgNames[evt.organizationId] ?? null}
                    />
                  ))}
                </div>

                {(s.page > 0 || s.hasMore) && (
                  <div className="mrd-pager">
                    <button
                      className="mrd-btn mrd-btn--ghost mrd-btn--sm"
                      disabled={s.page === 0}
                      onClick={() => s.setPage(p => p - 1)}
                    >
                      ← Previous
                    </button>

                    <div className="mrd-pager-nums">
                      {s.totalPages !== null
                        ? Array.from({ length: s.totalPages }, (_, i) => (
                            <button
                              key={i}
                              className={'mrd-pager-num' + (i === s.page ? ' is-on' : '')}
                              onClick={() => s.setPage(i)}
                            >
                              {String(i + 1).padStart(2, '0')}
                            </button>
                          ))
                        : <Mono>Sheet {s.page + 1}</Mono>}
                    </div>

                    <button
                      className="mrd-btn mrd-btn--ghost mrd-btn--sm"
                      disabled={!s.hasMore}
                      onClick={() => s.setPage(p => p + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
