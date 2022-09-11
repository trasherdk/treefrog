Treefrog
===

Treefrog is a platform for prototyping novel interaction designs for code editing.  It's also a fully-fledged standard code editor with syntax highlighting, find/replace, and snippets.

Treefrog runs on Electron and the web.  Platform-specific code (as in web vs Electron, not Windows/Mac/Linux) is in [src/platforms](./src/platforms).

Project structure
---

The main code for Treefrog is in [src/modules](./src/modules).  These constitute the business logic, including some aspects of rendering (see e.g. [src/modules/View/renderCodeAndMargin.js](./src/modules/View/renderCodeAndMargin.js), which coordinates with [src/components/Editor/canvas/render.js](./src/components/Editor/canvas/render.js) to render the code and margin).

The UI is written in Svelte and is in [src/components](./src/components).  The app is decoupled from the UI and can run without it, with the UI being added later (all communication to the UI that's initiated by the app is done by events, and the UI can render an app in any initial state).

This project uses the [ENTRYPOINT](https://gist.github.com/gushogg-blake/247b1bf2ed46b035d1c8a2c1e776b607) convention -- comments that start with `// ENTRYPOINT` indicate top-level entry points such as the main function and event handlers.

Non-obvious mechanisms
---

A short list of mechanisms and couplings that aren't self-evident from e.g. `require` or `import` statements.

The cause of this is usually dynamism, implicitly available global state, or some combination of the two, causing that the source of a particular symbol or object cannot be simply followed through hard-coded references in the code.

- Theme variables. CSS can use variables like `--appBackgroundColor` without getting them from an import. These are ultimately defined in themes ([stores/themes](./src/modules/stores/themes)) and added to the top-level component's (App.svelte's) DOM by [components/themeStyle.js](./src/components/themeStyle.js).

