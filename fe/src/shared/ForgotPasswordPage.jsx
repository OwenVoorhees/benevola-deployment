import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageFrame, Field, TextInput, Btn, Banner, RoleSwitch } from './parts';
import { requestPasswordReset, describeApiError } from '../data/api';

/* Step one of a reset: ask for the link.

   The API answers identically whether or not the address is registered, so
   this page does too. Anything else would let a stranger check which emails
   have accounts. */

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [role, setRole]       = useState('user');
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  // Dev only: with no mail transport configured, the API hands the link back.
  const [devLink, setDevLink] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Enter a valid email address'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await requestPasswordReset(email.trim(), role);
      setDevLink(res?.devResetLink || '');
      setSent(true);
    } catch (err) {
      setError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <PageFrame narrow>
        <span className="ui-eyebrow">Check your inbox</span>
        <h1 className="ui-h1">Link sent</h1>
        <p className="ui-lede">
          If <strong>{email}</strong> has an account, a reset link is on its way.
          It works once and expires in an hour.
        </p>

        {devLink && (
          <Banner tone="info">
            <strong>Development mode:</strong> no email is actually sent yet, so
            here is the link.{' '}
            <Link to={devLink.replace(/^https?:\/\/[^/]+/, '')}>Open the reset page</Link>
          </Banner>
        )}

        <p className="ui-foot-link"><Link to="/login">Back to log in</Link></p>
      </PageFrame>
    );
  }

  return (
    <PageFrame narrow>
      <span className="ui-eyebrow">Account recovery</span>
      <h1 className="ui-h1">Forgot your password?</h1>
      <p className="ui-lede">Tell us the address on the account and we will send a link to set a new one.</p>

      <RoleSwitch
        value={role}
        onChange={setRole}
        options={[
          { value: 'user', label: 'Volunteer' },
          { value: 'org',  label: 'Organization' },
        ]}
      />

      <form onSubmit={submit} noValidate>
        <Field label="Email" error={error}>
          <TextInput
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={error}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>

        <Btn type="submit" block disabled={loading}>
          {loading ? 'Sending…' : 'Send reset link'}
        </Btn>
      </form>

      <p className="ui-foot-link">
        Remembered it? <Link to="/login">Log in</Link>
      </p>
    </PageFrame>
  );
}
