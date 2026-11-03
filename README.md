# Shreya & Jatin — Wedding Invitation Website

A static digital wedding invitation built with plain HTML, CSS and JavaScript. You don't need a build step, npm, a framework or a server. Open `index.html` or upload the folder to any static host.

## What's inside

```
wedding-invitation/
├── index.html            Page structure and the ornament / motif SVGs
├── css/style.css         All styling (mobile-first)
├── js/config.js          ← THE FILE YOU EDIT: names, functions, venue, photo and music paths
├── js/script.js          Behaviour: gate, music, scratch card, countdown, functions, animations
├── assets/
│   ├── images/           artwork (WebP), favicons, og-image.jpg
│   ├── audio/            wedding-music.mp3 (an original light romantic strings-and-piano piece)
│   └── fonts/            Bodoni Moda, Jost, Tiro Devanagari Hindi (self-hosted, Open Font License)
└── README.md
```

## Editing details: everything is in `js/config.js`

Open `js/config.js` in any text editor (Notepad, TextEdit, or VS Code). Each setting has a comment above it.

| You want to change… | Edit this in `config.js` |
|---|---|
| Names, Hindi names, initials, hashtag | `couple.bride`, `couple.groom`, `couple.brideHindi`, `couple.groomHindi`, `couple.initials`, `couple.hashtag` |
| Countdown target | `countdownTarget`, e.g. `"2026-12-04T00:00:00+05:30"` |
| When the top bar hides | `navHideOn`: `"up"` (hides on scroll up), `"down"` (hides on scroll down) or `"never"` |
| A function's name, date, day, time or location | the matching line in `functions` |
| Venue name, address, map link | `venue.name`, `venue.address`, `venue.mapsUrl`, `venue.note` |
| Artwork | `images.*` and each function's `image` |
| Portraits, music | `couple.bridePhoto`, `couple.groomPhoto`, `media.music` |

A few names also appear as plain text in `index.html` (the page title, the social preview tags and the scrolling ribbon) so that search engines and WhatsApp previews can read them. If you rename the couple, search `index.html` for "Shreya" and "Jatin" and update those too.

### Functions
Each function is one line:
```js
{ name: "Haldi", date: "2026-12-03", day: "Thursday", time: "Morning, 9:00 AM", location: "Treehouse Rajbagh, Jodhpur", motif: "haldi" }
```
- `date` uses the format `YYYY-MM-DD`. Functions that share a date are grouped under the same day automatically.
- `day` is shown on the card. If it doesn't match the calendar, the browser console shows a warning.
- Leave `location: ""` to hide the location row.
- `motif` picks the drawing on the card: `thali`, `ghee`, `kalash`, `haldi`, `mayra`, `toran`, `agni` or `lantern`.

Note: Vinayak / Kalash Chak Pujan and Haldi are both set to 9:00 AM on 3 December, exactly as supplied. If one of those times is wrong, change it in `config.js`.

### Venue
Until you fill it in, the venue section says the address will be shared soon. It also lists where the earlier ceremonies happen (Residence, Treehouse Rajbagh, Jodhpur), taken from the functions list.
1. Set `venue.name` and `venue.address`. Use `\n` for a line break in the address.
2. For an exact map pin, open Google Maps, find the venue, tap **Share → Copy link**, and paste the link into `venue.mapsUrl`.
   If you leave `mapsUrl` empty but fill in the address, the directions button searches Google Maps for the address instead.

## Artwork, portraits and music

**Artwork:** the illustrations are in `assets/images/` as compressed WebP files, about 3.4 MB in total. Phones load only what's on screen. The paths are set in `config.js` under `images` (doors, main screen for phone and desktop, couple, garland, corner, venue, paper, foil) and in each function's `image`. To swap a picture, replace the file and keep the same name. A new picture should be roughly the same shape, and cut-outs should have a transparent background. Set any path to `""` to go back to the built-in line drawing. If an image isn't a cut-out (like the reception stage), add `framed: true` to that function so it shows as a framed picture.

To convert a new PNG to WebP, use https://squoosh.app (WebP, quality about 80) or run `cwebp -q 80 in.png -o out.webp`.

**Portraits:** the story section shows the illustrated couple. Illustrated portraits are also included as `assets/images/bride.webp` and `groom.webp`, switched off. To show individual portraits, which work best with real photos of Shreya and Jatin, set:
```js
bridePhoto: "assets/images/bride.webp",
groomPhoto: "assets/images/groom.webp"
```

**Music:** `assets/audio/wedding-music.mp3` is a light, romantic piece for strings and piano, about one minute long, that loops. It was composed for this site, so there are no copyright issues. To use your own song, replace the file and keep the same name, or change `media.music`. An MP3 of 1–3 MB at 96–128 kbps works well. Music starts only after the guest taps **#ShreyaWedsJatin** on the opening screen, and only if the "Play music" box is ticked. The floating button pauses and resumes it. Music also pauses when the guest switches tabs. If the file is missing, the music button doesn't appear.

## Social preview (WhatsApp / Facebook)

`assets/images/og-image.jpg` (1200 × 630) is the card that appears when you share the link. WhatsApp needs a full web address for the image, so after deploying, change these two lines in `index.html`:
```html
<meta property="og:image" content="https://YOUR-USERNAME.github.io/wedding-invitation/assets/images/og-image.jpg">
<meta name="twitter:image" content="https://YOUR-USERNAME.github.io/wedding-invitation/assets/images/og-image.jpg">
```
You can also add `<meta property="og:url" content="https://YOUR-USERNAME.github.io/wedding-invitation/">`.

## Previewing on your computer

Double-clicking `index.html` works in most browsers. For the most accurate test, run a tiny local server from inside the folder:
```
python3 -m http.server 8000
```
Then open http://localhost:8000.

## Deploying to GitHub Pages

1. Sign in at https://github.com and click **New repository**. Name it, for example, `wedding-invitation`, set it to **Public**, and click **Create repository**.
2. On the new repository page, click **uploading an existing file**. Drag in the **contents** of the `wedding-invitation` folder (`index.html`, `css`, `js`, `assets`, `README.md`, `IMAGE-PROMPTS.md`), not the folder itself. Then click **Commit changes**.
   Check that `index.html` sits at the top level of the repository.
3. Go to **Settings → Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**, **Branch** to `main`, and the folder to `/ (root)`. Click **Save**.
4. Wait 1–2 minutes and refresh the page. GitHub shows the live address:
   `https://YOUR-USERNAME.github.io/wedding-invitation/`
5. Update the `og:image` lines as described above, then commit again.

To make later changes, edit `js/config.js` on GitHub (open the file, click the pencil icon, and commit). The site updates within a minute or two.

Using git instead:
```
cd wedding-invitation
git init && git add . && git commit -m "Wedding invitation"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/wedding-invitation.git
git push -u origin main
```
Then follow step 3.

Netlify also works: drag the folder onto https://app.netlify.com/drop.

## Tested

- Widths of 360, 390, 768 and 1440 px, with no horizontal scrolling
- No console errors or missing files
- Scratch card works with mouse and touch, and with Enter or Space from the keyboard
- Countdown updates every second. On 4 December it shows "Today is the day", and afterwards a thank-you message.
- All eight functions checked against the supplied dates, weekdays and times
- Reduced-motion setting respected: the doors, 3D effects and animations become instant

## Credits

Fonts: Bodoni Moda, Jost and Tiro Devanagari Hindi, all under the SIL Open Font License. Illustrations were generated with ChatGPT for this invitation. The line-drawn fallback ornaments and the music were made for this site.
