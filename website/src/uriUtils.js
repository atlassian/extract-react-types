import LZString from 'lz-string';

export const compress = (string: string) =>
  LZString.compressToBase64(string)
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove ending '='

export const decompress = (string: string) =>
  LZString.decompressFromBase64(
    string
      .replace(/-/g, '+') // Convert '-' to '+'
      .replace(/_/g, '/') // Convert '_' to '/'
  );

export const encode = (value: any) => window.encodeURIComponent(value);

export const updateQuery = (state: PersistedState) => {
  const query = Object.keys(state)
    .map(key => {
      return key === 'code' ? `${key}_lz=` + compress(state.code) : key + '=' + encode(state[key]);
    })
    .join('&');

  window.location.hash = '?' + query;
};
