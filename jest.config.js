const preconstruct = require('preconstruct');

module.exports = {
  moduleNameMapper: preconstruct.aliases.jest(__dirname)
};
