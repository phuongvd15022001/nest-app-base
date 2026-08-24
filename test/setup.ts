import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  globalThis.crypto = webcrypto as any;
}
