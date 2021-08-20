/**
 *
 * @param data
 * @param secret
 * @returns {Promise<*>}
 */
const hmacSHA512 = async (data, secret) => {
  const algorithm = { name: 'HMAC', hash: 'SHA-512' };
  const key = await crypto.subtle.importKey('raw', secret, algorithm, false, ['sign']);
  const signature = await crypto.subtle.sign(algorithm.name, key, data);

  return new Uint8Array(signature);
}

const sliceInHalf = (arr) => {
  return [arr.slice(0, arr.length / 2), arr.slice(arr.length / 2)];
}

export class PrivateKeyDerivation {
  privateKey;
  chainCode;

  constructor(
    privateKey = new Uint8Array(32),
    chainCode = new Uint8Array(32),
  ) {
    this.privateKey = privateKey;
    this.chainCode = chainCode;
  }

  /**
   *
   * @param {Uint8Array | string | number} branch
   * @returns {PrivateKeyDerivation}
   */
  async derive(branch) {
    if (typeof branch === 'number') {
      return this.derive(
        new Uint8Array([(branch >>> 24) % 256, (branch >>> 16) % 256, (branch >>> 8) % 256, (branch >>> 0) % 256]),
      );
    }

    if (typeof branch === 'string') {
      return this.derive(new Uint8Array(branch.split('').map((item) => item.charCodeAt(0))));
    }

    const signature = await hmacSHA512(new Uint8Array([
      ...this.privateKey,
      ...branch,
    ]), this.chainCode);

    return new PrivateKeyDerivation(...sliceInHalf(signature));
  }

  toString() {
    return btoa(String.fromCharCode(...this.privateKey));
  }
}
