/* =====================================================================
   WEDDING CONFIGURATION — the one file you edit.
   ---------------------------------------------------------------------
   Everything the guest reads (names, functions, venue,
   photo and music paths) lives here. You never need to touch
   index.html, style.css or script.js to update details.

   Rules of thumb
   • Leave a value as "" (empty) when you do not have it yet.
     The site hides or gracefully replaces anything that is empty.
   • Dates use ISO format with the India time zone: 2026-12-04T11:00:00+05:30
   • Paths are relative to index.html, e.g. "assets/images/bride.jpg"
   ===================================================================== */

window.WEDDING_CONFIG = {
  couple: {
    bride: "Shreya",
    groom: "Jatin",
    brideHindi: "श्रेया",
    groomHindi: "जतिन",
    initials: "S & J",
    hashtag: "#ShreyaWedsJatin",

    /* Optional individual portraits, shown in place of the couple illustration.
       Real photos of Shreya and Jatin work best here (portrait, ~900 × 1200 px, under 250 KB).
       Illustrated portraits are included as assets/images/bride.webp and groom.webp —
       set the paths below to use them. */
    bridePhoto: "",
    groomPhoto: ""
  },

  /* Top navigation bar: which scroll direction hides it.
     "down" = hides while scrolling down, shows again when scrolling up (default)
     "up"   = hides while scrolling up, shows while scrolling down
     "never" = always visible */
  navHideOn: "down",

  /* Countdown target — the wedding day (Friday, 4 December 2026, India time). */
  countdownTarget: "2026-12-04T00:00:00+05:30",

  /* Artwork. Leave any path "" to fall back to the built-in line drawings. */
  images: {
    gateDoor:    "assets/images/gate-door.webp",     /* opening doors (mirrored for the right door) */
    heroMobile:  "assets/images/hero-mobile.webp",   /* main screen, phones */
    heroDesktop: "assets/images/hero-desktop.webp",  /* main screen, tablets and computers */
    couple:      "assets/images/couple.webp",        /* illustrated couple in "Two families, one celebration" */
    garland:     "assets/images/garland.webp",       /* marigold toran over sections */
    corner:      "assets/images/corner.webp",        /* gold corner ornament on the save-the-date card */
    venue:       "assets/images/venue.webp",         /* venue illustration */
    paper:       "assets/images/paper.webp",         /* light paper texture behind ivory sections */
    foil:        "assets/images/foil.webp"           /* gold foil on the scratch card */
  },

  /* Background music — starts only after the guest taps to open the invitation.
     Replace the file (keep the name) or change the path. Leave "" for no music. */
  media: {
    music: "assets/audio/song.mp4"
  },

  /* ---------------- Functions ----------------
     Order here is the order shown on the site.
     image: illustration for the card (square, transparent PNG/WebP works best).
     framed: true shows the image as a framed picture (for images that are not cut-outs).
     motif: line drawing used if image is "" — one of
       thali, ghee, mehendi, kalash, haldi, mayra, dholak, toran, agni, lantern            */
  functions: [
    { name: "Sava",                       date: "2026-11-30", day: "Monday",   time: "Morning, 9:00 AM",          location: "Residence",           motif: "thali",   image: "assets/images/fn-sava.webp" },
    { name: "Ghritpan",                   date: "2026-12-01", day: "Tuesday",  time: "Morning, 11:00 AM",         location: "Residence",           motif: "ghee",    image: "assets/images/fn-ghrtpan.webp" },
    { name: "Mehendi", date: "2026-12-02", day: "Wednesday", time: "Morning, 11:00 AM", location: "Residence", motif: "mehendi", image: "assets/images/fn-mehendi.webp" },
    { name: "Vinayak / Kalash Chak Pujan", date: "2026-12-03", day: "Thursday", time: "Morning, 9:00 AM",          location: "Treehouse Rajbagh, Jodhpur", motif: "kalash",  image: "assets/images/fn-vinayak.webp" },
    { name: "Haldi",                      date: "2026-12-03", day: "Thursday", time: "Morning, 9:00 AM",          location: "Treehouse Rajbagh, Jodhpur", motif: "haldi",   image: "assets/images/fn-haldi.webp" },
    { name: "Mayra",                      date: "2026-12-03", day: "Thursday", time: "Afternoon, 2:00 PM",        location: "Treehouse Rajbagh, Jodhpur", motif: "mayra",   image: "assets/images/fn-mayra.webp" },
    { name: "Sangeet", date: "2026-12-03", day: "Thursday", time: "Evening, 7:00 PM", location: "Treehouse Rajbagh, Jodhpur", motif: "dholak", image: "assets/images/fn-sangeet.webp" },
    { name: "Barat Swagat",               date: "2026-12-04", day: "Friday",   time: "Morning, 11:00 AM",         location: "Treehouse Rajbagh, Jodhpur", motif: "toran",   image: "assets/images/fn-barat.webp" },
    { name: "Hast Milap",                 date: "2026-12-04", day: "Friday",   time: "Afternoon, 12:15 PM",       location: "Treehouse Rajbagh, Jodhpur", motif: "agni",    image: "assets/images/fn-hastmilap.webp" },
    { name: "Preeti Bhoj (Reception)",    date: "2026-12-04", day: "Friday",   time: "Evening, 7:00 PM onwards",  location: "Treehouse Rajbagh, Jodhpur", motif: "lantern", image: "assets/images/fn-reception.webp", framed: true }
  ],

  /* ---------------- Venue ----------------
     Fill these in when the details are final.
     mapsUrl: open Google Maps, find the place, tap Share → Copy link, paste here. */
  venue: {
    name: "Treehouse Rajbagh",
    address: "Dali Bai Circle, Near Jhanwar Rd, Bhadu Market,\nJaisalmer, Jodhpur, Rajasthan 342014",
    mapsUrl: "",
    note: ""          /* optional line, e.g. "Parking available at the main gate" */
  }
};
