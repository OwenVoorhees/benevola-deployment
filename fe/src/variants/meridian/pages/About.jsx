import React from 'react';
import Shell, { Crumbs } from '../Shell';
import { Mono, Plate, SectionIndex } from '../parts';
import { IconMail } from '../../../Components/Icons';

const TEAM = [
  { name: 'Talha Djibril',  initials: 'TD', role: 'Backend' },
  { name: 'Zachary Norton', initials: 'ZN', role: 'Backend' },
  { name: 'Owen Voorhees',  initials: 'OV', role: 'Frontend' },
];

export default function About() {
  return (
    <Shell>
      <div className="mrd-shell">
        <Crumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />

        <section className="mrd-about-lede mrd-topo">
          <Mono tone="signal">/ Our mission</Mono>
          <h1 className="mrd-display">Built for good.</h1>
          <div className="mrd-about-body">
            <p>
              Benevola exists to remove the friction between people who want to help and
              the organizations that need them. Volunteering should take about as much
              effort as ordering a coffee: no cold emails, no gatekeeping, no forms that
              ask for your address three times.
            </p>
            <p>
              We work with nonprofits, community groups, and civic organizations to
              surface real opportunities, verified and searchable and matched to what you
              actually care about. Every hour logged here is an hour that moved something
              forward.
            </p>
          </div>
        </section>

        <section className="mrd-section" style={{ paddingTop: 0 }}>
          <SectionIndex num="01" name="Get in touch" />
          <Plate className="mrd-contact-plate">
            <span className="mrd-contact-icon"><IconMail size={19} /></span>
            <div>
              <Mono>Questions, partnerships, press, or hello</Mono>
              <a href="mailto:benevolacorp@gmail.com">benevolacorp@gmail.com</a>
            </div>
          </Plate>
        </section>

        <section className="mrd-section">
          <SectionIndex num="02" name="The people behind it" />
          <div className="mrd-team">
            {TEAM.map(member => (
              <div className="mrd-team-member" key={member.name}>
                <span className="mrd-team-initials">{member.initials}</span>
                <h3 className="mrd-h3">{member.name}</h3>
                <Mono>{member.role}</Mono>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  );
}
