# Security Policy

## Supported versions

This repository is an early research prototype and does not yet have a stable
release series. Security corrections currently target the `main` branch.
Older branches, commits, tags, demonstrations, and generated artifacts do not
receive guaranteed backports or ongoing support.

This policy does not promise a specific acknowledgment, investigation,
resolution, or disclosure timeline.

## Report a vulnerability privately

Do not disclose a suspected vulnerability, exposed credential, or sensitive
research-data concern in a public issue, discussion, pull request, or commit.

Use the repository's
[private vulnerability reporting form](https://github.com/vijaybkhot/urban-digital-twin-interoperability/security/advisories/new).
GitHub will create a private repository-security-advisory conversation visible
to the reporter and repository maintainers.

A useful report should include, when available:

- the affected file, feature, version, branch, or commit;
- a clear description of the concern and its potential impact;
- minimal reproduction steps or a proof of concept that does not expose
  private or restricted data;
- relevant browser, operating-system, and Node.js versions;
- suggested mitigations or references;
- whether the concern is already public.

Do not include live credentials or unnecessary personal, facility, or research
data in the report. Redact active secret values. If a credential has been
exposed, revoke or rotate it immediately rather than waiting for repository
review.

## Sensitive-data and credential concerns

The following material must not be posted publicly in this repository:

- passwords, API keys, access tokens, authorization headers, or `.env.local`;
- private residential addresses linked to identifiable people;
- participant, resident, or other personal information;
- non-public facility-security, access-control, or infrastructure details;
- raw private photographs or image-intake files;
- restricted point clouds, reconstructions, meshes, or facility models;
- ignored raw service caches;
- restricted or live operational emergency information.

If such material is accidentally committed, do not reproduce its value in an
issue or follow-up commit. Revoke affected credentials where applicable and
use private vulnerability reporting to coordinate containment and Git-history
remediation.

Properly attributed public OSM, FEMA, USGS, or similar government/open-data
records are not treated as private merely because they describe a real place.
They must still be minimized to the research scope and used consistently with
their source terms and the project's scientific limitations.

## Prototype limitations

The application has no production backend, authentication, database, service
availability guarantee, or operational security program. It must not be used
for emergency guidance, facility operation, resident safety decisions, or
protection of sensitive infrastructure information.

A security report does not create a support contract or imply LSU ownership,
sponsorship, certification, or institutional incident-response support.
