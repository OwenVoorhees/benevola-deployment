import React from 'react';
import { Link } from 'react-router-dom';
import Shell, { Crumbs } from '../Shell';
import { Mono, Plate, StateBlock } from '../parts';
import { useOrgList } from '../../../data/hooks';
import { truncate } from '../../../data/format';
import { IconMail, IconPin, IconSearch } from '../../../Components/Icons';

function OrgCard({ org }) {
  const initial = org.name?.[0]?.toUpperCase() ?? '?';
  return (
    <Plate as={Link} to={`/organizations/${org.id}`} className="mrd-org-card">
      <div className="mrd-org-card-top">
        <span className="mrd-org-mark">
          {org.iconImg ? <img src={org.iconImg} alt="" /> : initial}
        </span>
        <div>
          <h3 className="mrd-h3">{org.name}</h3>
          <Mono>Verified organization</Mono>
        </div>
      </div>

      <div className="mrd-org-card-body">
        <p>{org.description || 'No description posted yet.'}</p>
        {(org.email || org.address) && (
          <div className="mrd-org-meta">
            {org.email && (
              <span className="mrd-org-meta-item"><IconMail size={12} /> {org.email}</span>
            )}
            {org.address && (
              <span className="mrd-org-meta-item"><IconPin size={12} /> {truncate(org.address, 42)}</span>
            )}
          </div>
        )}
      </div>
    </Plate>
  );
}

export default function Orgs() {
  const { filtered, loading, error, query, setQuery, orgs } = useOrgList();

  return (
    <Shell>
      <div className="mrd-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'Organizations' }]} />

        <div className="mrd-page-head">
          <div>
            <Mono tone="signal">§ Register of organizations</Mono>
            <h1 className="mrd-h1" style={{ marginTop: 12 }}>Organizations</h1>
            <p>Verified nonprofits and community groups looking for volunteers.</p>
          </div>

          <div className="mrd-searchbar">
            <input
              type="search"
              placeholder="Filter by name, place, or cause"
              value={query}
              onChange={ev => setQuery(ev.target.value)}
              aria-label="Filter organizations"
            />
            <button onClick={() => {}} aria-label="Filter"><IconSearch size={14} /> Filter</button>
          </div>
        </div>

        {loading ? (
          <StateBlock>Loading register</StateBlock>
        ) : error ? (
          <StateBlock error note="The API is not answering right now.">
            Could not load organizations
          </StateBlock>
        ) : filtered.length === 0 ? (
          <StateBlock note={query ? 'Try a shorter search term.' : undefined}>
            {query ? 'No organizations match' : 'No organizations listed yet'}
          </StateBlock>
        ) : (
          <>
            <div className="mrd-results-bar" style={{ marginTop: 26 }}>
              <Mono>
                {filtered.length} of {orgs.length} organization{orgs.length !== 1 ? 's' : ''}
              </Mono>
            </div>
            <div className="mrd-org-grid">
              {filtered.map(org => <OrgCard key={org.id} org={org} />)}
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
