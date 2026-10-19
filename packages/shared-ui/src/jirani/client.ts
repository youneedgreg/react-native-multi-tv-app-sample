import { jiraniConfig } from './config';

/**
 * The two calls the TV card makes to Jirani: read its state to find an open
 * check-in, and answer it through Jirani's MCP server (tools/call answer_checkin),
 * the same tool Alexa+ and the voice client use.
 */

export interface OpenCheckin {
  /** The escalation's id; the card shows once per id. */
  id: string;
  residentName: string;
  /** Jirani's own words for the check-in, in English. */
  message: string;
}

interface LadderAction {
  type: string;
  message: string;
}
interface JiraniState {
  household: { residentName: string };
  escalations: { id: string; status: string; history: { actions: LadderAction[] }[] }[];
}

const headers = (extra: Record<string, string> = {}) => ({
  ...extra,
  ...(jiraniConfig.token ? { authorization: `Bearer ${jiraniConfig.token}` } : {}),
});

/** The open alert in which Jirani has asked her directly, if there is one. */
export async function findOpenCheckin(): Promise<OpenCheckin | null> {
  const r = await fetch(`${jiraniConfig.url}api/state`, { headers: headers() });
  if (!r.ok) throw new Error(`Jirani answered ${r.status}`);
  const s = (await r.json()) as JiraniState;
  for (const e of s.escalations) {
    if (e.status !== 'open') continue;
    const ask = e.history.flatMap((step) => step.actions).find((a) => a.type === 'checkin_resident');
    if (ask) return { id: e.id, residentName: s.household.residentName, message: ask.message };
  }
  return null;
}

export type Answer = 'ok' | 'call_family';

/** Answer the check-in as her, from the TV. Returns Jirani's reply. */
export async function answerCheckin(outcome: Answer): Promise<string> {
  const r = await fetch(`${jiraniConfig.url}mcp`, {
    method: 'POST',
    headers: headers({ 'content-type': 'application/json', accept: 'application/json, text/event-stream' }),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: 'answer_checkin', arguments: { from: 'resident', outcome, note: 'Answered on the TV' } },
    }),
  });
  const raw = await r.text();
  if (!r.ok) throw new Error(`Jirani answered ${r.status}`);
  // Stateless Streamable HTTP: a JSON body, or one SSE "data:" line.
  const json = raw.trimStart().startsWith('{')
    ? raw
    : raw
        .split('\n')
        .find((l) => l.startsWith('data: '))
        ?.slice(6);
  if (!json) throw new Error('Jirani sent no answer');
  const res = JSON.parse(json) as {
    result?: { content: { text?: string }[]; isError?: boolean };
    error?: { message: string };
  };
  if (res.error || !res.result || res.result.isError)
    throw new Error(res.error?.message ?? res.result?.content[0]?.text ?? 'Jirani refused the answer');
  return res.result.content.map((c) => c.text ?? '').join(' ');
}
