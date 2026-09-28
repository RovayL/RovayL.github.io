# Yavor Litchev — personal website

A plain HTML, CSS, and JavaScript academic website. No build step or third-party runtime dependencies.

## Local preview

Run from this repository:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://localhost:8000. Serve **this directory only**, not the private parent directory.

## Editing

- `index.html`: biography and dated entries, newest first. Add a `<li class="entry">` to the relevant section.
- `style.css`: colors, typography, layout, background visibility, and responsive styles.
- `hilbert.js`: the red/blue Hilbert curve link transition; respects reduced motion, modified clicks, and same-page navigation.
- `papers/`: public copies of papers and presentations, with stable descriptive filenames.
- `assets/`: public portrait, cropped Tintin masthead image, binary background, résumé, and favicon.

Pair a project's Paper and Presentation links in the same entry. The two CURIS projects are separate entries. The signature presentation dates from MIT PRIMES 2021; the publication entry uses the JMM 2022 date. PRAWNS and the Paillier paper are explicitly labeled preprints rather than conference publications.

Dates for course projects follow the supplied transcripts and résumé. The ISA superposition paper is listed as independent research for CS 199P in winter 2025, following the author’s correction. The biography uses the requested MS date range, while noting that the BS was completed in 2026.

## GitHub Pages (after reviewing the draft)

Create a public repository named `<GitHub-username>.github.io` for an account-level website. Connect this repository to that remote and push `main`. In GitHub Settings → Pages, choose **Deploy from a branch**, **main**, and **/ (root)**. The `.nojekyll` file allows direct static serving. A project repository instead serves at `https://<username>.github.io/<repository>/`; the site's relative asset links support either location.

Everything committed in this repository is intended to be public. Transcripts and private source folders are outside the repository and are not needed to run or deploy the site. The résumé is included as requested and contains the contact information in the supplied version.
