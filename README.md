# Movies and Series Website

A simple, tool-free static website for tracking movies and TV episodes. Built with vanilla HTML, CSS, and JavaScript—no build step, no framework, no dependencies. Data is stored in a single plain-text file (`data/data.txt`) using a pipe-delimited format.

## Live Site

Once deployed, visit: `https://Christiaan-Vogel.github.io/Movie-And-Series-Website/`

## Quick Start

1. **Browse**: Visit the live site or open `index.html` locally
2. **Add/Edit data**: Click "Admin" button to open the editor
3. **Make changes**: Edit the text directly in the textarea
4. **Validate**: Click "Validate" to check for errors
5. **Export**: Click "Export" to download `data.txt`
6. **Commit**: Replace `data/data.txt` in this repo and commit, or use the optional GitHub Integration in the admin panel to commit directly from the browser

## Data Format

Each line in `data/data.txt` represents one movie or episode:

```
key=value|key=value|...
```

### Example Movie
```
type=movie|title=Inception|year=2010|genres=Sci-Fi,Thriller|tags=dream,heist|rating=8.8|status=watched|runtime=148|link=https://www.imdb.com/title/tt1375666/|image=https://image.tmdb.org/t/p/w342/qmDpIHrmpJINaRKAfWQfftjCdyi.jpg|summary=A thief who steals corporate secrets through dream-sharing technology.
```

### Example Episode
```
type=episode|series=Breaking Bad|season=1|episode=1|title=Pilot|year=2008|genres=Crime,Drama|tags=chemistry,origin|rating=9.0|status=watched|runtime=58|link=https://www.imdb.com/title/tt0959621/|image=https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5L9pCfOacjizRGt.jpg|summary=A high school chemistry teacher turns to manufacturing meth.
```

### Supported Keys
- **type** (required): `movie` or `episode`
- **title** (required): Title of movie or episode
- **series**: Series name (required for episodes)
- **season**, **episode**: Numbers (required for episodes)
- **year**: 4-digit year
- **genres**, **tags**: Comma-separated lists
- **rating**: 0 to 10
- **status**: `planned`, `watching`, `watched`, `dropped`
- **runtime**: Minutes
- **link**: URL (e.g., IMDb)
- **image**: Poster URL
- **summary**: Free text (escape `|` as `\|` and `\` as `\\`)

## For Contributors

See [WARP.md](WARP.md) for architecture details, development workflow, and guidance for working with this repo.

## GitHub Pages Deployment

Enable GitHub Pages in Settings → Pages → Deploy from branch → `main`, root directory. The `.nojekyll` file prevents Jekyll processing.
