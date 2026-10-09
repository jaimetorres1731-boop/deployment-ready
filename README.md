Deployment Ready V4.3 — Refinement and Feedback

Updates:
- Fixes the very light text on white background in Your Next Priorities, using high-contrast dark cards.
- Adds a Send feedback link to the published Deployment Ready Google Form, available on all pages. Google Forms requires internet; responses are viewed by the form owner in Google Forms.
- Adds a visible packing item count and clearer planning guidance.
- Improves mobile tap targets, keyboard focus outlines, and readability.
- Keeps V4.1 Home, Packing, Readiness, timeline, branch suggestions, and Not Applicable statuses.
- Retains all existing localStorage keys and saved user data; no data reset or new permissions.
- Updates cache version to v4-3.

IMPORTANT: Upload only the five files in this ZIP to the ORIGINAL repository root. Do not overwrite the existing manifest or icon. Before uploading, export your backup.

Feedback form: https://docs.google.com/forms/d/e/1FAIpQLSdePKBBciC2HTvjlbuUIUM2ggdsxUBD2Q_8v1AwhvHo2jNYBQ/viewform

Not official military guidance. Follow command instructions and do not enter sensitive operational information.


## V5 Stage 1 development build
This is a development-branch build, not a public V5 release. Adds manual phase selection and versioned full-data backup/restore. Test using a separate browser profile before releasing. The existing packing-only import/export remains available.

## Stage 1 backup hotfix
Fixed backup export and restore of the plain-text deployment phase. No existing data keys were changed.


## V5 Stage 2 (2026-10-09)
- Resources automatically filter to the selected service branch; shared military/family resources remain visible to all.
- Adds a separate privacy-first family preparation checklist without modifying V4 readiness tasks.
- Full backups are now version 2 and include family checklist data. Restore still accepts Stage 1 version 1 backups and preserves current family data when importing an older backup.
- Branch links are informational and require internet; verify official requirements with your command.
