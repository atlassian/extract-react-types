import LZString from 'lz-string';

export const compress = string =>
  LZString.compressToBase64(string)
    .replace(/\+/g, '-') // Convert '+' to '-'
    .replace(/\//g, '_') // Convert '/' to '_'
    .replace(/=+$/, ''); // Remove ending '='

export const decompress = string =>
  LZString.decompressFromBase64(
    string
      .replace(/-/g, '+') // Convert '-' to '+'
      .replace(/_/g, '/') // Convert '_' to '/'
  );

export const encode = value => window.encodeURIComponent(value);

export const decode = value => {
  try {
    return window.decodeURIComponent('' + value);
  } catch (err) {
    return value;
  }
};

export const updateQuery = state => {
  const query = Object.keys(state)
    .map(key => {
      return key === 'code' ? `${key}_lz=` + state.code : key + '=' + encode(state[key]);
    })
    .join('&');

  window.location.hash = '?' + query;
};

export const parseQuery = () => {
  const raw = document.location.hash
    .replace(/^#\?/, '')
    .split('&')
    .reduce((reduced, pair) => {
      const pieces = pair.split('=');
      const name = decodeURIComponent('' + pieces[0]);

      let value = decodeURIComponent('' + pieces[1]);
      if (value === 'true' || value === 'false') {
        value = value === 'true';
      }

      reduced[name] = value;
      return reduced;
    }, {});
  return raw;
};
