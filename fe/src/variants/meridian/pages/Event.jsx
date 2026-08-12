import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  AddressField, Arrow, Btn, Chip, Field, Label, MapPlate, Mono,
  NumberInput, Plate, StateBlock, TextInput, TagPicker, Toast, SurveyMark,
} from '../parts';
import { useEventDetail, useTags } from '../../../data/hooks';
import { formatDate, formatDateTime, formatDuration, formatTime } from '../../../data/format';
import {
  IconCalendar, IconClock, IconUsers, IconEdit, IconCheck, IconX, IconCheckCircle,
} from '../../../Components/Icons';

/* ── Permit slip: date, hours, capacity, and the commitment ─────────── */
function Slip({ event, rsvped, onRsvp }) {
  const taken = event.capacity - event.spotsLeft;
  const pct   = Math.min(100, Math.round((taken / Math.max(1, event.capacity)) * 100));

  return (
    <Plate className="mrd-slip">
      <div className="mrd-slip-row">
        <Mono>Date</Mono>
        <span className={'mrd-slip-val' + (event.date ? '' : ' is-muted')}>
          {event.date ? formatDate(event.date) : 'Not yet set'}
        </span>
      </div>
      <div className="mrd-slip-row">
        <Mono>Start</Mono>
        <span className={'mrd-slip-val' + (event.date ? '' : ' is-muted')}>
          {event.date ? formatTime(event.date) : '—'}
        </span>
      </div>
      <div className="mrd-slip-row">
        <Mono>Duration</Mono>
        <span className="mrd-slip-val">{formatDuration(event.duration)}</span>
      </div>

      <div className="mrd-meter-wrap">
        <div className="mrd-meter-head">
          <Mono>Capacity</Mono>
          <Mono tone={pct > 85 ? 'signal' : undefined}>{event.spotsLeft} of {event.capacity} left</Mono>
        </div>
        <div className="mrd-meter">
          <div
            className={'mrd-meter-fill' + (pct > 85 ? ' is-tight' : '')}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mrd-meter-foot">
          <Mono>{pct}% filled</Mono>
          <Mono>{event.capacity} volunteers</Mono>
        </div>
      </div>

      <Btn block variant={rsvped ? 'ghost' : undefined} onClick={onRsvp} style={{ marginTop: 20 }}>
        {rsvped ? <><IconX size={14} /> Cancel RSVP</> : <><IconCheckCircle size={15} /> Sign on</>}
      </Btn>

      {rsvped && (
        <div className="mrd-slip-confirm">
          <IconCheck size={13} /> You are on the roster
        </div>
      )}
    </Plate>
  );
}

export default function Event() {
  const { id } = useParams();
  const e      = useEventDetail(id);
  const tags   = useTags();

  if (e.loading) {
    return <Shell><div className="mrd-shell"><StateBlock>Loading event</StateBlock></div></Shell>;
  }

  if (e.error || !e.record) {
    return (
      <Shell>
        <div className="mrd-shell">
          <StateBlock error note="Check the event id, or try again once the API is back up.">
            Could not load this event
          </StateBlock>
        </div>
      </Shell>
    );
  }

  const event   = e.record;
  const draft   = e.draft;
  const editing = e.editing;
  const title   = editing ? (draft.title || 'Untitled event') : event.title;
  const lat     = editing ? draft.lat : event.lat;
  const lng     = editing ? draft.lng : event.lng;
  const address = editing ? draft.address : event.address;

  return (
    <Shell>
      {editing && (
        <div className="mrd-edit-bar">
          <Mono>
            <span className="mrd-edit-dot" />
            {e.saveError ? e.saveError : 'Editing event · unsaved'}
          </Mono>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn sm variant="ghost" onClick={e.cancel} disabled={e.saving}>
              <IconX size={13} /> Discard
            </Btn>
            <Btn sm onClick={e.save} disabled={e.saving}>
              <IconCheck size={13} /> {e.saving ? 'Saving…' : 'Save changes'}
            </Btn>
          </div>
        </div>
      )}

      <div className="mrd-shell">
        <Crumbs items={[
          { label: 'Home',   to: '/' },
          { label: 'Events', to: '/events' },
          { label: title },
        ]} />

        <div className="mrd-detail-head">
          <div>
            <Link className="mrd-detail-org" to={`/organizations/${event.organizationId}`}>
              <SurveyMark size={14} />
              {e.orgName ?? `Organization ${event.organizationId}`}
            </Link>
            <h1 className="mrd-h1">{title}</h1>
          </div>
          {/* Only the organization that owns this event may edit it. */}
          {!editing && e.canEdit && (
            <Btn sm variant="ghost" onClick={e.startEdit}><IconEdit size={13} /> Edit</Btn>
          )}
        </div>

        <Plate className="mrd-detail-hero" flat>
          {event.heroImage
            ? <img src={event.heroImage} alt={event.title} />
            : <div className="mrd-thumb-blank" />}
        </Plate>

        <div className="mrd-detail-grid">
          {/* ── Main column ── */}
          <div>
            {editing ? (
              <>
                <Field label="Event title">
                  <TextInput
                    large
                    value={draft.title ?? ''}
                    onChange={ev => e.setValue('title', ev.target.value)}
                    placeholder="Event name"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    className="mrd-field"
                    rows={7}
                    value={draft.description ?? ''}
                    onChange={ev => e.setValue('description', ev.target.value)}
                  />
                </Field>

                <Field label="Location">
                  <AddressField
                    value={draft.address ?? ''}
                    onTextChange={val => e.setValue('address', val)}
                    onPick={(label, plat, plng) => e.patch({ address: label, lat: plat, lng: plng })}
                    placeholder="Search an address"
                  />
                </Field>

                <div className="mrd-form-row">
                  <Label>Causes</Label>
                  <TagPicker
                    tags={tags.tags}
                    loading={tags.loading}
                    selected={draft.tags ?? []}
                    onToggle={slug => e.setValue(
                      'tags',
                      (draft.tags ?? []).includes(slug)
                        ? draft.tags.filter(s => s !== slug)
                        : [...(draft.tags ?? []), slug]
                    )}
                  />
                </div>

                <div className="mrd-edit-pair mrd-form-row">
                  <div>
                    <Label>Duration</Label>
                    <NumberInput
                      value={draft.duration}
                      onChange={v => e.setValue('duration', v)}
                      min={0.5}
                      suffix="hours"
                    />
                  </div>
                  <div>
                    <Label>Capacity</Label>
                    <NumberInput
                      value={draft.capacity}
                      onChange={v => e.setValue('capacity', v)}
                      min={1}
                      suffix="volunteers"
                    />
                  </div>
                </div>

                <Field label="Date and time">
                  <TextInput
                    type="datetime-local"
                    value={draft.date ? draft.date.slice(0, 16) : ''}
                    onChange={ev => e.setValue(
                      'date',
                      ev.target.value ? new Date(ev.target.value).toISOString() : ''
                    )}
                  />
                </Field>
              </>
            ) : (
              <>
                {event.tags?.length > 0 && (
                  <div className="mrd-tagrow">
                    {event.tags.map(slug => (
                      <Chip key={slug} tone="land">{tags.nameOf(slug)}</Chip>
                    ))}
                  </div>
                )}

                <div className="mrd-metarow">
                  <Chip solid><IconCalendar size={13} /> {formatDate(event.date)}</Chip>
                  <Chip solid><IconClock size={13} /> {formatDuration(event.duration)}</Chip>
                  <Chip tone="signal"><IconUsers size={13} /> {event.spotsLeft} of {event.capacity} spots left</Chip>
                </div>

                <div className="mrd-prose">
                  {(event.description || 'No description was posted for this event.')
                    .split('\n\n')
                    .map((para, i) => <p key={i}>{para}</p>)}
                </div>

                <div className="mrd-ts">
                  <div>
                    <Label>Posted</Label>
                    <span className="mrd-ts-val">{formatDateTime(event.createdAt)}</span>
                  </div>
                  <div>
                    <Label>Last updated</Label>
                    <span className="mrd-ts-val">{formatDateTime(event.updatedAt)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 32 }}>
                  <Link className="mrd-link" to={`/organizations/${event.organizationId}`}>
                    See everything this organization has posted <Arrow />
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* ── Aside ── */}
          <div className="mrd-detail-aside">
            {!editing && <Slip event={event} rsvped={e.rsvped} onRsvp={e.toggleRsvp} />}
            <MapPlate
              lat={lat}
              lng={lng}
              address={address}
              editing={editing}
              onPick={(label, plat, plng) => e.patch({ address: label, lat: plat, lng: plng })}
            />
          </div>
        </div>
      </div>

      <Toast toast={e.toast} />
    </Shell>
  );
}
