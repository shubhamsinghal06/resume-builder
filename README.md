# Resume Studio

A personal, single-template resume builder designed for GitHub Pages.

The app uses modular vanilla JavaScript and CSS with no build step or framework; resume content remains local to the browser.

## Features
- Import PDF, DOCX, or TXT resume text in your browser
- Parse common profile details and resume sections into editable fields
- Add, edit, reorder, and remove employment experience; count updates automatically
- Manage projects, contributions, education, domain expertise, skills, certifications, and languages
- Compact two-column resume template with a subtle vertical divider and print-focused spacing
- Experience tenure estimate based on role dates, with overlapping jobs counted only once
- Live A4 resume preview and browser Print / Save as PDF
- Save to browser storage or export/import resume data as JSON
- Compare resume keywords against a target job description locally (heuristic estimate, not a real ATS score)

## Builder version and release timestamp
- The page footer shows the builder version and last code-update timestamp in India Standard Time (IST).
- **Release rule:** every builder code release must bump `BUILDER_VERSION` and update `BUILDER_UPDATED_AT` in `assets/js/version.js` in the same release, and keep the `builder-version` meta tag in `index.html` in sync.
- This is the release timestamp, not the time the user last saved their resume.

## Project structure
- `index.html` — page structure and script/style loading order
- `assets/css/app.css` — editor and application layout
- `assets/css/resume.css` — resume preview, responsive layout, and print rules
- `assets/js/state.js` — shared resume state and helpers
- `assets/js/editor.js` — editor fields and repeatable sections
- `assets/js/preview.js` — live resume rendering
- `assets/js/storage.js` — local persistence and JSON export
- `assets/js/import.js` — PDF/DOCX/TXT import, parsing, and photo handling
- `assets/js/ats.js` — local job-description keyword matching
- `assets/js/app.js` — application startup
- `assets/js/version.js` — release version and update timestamp

## Enable GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment → Source**, select **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then click **Save**.
4. Wait for deployment. The site URL should be https://shubhamsinghal06.github.io/resume-builder/

## Privacy and accuracy
Resume content is not uploaded to a backend. Content stays in the current browser and persists only if you select Save locally. PDF/DOCX extraction libraries load from public CDNs when needed. Avoid saving on a shared device.

Parsing is best-effort and can miss content in columns, tables, and unusual layouts. Review every field before exporting. The current design is a starter template; upload the original resume to tune it to match your existing design.
