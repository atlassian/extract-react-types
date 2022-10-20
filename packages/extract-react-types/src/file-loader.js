const { readFileSync } = require('fs');
const { dirname } = require('path');
const { sync: resolveSync } = require('resolve');
const readFileAsync = require('read-file-async');
const resolveAsync = require('resolve-async');
const createFile = require('babel-file');

function getPathFileName(path) {
  return path.hub.file.opts.filename;
}

function getImportSource(path) {
  return path.node.source.value;
}

function toResolveOptions(fromPath, resolveOpts) {
  return Object.assign({}, resolveOpts, { basedir: dirname(fromPath) });
}

export function resolveFilePathAsync(path, filePath, resolveOpts) {
  let fromPath = getPathFileName(path);
  let opts = toResolveOptions(fromPath, resolveOpts);
  return resolveAsync(filePath, opts);
}

export function resolveFilePathSync(path, filePath, resolveOpts) {
  let fromPath = getPathFileName(path);
  let opts = toResolveOptions(fromPath, resolveOpts);
  return resolveSync(filePath, opts);
}

export function resolveImportFilePathAsync(importDeclaration, resolveOpts) {
  let fromPath = getPathFileName(importDeclaration);
  let toPath = getImportSource(importDeclaration);
  let opts = toResolveOptions(fromPath, resolveOpts);
  return resolveAsync(toPath, opts);
}

export function resolveImportFilePathSync(importDeclaration, resolveOpts) {
  let fromPath = getPathFileName(importDeclaration);
  let toPath = getImportSource(importDeclaration);
  let opts = toResolveOptions(fromPath, resolveOpts);
  return resolveSync(toPath, opts);
}

export function loadFileAsync(filePath, parserOpts) {
  return readFileAsync(filePath).then(buffer =>
    createFile(buffer.toString(), { filename: filePath, parserOpts })
  );
}

export function loadFileSync(filePath, parserOpts) {
  let buffer = readFileSync(filePath);
  return createFile(buffer.toString(), { filename: filePath, parserOpts });
}

export function loadImportAsync(importDeclaration, resolveOpts, parserOpts) {
  return resolveImportFilePathAsync(importDeclaration, resolveOpts).then(resolved =>
    loadFileAsync(resolved, parserOpts)
  );
}

export function loadImportSync(importDeclaration, resolveOpts, parserOpts) {
  const resolved = resolveImportFilePathSync(importDeclaration, resolveOpts);
  return loadFileSync(resolved, parserOpts);
}
