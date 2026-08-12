import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import {
  AddressField, Arrow, Btn, Field, Label, MapPlate, Mono,
  NumberInput, StateBlock, TextInput, TagPicker,
} from '../parts';
import { useAuth } from '../../../context/AuthContext';
import { useTags } from '../../../data/hooks';
import { createEvent, describeApiError } from '../../../data/api';

const BLANK = {
  title: '', description: '', address: '', tags: [],
  duration: 2, capacity: 10, date: '',
  lat: null, lng: null, heroImage: '',
};

export default function EventNew() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const tags     = useTags();
  const { auth, ready, isOrg, userId } = useAuth();

  const [draft,    setDraft]    = useState(BLANK);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [saving,   setSaving]   = useState(false);

  const set   = (key, value) => setDraft(d => ({ ...d, [key]: value }));
  const patch = values       => setDraft(d => ({ ...d, ...values }));

  /* Wait for the session check before deciding — otherwise a signed-in org
     gets told to log in for a moment on every refresh. */
  if (!ready) {
    return (
      <Shell>
        <div className="mrd-shell">
          <StateBlock note="Checking your session.">One moment</StateBlock>
        </div>
      </Shell>
    );
  }

  /* Posting an event is an organization action, and only for your own org.
     The API enforces both; this just explains it rather than 401/403-ing. */
  if (!auth) {
    return (
      <Shell>
        <div className="mrd-shell">
          <StateBlock note="You need to be signed in as an organization to post an event.">
            Not signed in
          </StateBlock>
          <Link to="/login"><Btn sm>Log in <Arrow /></Btn></Link>
        </div>
      </Shell>
    );
  }

  if (!isOrg || String(userId) !== String(id)) {
    return (
      <Shell>
        <div className="mrd-shell">
          <StateBlock error note="Events can only be posted by the organization that owns them.">
            You cannot post events for this organization
          </StateBlock>
          <Link to={`/organizations/${id}`}><Btn sm variant="ghost">Back to the organization</Btn></Link>
        </div>
      </Shell>
    );
  }

  const validate = () => {
    const e = {};
    if (!draft.title.trim())              e.title    = 'Give the event a title';
    if (draft.lat == null || draft.lng == null) e.address = 'Pick a location from the suggestions, or tap the map';
    if (!draft.date)                      e.date     = 'Choose when it happens';
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    setApiError('');
    try {
      const created = await createEvent(id, draft);
      navigate(`/events/${created.id}`);
    } catch (err) {
      setApiError(describeApiError(err));
      setSaving(false);
    }
  };

  return (
    <Shell>
      <div className="mrd-shell">
        <Crumbs items={[
          { label: 'Home',          to: '/' },
          { label: 'Organizations', to: '/organizations' },
          { label: 'Your organization', to: `/organizations/${id}` },
          { label: 'New event' },
        ]} />

        <Mono tone="signal">New posting</Mono>
        <h1 className="mrd-h1">Post an event</h1>
        <p>Volunteers will see this in search once it is live.</p>

        <form onSubmit={submit} noValidate>
          <Field label="Event title" error={errors.title}>
            <TextInput
              large
              value={draft.title}
              onChange={ev => set('title', ev.target.value)}
              error={errors.title}
              placeholder="Riverside clean-up"
            />
          </Field>

          <Field label="Description">
            <textarea
              className="mrd-field"
              rows={7}
              value={draft.description}
              onChange={ev => set('description', ev.target.value)}
              placeholder="What volunteers will be doing, what to bring, who to ask for."
            />
          </Field>

          <Field label="Location" error={errors.address}>
            <AddressField
              value={draft.address}
              onTextChange={val => set('address', val)}
              onPick={(label, plat, plng) => patch({ address: label, lat: plat, lng: plng })}
              placeholder="Search an address"
            />
          </Field>

          <MapPlate
            lat={draft.lat}
            lng={draft.lng}
            address={draft.address}
            editing
            onPick={(label, plat, plng) => patch({
              lat: plat,
              lng: plng,
              ...(label ? { address: label } : {}),
            })}
          />

          <div className="mrd-form-row">
            <Label>Causes</Label>
            <TagPicker
              tags={tags.tags}
              loading={tags.loading}
              selected={draft.tags}
              onToggle={slug => set(
                'tags',
                draft.tags.includes(slug)
                  ? draft.tags.filter(s => s !== slug)
                  : [...draft.tags, slug]
              )}
            />
          </div>

          <div className="mrd-edit-pair mrd-form-row">
            <div>
              <Label>Duration</Label>
              <NumberInput
                value={draft.duration}
                onChange={v => set('duration', v)}
                min={0.5}
                suffix="hours"
              />
            </div>
            <div>
              <Label>Capacity</Label>
              <NumberInput
                value={draft.capacity}
                onChange={v => set('capacity', v)}
                min={1}
                suffix="volunteers"
              />
            </div>
          </div>

          <Field label="Date and time" error={errors.date}>
            <TextInput
              type="datetime-local"
              value={draft.date ? draft.date.slice(0, 16) : ''}
              onChange={ev => set(
                'date',
                ev.target.value ? new Date(ev.target.value).toISOString() : ''
              )}
              error={errors.date}
            />
          </Field>

          <Field label="Image URL">
            <TextInput
              value={draft.heroImage}
              onChange={ev => set('heroImage', ev.target.value)}
              placeholder="https://…"
            />
          </Field>

          {apiError && <div className="mrd-auth-err">{apiError}</div>}

          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <Btn type="submit" disabled={saving}>
              {saving ? 'Posting…' : <>Post event <Arrow /></>}
            </Btn>
            <Link to={`/organizations/${id}`}>
              <Btn type="button" variant="ghost">Cancel</Btn>
            </Link>
          </div>
        </form>
      </div>
    </Shell>
  );
}
