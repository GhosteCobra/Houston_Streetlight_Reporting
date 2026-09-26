import { openDB } from "idb";
import { draftSchema, type Draft } from "./model";
const db = () =>
  openDB("streetlight-check", 1, {
    upgrade(database) {
      database.createObjectStore("drafts", { keyPath: "id" });
    },
  });
export async function listDrafts(): Promise<Draft[]> {
  const database = await db();
  try {
    return (await database.getAll("drafts"))
      .flatMap((v) => {
        const r = draftSchema.safeParse(v);
        return r.success ? [r.data] : [];
      })
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  } finally {
    database.close();
  }
}
export async function saveDraft(draft: Draft) {
  const valid = draftSchema.parse(draft);
  const database = await db();
  try {
    const tx = database.transaction("drafts", "readwrite");
    const count = await tx.store.count();
    const existing = await tx.store.get(valid.id);
    if (count >= 20 && !existing) {
      tx.abort();
      await tx.done.catch(() => {});
      throw Error(
        "You have 20 drafts. Delete an old draft before saving another.",
      );
    }
    await tx.store.put(valid);
    await tx.done;
  } finally {
    database.close();
  }
}
export async function deleteDraft(id: string) {
  const database = await db();
  try {
    await database.delete("drafts", id);
  } finally {
    database.close();
  }
}
