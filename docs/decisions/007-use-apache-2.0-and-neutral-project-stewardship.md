# Decision 007: Use Apache-2.0 and Neutral Project Stewardship

## Status

Accepted

## Context

The repository is publicly accessible, but public access alone does not grant
permission to use, modify, or redistribute project-authored material. The
open-source release therefore needs an explicit license, accurate contributor
attribution, and a stewardship statement that does not make an unsupported
claim about institutional ownership or endorsement.

Most commits were authored by Vijay Khot. Dr. Yong-Cheol Lee also contributed
the substantial urban-resilience implementation in commit `47e3e02`. Applying
the selected license to that contribution requires confirmation from its
contributor before this decision is accepted and the licensing pull request is
merged.

Third-party software, public data, services, and model assets remain governed
by their respective upstream terms, documented separately in
`THIRD_PARTY_NOTICES.md`.

## Decision

- Use the Apache License, Version 2.0, identified by the SPDX expression
  `Apache-2.0`, for project-authored source code and documentation.
- Keep the repository under Vijay Khot's GitHub account for the initial
  open-source release.
- Use the neutral collective attribution “the project contributors.”
- Make no claim that Louisiana State University owns, sponsors, certifies, or
  endorses the repository or its research interpretations.
- Preserve all third-party terms and attribution independently of the project
  license.
- Permit a later repository transfer or stewardship update if the contributors
  and any applicable institution establish a different arrangement. Such a
  change does not revoke permissions already granted for released versions
  under Apache-2.0.

## Approval record

Vijay Khot approved Apache-2.0 as repository maintainer and author of his
contributions. That approval is recorded in the planning and implementation of
GitHub Issue #72 and will also be added as an issue comment.

On August 30, 2026, Dr. Yong-Cheol Lee confirmed by email that Apache-2.0 is
proper for this repository. His accompanying repository-structure guidance
also directed the related PESOSE repositories to use Apache License 2.0 unless
a specific licensing issue requires discussion. This confirmation covers the
licensing approach for his contribution in commit `47e3e02`.

The private email content and contact metadata are not committed to the
repository.

## Consequences

- Users receive explicit permission to use, modify, and redistribute
  project-authored material under Apache-2.0 after the licensing pull request
  is approved and merged.
- The Apache-2.0 patent provisions and redistribution conditions apply to
  covered contributions.
- OpenStreetMap, FEMA, USGS, Cesium, ArcGIS, the bundled sample model, and all
  other third-party materials retain their own terms.
- Repository location and project stewardship remain separate from copyright
  ownership and may be revised without rewriting project history.
