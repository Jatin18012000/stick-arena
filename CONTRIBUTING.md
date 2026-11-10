# Contributing

Stick Arena is a personal project with one maintainer, but issues and small
pull requests are welcome.

## Issues

- **Bugs:** say what you did, what you expected and what happened, plus your
  browser and OS. A screenshot or the browser console output helps a lot.
- **Ideas:** open an issue to discuss before writing code for anything big
  (a new weapon, arena or game mode), so effort isn't wasted on something that
  doesn't fit.

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Set up with `npm ci`, then `npm run doctor` to confirm your environment.
3. Make your change. Match the surrounding style: small focused modules,
   plain ES modules, no new runtime dependencies without discussion.
4. Run the tests: `npm run test:dist` must pass (`26/26`). If you change
   gameplay, add or update a check in `tests/smoke.mjs`.
5. Open the pull request with a short description of what changed and why.
   CI runs the same tests on every pull request.

By contributing you agree that your contributions are licensed under the
project's [MIT License](LICENSE).
