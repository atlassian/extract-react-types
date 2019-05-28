module.exports = api => {
  // Cache the returned value forever and don't call this function again.
  api.cache(true);

  return {
    presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-flow'],
    plugins: [
      'emotion',
      '@babel/plugin-proposal-class-properties',
      '@babel/plugin-transform-runtime'
    ]
  };
};
