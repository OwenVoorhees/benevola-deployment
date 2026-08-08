import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  Btn, Chip, Field, Label, MiniMap, Mono, StateBlock, TextInput, Toast,
} from '../parts';
import { useOrgDetail } from '../../../data/hooks';
import { formatDateTime, formatFullDate, formatDuration, shortAddress } from '../../../data/format';
import {
  IconCalendar, IconClock, IconUsers, IconPin, IconMail, IconPhone,
  IconEdit, IconCheck, IconX,
} from '../../../Components/Icons';

function DefRow({ icon, label, children }) {
  return (
    <div className="mrd-defrow">
      <span className="mrd-defrow-icon">{icon}</span>
      <div>
        <Label>{label}</Label>
        <span className="mrd-defrow-val">{children}</span>
      </div>
    </div>
  );
}

function PostedEvent({ event }) {
  const addr = shortAddress(event.address);
  return (
    <Link className="mrd-maprow" to={`/events/${event.id}`}>
      <div>
        <Mono tone="signal"><IconCalendar size={11} /> {formatFullDate(event.date)}</Mono>
        <h3>{event.title}</h3>
        <div className="mrd-row-meta">
          <Chip solid><IconClock size={12} /> {formatDuration(event.duration)}</Chip>
          <Chip solid><IconUsers size={12} /> {event.capacity} volunteers</Chip>
          {addr && <Chip><IconPin size={12} /> {addr}</Chip>}
        </div>
        {event.tagObjects?.length > 0 && (
          <div className="mrd-row-meta">
            {event.tagObjects.map(t => <Chip key={t.id} tone="land">{t.name}</Chip>)}
          </div>
        )}
      </div>
      <div className="mrd-maprow-media">
        {event.heroImage && <img src={event.heroImage} alt="" />}
        <MiniMap lat={event.lat} lng={event.lng} />
      </div>
    </Link>
  );
}

export default function Org() {
  const { id } = useParams();
  const o = useOrgDetail(id);

  if (o.loading) {
    return <Shell><div className="mrd-shell"><StateBlock>Loading organization</StateBlock></div></Shell>;
  }

  if (o.error || !o.record) {
    return (
      <Shell>
        <div className="mrd-shell">
          <StateBlock error note="Check the organization id, or try again once the API is back up.">
            Could not load this organization
          </StateBlock>
        </div>
      </Shell>
    );
  }

  const org     = o.record;
  const draft   = o.draft;
  const editing = o.editing;
  const name    = editing ? (draft.name || 'Unnamed organization') : org.name;
  const initial = org.name?.[0]?.toUpperCase() ?? '?';

  return (
    <Shell>
      {editing && (
        <div className="mrd-edit-bar">
          <Mono><span className="mrd-edit-dot" />Editing organization · unsaved</Mono>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn sm variant="ghost" onClick={o.cancel}><IconX size={13} /> Discard</Btn>
            <Btn sm onClick={o.save}><IconCheck size={13} /> Save changes</Btn>
          </div>
        </div>
      )}

      <div className="mrd-shell">
        <Crumbs items={[
          { label: 'Home',          to: '/' },
          { label: 'Organizations', to: '/organizations' },
          { label: name },
        ]} />

        <div className="mrd-banner">
          {org.bannerImg
            ? <img className="mrd-banner-img" src={org.bannerImg} alt="" />
            : <div className="mrd-banner-blank" />}
          <div className="mrd-avatar">
            {org.iconImg ? <img src={org.iconImg} alt={org.name} /> : <span>{initial}</span>}
          </div>
          {!o.eventsLoading && (
            <div className="mrd-banner-stat">
              <b>{String(o.events.length).padStart(2, '0')}</b>
              <span>Open postings</span>
            </div>
          )}
        </div>

        <div className="mrd-profile-head">
          <div>
            {editing ? (
              <Field label="Organization name">
                <TextInput
                  large
                  value={draft.name ?? ''}
                  onChange={ev => o.setValue('name', ev.target.value)}
                  placeholder="Organization name"
                />
              </Field>
            ) : (
              <h1 className="mrd-h1">{org.name}</h1>
            )}
            <Mono className="mrd-since">
              <IconCalendar size={12} /> On Benevola since {new Date(org.createdAt).getFullYear()}
            </Mono>
          </div>

          {!editing && (
            <div className="mrd-profile-actions">
              <Btn sm><IconCalendar size={13} /> Create event</Btn>
              <Btn sm variant="ghost" onClick={o.startEdit}><IconEdit size={13} /> Edit</Btn>
            </div>
          )}
        </div>

        <div className="mrd-cols">
          <div>
            <Mono tone="signal">§ 01 About</Mono>
            <div style={{ marginTop: 16 }}>
              {editing ? (
                <Field label="Description">
                  <textarea
                    className="mrd-field"
                    rows={7}
                    value={draft.description ?? ''}
                    onChange={ev => o.setValue('description', ev.target.value)}
                  />
                </Field>
              ) : (
                <div className="mrd-prose">
                  <p>{org.description || 'This organization has not written a description yet.'}</p>
                </div>
              )}
            </div>

            <div className="mrd-ts">
              <div>
                <Label>Registered</Label>
                <span className="mrd-ts-val">{formatDateTime(org.createdAt)}</span>
              </div>
              <div>
                <Label>Last updated</Label>
                <span className="mrd-ts-val">{formatDateTime(org.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div>
            <Mono tone="signal">§ 02 Contact</Mono>
            <div style={{ marginTop: 16 }} className="mrd-deflist">
              <DefRow icon={<IconMail size={14} />} label="Email">
                {editing
                  ? <TextInput
                      type="email"
                      value={draft.email ?? ''}
                      onChange={ev => o.setValue('email', ev.target.value)}
                      placeholder="email@example.com"
                    />
                  : (org.email || <em>Not listed</em>)}
              </DefRow>
              <DefRow icon={<IconPhone size={14} />} label="Phone">
                {editing
                  ? <TextInput
                      type="tel"
                      value={draft.phone ?? ''}
                      onChange={ev => o.setValue('phone', ev.target.value)}
                      placeholder="555-000-0000"
                    />
                  : (org.phone || <em>Not listed</em>)}
              </DefRow>
              <DefRow icon={<IconPin size={14} />} label="Address">
                {editing
                  ? <TextInput
                      value={draft.address ?? ''}
                      onChange={ev => o.setValue('address', ev.target.value)}
                      placeholder="Street address"
                    />
                  : (org.address || <em>Not listed</em>)}
              </DefRow>
            </div>
          </div>
        </div>

        <div className="mrd-listing-head">
          <div>
            <Mono tone="signal">§ 03 Postings</Mono>
            <h2 className="mrd-h2" style={{ marginTop: 10 }}>Events</h2>
          </div>
          {!o.eventsLoading && (
            <Mono>{o.events.length} posted</Mono>
          )}
        </div>

        {o.eventsLoading ? (
          <StateBlock>Loading events</StateBlock>
        ) : o.events.length === 0 ? (
          <StateBlock note="When this organization posts a shift, it shows up here.">
            Nothing posted yet
          </StateBlock>
        ) : (
          <div className="mrd-rows">
            {o.events.map(ev => <PostedEvent key={ev.id} event={ev} />)}
          </div>
        )}
      </div>

      <Toast toast={o.toast} />
    </Shell>
  );
}
