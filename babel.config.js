module.exports = api => {
  // Cache the returned value forever and don't call this function again.
  api.cache(true);

  // Return the value that will be cached.
  return {
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-flow'],
    plugins: [
      'emotion',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-runtime'
      // 'transform-object-rest-spread',
      // 'transform-runtime',
      // 'syntax-dynamic-import'
    ]
  };
};
