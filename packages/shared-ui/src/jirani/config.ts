import { Platform } from 'react-native';

/**
 * Where the TV finds Jirani. Defaults to a local `pnpm mcp` on this computer: the
 * Android emulator reaches it at 10.0.2.2, everything else at localhost.
 *
 * To point a build at the deployed stack, copy config.local.example.json to
 * config.local.json (git-ignored) and fill in the ApiUrl and the API token. The
 * token ends up inside the app bundle, so use it on an emulator only; a real
 * product would pair each TV with its own token.
 */
export interface JiraniConfig {
  /** Jirani's API base, ending in "/": the local server or the deployed ApiUrl. */
  url: string;
  /** Bearer token for the deployed API; empty for a local server. */
  token: string;
  /** Language of the card. */
  lang: 'en' | 'es';
  /** Who "Call …" asks to phone her. */
  familyName: string;
  /** How often to look for an open check-in. */
  pollSeconds: number;
}

let local: Partial<JiraniConfig> = {};
try {
  // Optional: Metro skips a missing module required inside try/catch.
  local = require('./config.local.json');
} catch {
  // No local config: talk to a local Jirani.
}

const withSlash = (u: string) => (u.endsWith('/') ? u : `${u}/`);

export const jiraniConfig: JiraniConfig = {
  url: withSlash(local.url ?? (Platform.OS === 'android' ? 'http://10.0.2.2:3333/' : 'http://localhost:3333/')),
  token: local.token ?? '',
  lang: local.lang === 'es' ? 'es' : 'en',
  familyName: local.familyName ?? 'Amina',
  pollSeconds: local.pollSeconds ?? 5,
};
