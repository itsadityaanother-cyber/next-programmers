## Next Programmers reviews

A responsive React review page styled to match the Next Programmers website, with star ratings, course tags, sorting, an average score, and server-persisted submissions.

## Run locally

Requires Node.js 18 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed in the terminal. The Express API stores reviews in `data/reviews.json` for this local preview. For deployment, use a persistent database and disk; ephemeral hosting filesystems can be reset during redeploys.

## Production build

```sh
npm run build
npm start
```

The API validates submitted fields, but a public deployment should also add moderation, spam protection, and rate limiting.
