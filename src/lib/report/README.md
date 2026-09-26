# Local report model and persistence

Person 3 owns draft orchestration; Persons 4 and 5 review schema, persistence and photo changes.

- `model.ts`: Zod schemas and local draft types.
- `photo.ts`: decode, validate and normalize images in the browser.
- `storage.ts`: explicit IndexedDB operations, including updates and deletion.

These modules implement browser-local demo drafts. They do not upload photos or implement the planned Supabase API. See [runtime contracts](../../../docs/local-frontend.md#current-behavior-and-contracts).
