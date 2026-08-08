import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Shell from '../Shell';
import { Arrow, Btn, Field, Mono, PasswordInput, TextInput } from '../parts';
import { useAuth } from '../../../context/AuthContext';
import { API } from '../../../data/api';

const POINTS = {
  login: {
    volunteer: [
      'Every opportunity and hour you have logged, in one place',
      'A verified impact record you can hand to anyone',
      'Matches drawn from your own skills and causes',
    ],
    organization: [
      'Your events and volunteer roster, together',
      'Hours tracked and totalled without a spreadsheet',
      'Reach volunteers who already live nearby',
    ],
  },
  signup: {
    volunteer: [
      'Browse verified opportunities within a radius you set',
      'Log hours and build a portable impact record',
      'Free to join, no card, no trial clock',
    ],
    organization: [
      'List an event in under three minutes',
      'Reach volunteers who are already active in your area',
      'A verified profile that builds trust with donors',
    ],
  },
};

function RoleSwitch({ role, onChange }) {
  return (
    <div className="mrd-roleswitch" role="group" aria-label="Account type">
      <button
        type="button"
        className={role === 'volunteer' ? 'is-on' : ''}
        onClick={() => onChange('volunteer')}
      >
        Volunteer
      </button>
      <button
        type="button"
        className={role === 'organization' ? 'is-on' : ''}
        onClick={() => onChange('organization')}
      >
        Organization
      </button>
    </div>
  );
}

function AuthFrame({ eyebrow, title, points, children }) {
  return (
    <Shell bare>
      <div className="mrd-auth">
        <aside className="mrd-auth-aside mrd-topo">
          <div>
            <Mono tone="signal">{eyebrow}</Mono>
            <h2>{title}</h2>
            <ul className="mrd-auth-points">
              {points.map((p, i) => (
                <li key={i}>
                  <span className="mrd-auth-points-mark">{String(i + 1).padStart(2, '0')}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <Mono>Benevola · Volunteer survey · Edition 2026</Mono>
        </aside>

        <div className="mrd-auth-main">
          <div className="mrd-auth-form">{children}</div>
        </div>
      </div>
    </Shell>
  );
}

/* ── Log in ─────────────────────────────────────────────────────────── */
export function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [role,   setRole]   = useState('volunteer');
  const [form,   setForm]   = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const switchRole = r => { setRole(r); setErrors({}); setApiError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.identifier.trim()) errs.identifier = 'Enter your email or username';
    if (!form.password)          errs.password   = 'Enter your password';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    const url = role === 'organization'
      ? `${API}/api/auth/login/org`
      : `${API}/api/auth/login/user`;

    try {
      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: form.identifier, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setApiError(data.message || data.error || 'That combination did not work. Try again.');
        setLoading(false);
        return;
      }

      let userData = data.user ?? data.org ?? data;

      if (role === 'organization') {
        try {
          const meRes  = await fetch(`${API}/api/auth/me`);
          const meData = await meRes.json();
          userData = { ...userData, ...(meData.user ?? meData.org ?? meData) };
        } catch { /* non-fatal — the org link just will not resolve */ }
      }

      login(role, userData);
      navigate('/');
    } catch {
      setApiError('Could not reach the server. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      eyebrow={role === 'organization' ? '/ For organizations' : '/ For volunteers'}
      title={role === 'organization' ? 'Run your organization from one page.' : 'Good to see you again.'}
      points={POINTS.login[role]}
    >
      <Mono tone="signal">Returning</Mono>
      <h1 className="mrd-h1">Log in</h1>
      <p>Pick up wherever you left off.</p>

      <RoleSwitch role={role} onChange={switchRole} />

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Email or username" error={errors.identifier}>
          <TextInput
            type="text"
            value={form.identifier}
            onChange={set('identifier')}
            error={errors.identifier}
            autoComplete="username"
            placeholder={role === 'organization' ? 'org@example.com' : 'you@example.com'}
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            autoComplete="current-password"
            placeholder="Your password"
          />
        </Field>

        <a className="mrd-forgot" href="#forgot">Forgot your password?</a>

        {apiError && <div className="mrd-auth-err">{apiError}</div>}

        <Btn type="submit" block disabled={loading}>
          {loading ? 'Logging in' : <>Log in <Arrow /></>}
        </Btn>
      </form>

      <p className="mrd-auth-foot">
        No account yet? <Link to="/signup">Create one</Link>
      </p>
    </AuthFrame>
  );
}

/* ── Sign up ────────────────────────────────────────────────────────── */
export function Signup() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [params]  = useSearchParams();

  const [role, setRole] = useState(
    params.get('role') === 'organization' ? 'organization' : 'volunteer'
  );
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
    description: '', phone: '', address: '',
  });
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading,  setLoading]  = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.username.trim())                  errs.username        = 'Pick a username';
    if (!form.email.includes('@'))              errs.email           = 'Enter a valid email address';
    if (form.password.length < 8)               errs.password        = 'Use at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'These two do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    const url = role === 'organization'
      ? `${API}/api/auth/register/org`
      : `${API}/api/auth/register/user`;

    try {
      const res  = await fetch(url, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username: form.username,
          email:    form.email,
          password: form.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        const raw = data.message || data.error || '';
        setApiError(/unique constraint/i.test(raw)
          ? 'That username or email is already taken. Try another.'
          : raw || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      login(role, data.user ?? data.org ?? data);
      navigate('/');
    } catch {
      setApiError('Could not reach the server. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      eyebrow={role === 'organization' ? '/ For organizations' : '/ For volunteers'}
      title={role === 'organization' ? 'Grow your volunteer network.' : 'Find your ground.'}
      points={POINTS.signup[role]}
    >
      <Mono tone="signal">New account</Mono>
      <h1 className="mrd-h1">Create account</h1>
      <p>Free to join. About a minute of your time.</p>

      <RoleSwitch role={role} onChange={r => { setRole(r); setErrors({}); }} />

      <form onSubmit={handleSubmit} noValidate>
        <Field label="Username" error={errors.username}>
          <TextInput
            value={form.username}
            onChange={set('username')}
            error={errors.username}
            autoComplete="username"
            placeholder={role === 'organization' ? 'green_future' : 'janesmith'}
          />
        </Field>

        <Field label="Email" error={errors.email}>
          <TextInput
            type="email"
            value={form.email}
            onChange={set('email')}
            error={errors.email}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password" error={errors.password}>
          <PasswordInput
            value={form.password}
            onChange={set('password')}
            error={errors.password}
            placeholder="8 characters or more"
          />
        </Field>

        <Field label="Confirm password" error={errors.confirmPassword}>
          <PasswordInput
            value={form.confirmPassword}
            onChange={set('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Type it once more"
          />
        </Field>

        {role === 'organization' && (
          <div className="mrd-org-extra">
            <div className="mrd-org-extra-head">
              <Mono>Organization details</Mono>
              <Mono tone="signal">All optional</Mono>
            </div>

            <Field label="Description">
              <textarea
                className="mrd-field"
                rows={4}
                value={form.description}
                onChange={set('description')}
                placeholder="What your organization does, and what you care about."
              />
            </Field>

            <div className="mrd-edit-pair">
              <Field label="Phone">
                <TextInput type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 555 000 0000" />
              </Field>
              <Field label="Address">
                <TextInput value={form.address} onChange={set('address')} placeholder="City, State" />
              </Field>
            </div>
          </div>
        )}

        {apiError && <div className="mrd-auth-err">{apiError}</div>}

        <Btn type="submit" block disabled={loading}>
          {loading ? 'Creating account' : <>Create account <Arrow /></>}
        </Btn>
      </form>

      <p className="mrd-auth-foot">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthFrame>
  );
}
