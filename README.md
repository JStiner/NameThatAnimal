# Animal Name Generator

A fun, family-friendly web app for generating names for pets, farm animals, and other animal friends.

## Features

- Generate one animal name at a time
- Optional preferred first, middle, and last name inputs
- Exact name length selector from 1 to 5 words
- Name style selector:
  - Nickname
  - Short Name
  - Full Name
  - Formal Name
  - Show / Stage Name
- Male, female, or neutral / any selector
- Alphabetized animal list loaded from a repo file
- Device-level animal list admin page
- Reset to default to match the repo animal file again
- Copy-friendly large result display
- GitHub Pages friendly static app

## Files

- `index.html` - main generator page
- `admin.html` - animal list admin page
- `styles.css` - site styling
- `app.js` - generator logic
- `admin.js` - admin logic for device-level animal overrides
- `data/animals.json` - default repo animal list
- `data.js` - shared data and animal merge logic

## How animal list syncing works

The animal list uses two layers:

1. **Repo default**
   - Stored in `data/animals.json`
   - This is the default animal list for the project

2. **Device-level overrides**
   - Stored in browser local storage
   - Lets a user add animals or hide repo animals on a specific device

When the user clicks **Reset to Default**, local device overrides are removed and the device uses the repo list again.

## Run locally

Because the app loads `data/animals.json`, run it from a local web server instead of opening the HTML file directly.

Examples:

### Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

### VS Code

Use the **Live Server** extension and open the project folder.

## Publish to GitHub Pages

1. Create a new GitHub repo
2. Upload the project files
3. Push to the default branch
4. In GitHub repo settings, enable **GitHub Pages**
5. Set the site to deploy from your branch root

## Notes

- Device-level animal edits do not write back to GitHub
- Reset to Default updates the device back to the repo animal file
- The app is intentionally static and simple so it can be hosted for free on GitHub Pages
