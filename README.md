# Resume Studio

A personal, single-template resume builder designed for GitHub Pages.

## Features
- Import PDF, DOCX, or TXT resume text in your browser
- Parse common profile details and resume sections into editable fields
- Add, edit, reorder, and remove employment experience; count updates automatically
- Manage projects, contributions, education, skills, certifications, and languages
- Live A4 resume preview and browser Print / Save as PDF
- Save to browser storage or export/import resume data as JSON

## Enable GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment → Source**, select **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then click **Save**.
4. Wait for deployment. The site URL should be https://shubhamsinghal06.github.io/resume-builder/

## Privacy and accuracy
Resume content is not uploaded to a backend. Content stays in the current browser and persists only if you select Save locally. PDF/DOCX extraction libraries load from public CDNs when needed. Avoid saving on a shared device.

Parsing is best-effort and can miss content in columns, tables, and unusual layouts. Review every field before exporting. The current design is a starter template; upload the original resume to tune it to match your existing design.
