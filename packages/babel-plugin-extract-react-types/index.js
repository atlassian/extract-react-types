const { findExportedComponents } = require('extract-react-types');

module.exports = babel => {
  let t = babel.types;
  return {
    visitor: {
      Program(programPath, state) {
        let typeSystem = state.file.opts.parserOpts.plugins
          .map(plugin => (Array.isArray(plugin) ? plugin[0] : plugin))
          .find(plugin => plugin === 'flow' || plugin === 'typescript');

        if (typeSystem) {
          try {
            let components = findExportedComponents(programPath, typeSystem, state.file.filename);
            components.forEach(({ name, component }) => {
              // TODO: handle when name is null
              // it will only happen when it's the default export
              // generate something like this
              // export default (var someName = function() {}, someName.___types = theTypes, someName)
              if (name !== null) {
                programPath.node.body.push(
                  t.expressionStatement(
                    t.assignmentExpression(
                      '=',
                      t.memberExpression(t.identifier(name), t.identifier('___types')),
                      babel.parse(`(${JSON.stringify(component)})`).program.body[0].expression
                    )
                  )
                );
              }
            });
            /* eslint-disable no-empty */
          } catch (e) {}
        }
      }
    }
  };
};
