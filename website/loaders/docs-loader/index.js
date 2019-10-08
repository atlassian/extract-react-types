const bolt = require('bolt');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const readDir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);

module.exports = async function docsLoader() {
  let docs = {
    packageDocs: {},
    documentation: {}
  };
  const ws = await bolt.getWorkspaces();

  for (let workspace of ws) {
    const readMeExists = fs.existsSync(path.resolve(workspace.dir, 'README.md'));
    if (readMeExists) {
      docs.packageDocs[workspace.name] = await readFile(
        path.join(workspace.dir, 'README.md'),
        'utf-8'
      );
    }
  }

  const staticDocs = await readDir(path.join(__dirname, '..', '..', '..', 'docs'));

  for (let staticDoc of staticDocs) {
    docs.documentation[staticDoc] = await readFile(
      path.join(__dirname, '..', '..', '..', 'docs', staticDoc),
      'utf-8'
    );
  }

  return `export default { packageDocs: ${JSON.stringify(
    docs.packageDocs
  )}, staticDocs: ${JSON.stringify(docs.documentation)}}`;
};
