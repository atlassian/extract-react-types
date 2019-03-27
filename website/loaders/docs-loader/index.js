const bolt = require('bolt');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const fsStat = promisify(fs.stat);

module.exports = async function docsLoader() {
  let docs = {};
  const ws = await bolt.getWorkspaces();

  for (let workspace of ws) {
    const readMeExists = fs.existsSync(path.resolve(workspace.dir, 'README.md'));
    if (readMeExists) {
      docs[workspace.name] = await readFile(path.join(workspace.dir, 'README.md'), 'utf-8');
    }
  }

  return `export default ${JSON.stringify(docs)}`;
};
