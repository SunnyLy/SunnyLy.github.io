# Repository Guidelines

## Project Structure & Module Organization

This repository contains a published static blog, with pages identifying Hexo 3.8.0 as their generator. Hexo source files, theme templates, and build configuration are not checked in.

- `index.html` is the homepage; `archives/` contains archive pages.
- `2019/01/05/` contains a dated article and its local images.
- `photoes/` contains the gallery page, JSON data, JavaScript, and styles. Preserve this existing directory spelling.
- `css/`, `js/`, `images/`, `img/`, and `fonts/` hold shared assets; `fancybox/` contains bundled lightbox code.
- Root files such as `main.0cf68a.js` are generated bundles.
- `test/index.html` is a published page, not an automated test suite.
- `.well-known/assetlinks.json` configures Android App Links; `tyinstall.html` provides an application link.

## Build, Test, and Development Commands

Run commands from the repository root:

- `python -m http.server 8000 --bind 127.0.0.1`: serve the site locally; open `http://127.0.0.1:8000/`.
- `python -m json.tool .well-known/assetlinks.json`: check App Links JSON syntax. Use the same command for changed gallery JSON files.
- `git diff --check`: detect whitespace errors before review.

No package manifest, build script, linter configuration, or test runner is checked in. Preview the committed files directly.

## Coding Style & Naming Conventions

Match surrounding formatting: shared JavaScript and CSS generally use two spaces; gallery CSS uses tabs. Preserve UTF-8 text, existing URLs, and dated article paths. Keep edits focused and avoid reformatting generated HTML or bundled dependencies. Preserve hashed asset filenames unless replacing a bundle and updating all references together. Follow existing JavaScript conventions, including the jQuery wrapper in `js/script.js`.

## Testing Guidelines

There is no automated coverage requirement. Manually check affected pages at desktop and narrow mobile widths. Verify navigation, images, gallery loading, and lightbox behavior where relevant. Check browser console errors and failed network requests. Validate changed JSON separately; syntax validation does not verify Android association behavior.

## Commit & Pull Request Guidelines

History uses short English or Chinese action summaries, such as `Update assetlinks.json`, alongside generated `Site updated:` entries. Use a concise, descriptive subject. Pull requests should explain the purpose, list affected routes, document validation, link related issues when available, and include screenshots for visual changes.

## Agent Instructions

Check `git status` before editing and preserve unrelated changes. Do not commit, push, tag, delete source files, or run destructive cleanup commands without explicit authorization.
