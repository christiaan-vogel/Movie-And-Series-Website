# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Architecture

This is a **tool-free static website** built with vanilla HTML, CSS, and JavaScript (ES modules). No build step, no bundler, no framework. It tracks movies and TV episodes in a single plain-text file (`data/data.txt`) using a pipe-delimited key=value format. The site is deployed via **GitHub Pages** from the `main` branch root.

### Key components
- **index.html**: Main browsing interface with search, filters, and grid/list views
- **admin.html**: Editor for modifying `data/data.txt` with validation and optional GitHub commit
- **styles.css**: Dark-theme responsive styles using CSS variables
- **js/parser.js**: Parse and stringify pipe-delimited key=value lines with escaping (\| and \\)
- **js/dataStore.js**: Loads `data/data.txt`, falls back to localStorage or embedded sample on failure
- **js/render.js**: Render cards, list rows, and item detail modals
- **js/app.js**: Main app entrypoint; wires search, filters, sort, import/export
- **js/admin.js**: Admin page logic; validation, GitHub API integration
- **js/github.js**: Thin wrapper for GitHub REST v3 file APIs (getFile, putFile)
- **data/data.txt**: Line-based data file; one item per line

## Commands

### No build, lint, or test commands are defined
This project has no package.json, no dependencies, and no CLI tooling. All development happens through the browser UI.

### Local preview (optional)
1. **Direct open**: Simply open `index.html` in a browser. The app will fall back to localStorage or an embedded sample if `data/data.txt` cannot be fetched (e.g., due to CORS when opened from `file://`).

2. **Optional static server** (if you want same-origin fetch):
   - **Python**: `python -m http.server 5173`
   - **Node (via npx)**: `npx http-server -p 5173`
   - **PowerShell**: `Start-Process "http://localhost:5173"; python -m http.server 5173` (or use IIS, or any static server)

Once running, visit `http://localhost:5173`.

### Data import/export
All data operations are done via the browser UI:
- **Import**: Click "Import" button in `index.html` or `admin.html` to load a `.txt` file
- **Export**: Click "Export" to download current data as `data.txt`

No CLI needed.

## Data Model

### Format
Each non-empty, non-comment line in `data/data.txt` represents one movie or episode. Lines starting with `#` are ignored. Format:

```
key=value|key=value|...
```

### Escaping rules
- Escape literal pipe as `\|`
- Escape literal backslash as `\\`
- Parser (js/parser.js) implements round-trip escaping/unescaping

### Canonical key order (used by stringify)
`type`, `title`, `series`, `season`, `episode`, `year`, `genres`, `tags`, `rating`, `status`, `runtime`, `link`, `image`, `summary`, then any extras in sorted order.

### Supported keys
- **type** (required): `movie` or `episode`
- **title** (required): Title of movie or episode
- **series**: Name of series (required for episodes, omit or empty for movies)
- **season**, **episode**: Integer numbers (required for episodes)
- **year**: 4-digit year
- **genres**, **tags**: Comma-separated lists
- **rating**: Numeric 0 to 10
- **status**: `planned`, `watching`, `watched`, `dropped`
- **runtime**: Integer minutes
- **link**: URL to external page (e.g. IMDb)
- **image**: URL to poster image
- **summary**: Free text; escape pipes and backslashes

Unknown keys are stored in `extras` map and preserved during round-trip.

## Development Workflow

1. **Edit data**: Open `admin.html` in your browser
2. **Make changes**: Edit the raw text directly in the textarea
3. **Validate**: Click "Validate" to check for format/schema errors
4. **Save locally**: Click "Save to LocalStorage" to persist changes in your browser
5. **Export**: Click "Export" to download updated `data.txt`
6. **Commit**: Either:
   - Manually replace `data/data.txt` in the repo and commit via Git CLI/GUI
   - Or use the optional **GitHub Integration** panel in admin.html:
     - Fill in owner, repo, branch, file path, and a personal access token (PAT) with `repo` scope
     - Click "Test Connection" to verify
     - Click "Commit to GitHub" to push changes directly from the browser
     - The PAT is stored only in your browser's localStorage; never committed to the repo

## GitHub Pages Deployment

- **Settings → Pages → Build and deployment**: Deploy from branch `main`, root directory
- The `.nojekyll` file prevents Jekyll processing
- After you commit changes to `data/data.txt`, GitHub Pages rebuilds and the live site updates (usually within a minute)
- Live URL format: `https://<username>.github.io/<repo-name>/`

## Repo Structure

```
.
├── .nojekyll           # Prevents Jekyll
├── index.html          # Main browse/search page
├── admin.html          # Data editor
├── styles.css          # Global styles
├── data/
│   └── data.txt        # One line per movie/episode
└── js/
    ├── parser.js       # Parse/stringify key=value|key=value
    ├── dataStore.js    # Load/save/import/export
    ├── render.js       # UI rendering
    ├── app.js          # Main entrypoint
    ├── admin.js        # Admin page logic
    └── github.js       # GitHub API wrapper
```

## Adding or Editing Content

1. Visit the live site at the GitHub Pages URL (or localhost)
2. Click "Admin" button
3. Edit lines directly or use Import/Export
4. Use "Validate" to check for errors before saving
5. "Save to LocalStorage" to persist in your browser
6. "Export" to download, then commit `data/data.txt` manually, or use "Commit to GitHub" if you've configured a token

## Notes for WARP

- **No tooling to run**: If a user asks how to build, lint, or test, explain there's no build step. Open `index.html` directly or via a static server.
- **Editing**: All edits happen in the browser via `admin.html`. Export to save changes, then commit `data/data.txt`.
- **GitHub token**: If helping a user set up GitHub Integration, remind them to create a PAT with `repo` scope and never commit it. The admin page stores it only in localStorage.
- **Escaping**: When adding items with pipes or backslashes in values, use `\|` and `\\` respectively.
- **Schema**: `type` and `title` are required. For episodes, also `series`, `season`, and `episode` are required.
