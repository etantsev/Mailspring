import {
  Thread,
  Message,
  Actions,
  SyncbackMetadataTask,
  DraftEditingSession,
} from 'mailspring-exports';

import { PLUGIN_ID, THREAD_PLUGIN_ID } from './send-reminders-constants';

export function reminderDateFor(draftOrThread: Thread | Message | null) {
  if (!draftOrThread) return undefined;
  // Check THREAD_PLUGIN_ID first: new drafts have reminder metadata stored
  // under this key (written by updateDraftReminderMetadata) so the sync engine
  // can promote it to the thread on send. Fall back to PLUGIN_ID for threads,
  // sent messages, and drafts saved before this convention was introduced.
  const meta = (draftOrThread.metadataForPluginId(THREAD_PLUGIN_ID) ||
    draftOrThread.metadataForPluginId(PLUGIN_ID) ||
    {}) as Record<string, unknown>;
  return meta.expiration as Date | undefined;
}

function assertMetadataShape(value: Record<string, unknown>) {
  const t = { ...value };
  if (t.expiration && !(t.expiration instanceof Date)) {
    throw new Error(`"expiration" should always be absent or a date. Received ${t.expiration}`);
  }
  if (t.lastReplyTimestamp && !((t.lastReplyTimestamp as number) < Date.now() / 100)) {
    throw new Error(
      `"lastReplyTimestamp" should always be a unix timestamp in seconds. Received ${t.lastReplyTimestamp}`
    );
  }
  delete t.expiration;
  delete t.shouldNotify;
  delete t.sentHeaderMessageId;
  delete t.lastReplyTimestamp;
  if (Object.keys(t).length > 0) {
    throw new Error(`Unexpected keys in metadata: ${Object.keys(t)}`);
  }
}

export function updateReminderMetadata(thread: Thread, metadataValue: Record<string, unknown>) {
  assertMetadataShape(metadataValue);
  Actions.queueTask(
    SyncbackMetadataTask.forSaving({
      model: thread,
      pluginId: PLUGIN_ID,
      value: metadataValue,
    })
  );
}

export function updateDraftReminderMetadata(
  draftSession: DraftEditingSession,
  metadataValue: Record<string, unknown>
) {
  assertMetadataShape(metadataValue);
  draftSession.changes.add({ pristine: false });
  // Write using THREAD_PLUGIN_ID so the sync engine automatically promotes
  // this metadata to the thread when the draft is sent — no client-side
  // coordination required after send.
  draftSession.changes.addPluginMetadata(THREAD_PLUGIN_ID, metadataValue);
}
