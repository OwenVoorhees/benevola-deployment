import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  Btn, Chip, Field, Label, MiniMap, Mono, StateBlock, TextInput, Toast, Arrow,
} from '../parts';
import { useUserDetail } from '../../../data/hooks';
import {
  formatDateTime, formatFullDate, formatDuration, shortAddress, splitDate, truncate,
} from '../../../data/format';
import {
  IconCalendar, IconClock, IconUsers, IconPin, IconMail, IconUser,
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

function BookedEvent({ event }) {
  const { day, month, weekday } = splitDate(event.date);
  const addr = shortAddress(event.address);

  return (
    <Link className="mrd-maprow" to={`/events/${event.id}`}>
      <div style={{ display: 'grid', gridTemplateColumns: '66px 1fr', gap: 20 }}>
        <div className="mrd-datemark">
          <span className="mrd-datemark-day">{day}</span>
          <span className="mrd-datemark-mon">{month}</span>
          <span className="mrd-datemark-wd">{weekday}</span>
        </div>
        <div>
          <Mono>{formatFullDate(event.date)}</Mono>
          <h3>{event.title}</h3>
          {event.description && (
            <p className="mrd-row-desc">{truncate(event.description, 150)}</p>
          )}
          <div className="mrd-row-meta">
            <Chip solid><IconClock size={12} /> {formatDuration(event.duration)}</Chip>
            <Chip solid><IconUsers size={12} /> {event.capacity} volunteers</Chip>
            {addr && <Chip><IconPin size={12} /> {addr}</Chip>}
          </div>
        </div>
      </div>
      <div className="mrd-maprow-media">
        {event.heroImage && <img src={event.heroImage} alt="" />}
        <MiniMap lat={event.lat} lng={event.lng} />
      </div>
    </Link>
  );
}

export default function Volunteer() {
  const { id } = useParams();
  const u = useUserDetail(id);

  if (u.loading) {
    return <Shell><div className="mrd-shell"><StateBlock>Loading profile</StateBlock></div></Shell>;
  }

  if (u.error || !u.record) {
    return (
      <Shell>
        <div className="mrd-shell">
          <StateBlock error note="Check the profile id, or try again once the API is back up.">
            Could not load this profile
          </StateBlock>
        </div>
      </Shell>
    );
  }

  const user    = u.record;
  const draft   = u.draft;
  const editing = u.editing;
  const name    = user.displayName || user.username;
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const hours   = u.events.reduce((sum, ev) => sum + (ev.duration || 0), 0);

  return (
    <Shell>
      {editing && (
        <div className="mrd-edit-bar">
          <Mono><span className="mrd-edit-dot" />Editing profile · unsaved</Mono>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn sm variant="ghost" onClick={u.cancel}><IconX size={13} /> Discard</Btn>
            <Btn sm onClick={u.save}><IconCheck size={13} /> Save changes</Btn>
          </div>
        </div>
      )}

      <div className="mrd-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: name }]} />

        <div className="mrd-banner">
          <div className="mrd-banner-blank" />
          <div className="mrd-avatar">
            {user.profilePic ? <img src={user.profilePic} alt={name} /> : <span>{initial}</span>}
          </div>
          {!u.eventsLoading && u.events.length > 0 && (
            <div className="mrd-banner-stat">
              <b>{formatDuration(hours)}</b>
              <span>Booked ahead</span>
            </div>
          )}
        </div>

        <div className="mrd-profile-head">
          <div>
            {editing ? (
              <Field label="Display name">
                <TextInput
                  large
                  value={draft.displayName ?? ''}
                  onChange={ev => u.setValue('displayName', ev.target.value)}
                  placeholder="Your display name"
                />
              </Field>
            ) : (
              <h1 className="mrd-h1">{name}</h1>
            )}
            <Mono className="mrd-since">
              <IconCalendar size={12} /> On Benevola since {new Date(user.createdAt).getFullYear()}
            </Mono>
          </div>

          {!editing && (
            <div className="mrd-profile-actions">
              <Btn sm variant="ghost" onClick={u.startEdit}><IconEdit size={13} /> Edit profile</Btn>
            </div>
          )}
        </div>

        <div className="mrd-cols">
          <div>
            <Mono tone="signal">§ 01 Account</Mono>
            <div style={{ marginTop: 16 }} className="mrd-deflist">
              <DefRow icon={<IconMail size={14} />} label="Email">
                {editing
                  ? <TextInput
                      type="email"
                      value={draft.email ?? ''}
                      onChange={ev => u.setValue('email', ev.target.value)}
                      placeholder="you@example.com"
                    />
                  : (user.email || <em>Not set</em>)}
              </DefRow>
              <DefRow icon={<IconUser size={14} />} label="Username">
                {editing
                  ? <TextInput
                      value={draft.username ?? ''}
                      onChange={ev => u.setValue('username', ev.target.value)}
                      placeholder="username"
                    />
                  : (user.username || <em>Not set</em>)}
              </DefRow>
            </div>
          </div>

          <div>
            <Mono tone="signal">§ 02 Profile</Mono>
            <div style={{ marginTop: 16 }} className="mrd-deflist">
              <DefRow icon={<IconUser size={14} />} label="Display name">
                {editing
                  ? <TextInput
                      value={draft.displayName ?? ''}
                      onChange={ev => u.setValue('displayName', ev.target.value)}
                      placeholder="Your display name"
                    />
                  : (user.displayName || <em>Not set</em>)}
              </DefRow>
              <DefRow icon={<IconCheck size={14} />} label="Role">
                <span className="mrd-role">{user.role}</span>
              </DefRow>
            </div>

            <div className="mrd-ts">
              <div>
                <Label>Joined</Label>
                <span className="mrd-ts-val">{formatDateTime(user.createdAt)}</span>
              </div>
              <div>
                <Label>Last updated</Label>
                <span className="mrd-ts-val">{formatDateTime(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mrd-listing-head">
          <div>
            <Mono tone="signal">§ 03 Roster</Mono>
            <h2 className="mrd-h2" style={{ marginTop: 10 }}>Upcoming events</h2>
          </div>
          {!u.eventsLoading && u.events.length > 0 && (
            <Mono>{u.events.length} booked · {formatDuration(hours)} total</Mono>
          )}
        </div>

        {u.eventsLoading ? (
          <StateBlock>Loading roster</StateBlock>
        ) : u.events.length === 0 ? (
          <div className="mrd-state">
            Nothing booked yet
            <span className="mrd-state-note">
              <Link className="mrd-link" to="/events">Find something happening this week <Arrow /></Link>
            </span>
          </div>
        ) : (
          <div className="mrd-rows">
            {u.events.map(ev => <BookedEvent key={ev.id} event={ev} />)}
          </div>
        )}
      </div>

      <Toast toast={u.toast} />
    </Shell>
  );
}
