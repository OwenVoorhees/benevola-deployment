import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { PageFrame, Field, PasswordInput, Btn, Banner, StateBlock } from './parts';
import { resetPassword, describeApiError } from '../data/api';

/* Step two of a reset: redeem the link and choose a new password.

   The token is only checked when submitted, so an expired link is reported at
   that point rather than on arrival. */

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token    = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  if (!token) {
    return (
      <PageFrame narrow>
        <StateBlock error title="This link is missing its token">
          Use the link from your reset email, or request a new one.
        </StateBlock>
        <div className="ui-actions">
          <Link to="/forgot-password"><Btn>Request a new link</Btn></Link>
        </div>
      </PageFrame>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (password.length < 8)  found.password = 'Use at least 8 characters';
    if (password !== confirm) found.confirm  = 'These two do not match';
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setApiError('');
    try {
      await resetPassword(token, password);
      setDone(true);
      // A beat to read the confirmation before the login page takes over.
      setTimeout(() => navigate('/login', { replace: true }), 2200);
    } catch (err) {
      setApiError(describeApiError(err));
      setLoading(false);
    }
  };

  if (done) {
    return (
      <PageFrame narrow>
        <span className="ui-eyebrow">Done</span>
        <h1 className="ui-h1">Password updated</h1>
        <p className="ui-lede">Taking you to the login page.</p>
        <p className="ui-foot-link"><Link to="/login">Go now</Link></p>
      </PageFrame>
    );
  }

  return (
    <PageFrame narrow>
      <span className="ui-eyebrow">Account recovery</span>
      <h1 className="ui-h1">Choose a new password</h1>
      <p className="ui-lede">
        Once saved, this link stops working and any other reset links for the
        account are cancelled.
      </p>

      <form onSubmit={submit} noValidate>
        <Field label="New password" error={errors.password}>
          <PasswordInput
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            placeholder="8 characters or more"
            autoComplete="new-password"
          />
        </Field>

        <Field label="Confirm new password" error={errors.confirm}>
          <PasswordInput
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={errors.confirm}
            placeholder="Type it once more"
            autoComplete="new-password"
          />
        </Field>

        {apiError && <Banner>{apiError}</Banner>}

        <Btn type="submit" block disabled={loading}>
          {loading ? 'Saving…' : 'Set new password'}
        </Btn>
      </form>

      <p className="ui-foot-link"><Link to="/forgot-password">Request a new link</Link></p>
    </PageFrame>
  );
}
