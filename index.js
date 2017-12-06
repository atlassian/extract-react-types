// @flow
"use strict";

const createBabelFile = require("babel-file");
const { loadImportSync } = require("babel-file-loader");
const { isFlowIdentifier } = require("babel-flow-identifiers");
const { findFlowBinding } = require("babel-flow-scope");
const { getIdentifierKind } = require("babel-identifiers");
const { isReactComponentClass } = require("babel-react-components");
const createBabylonOptions = require("babylon-options");
const babylon = require("babylon");
const babel = require("babel-core");
const t = require("babel-types");
const stripIndent = require("strip-indent");
const { normalizeComment } = require("babel-normalize-comments");

const matchExported = require("./matchExported");
const converters = {};

const getPropFromObject = (obj, property) => {
  if (!property.key || !property.key.name) {
    return;
    // look into resolving this. It's types being returned instead of idents...
    // more, the with leadinComments etc, very weird
  }
  return obj.members.find(p => p.key === property.key.name);
};

const resolveFromGeneric = type => {
  if (type.kind !== "generic") return type;
  return resolveFromGeneric(type.value);
};

const getProp = (props, property) => {
  let prop;
  if (props.kind === "intersection") {
    props.types.forEach(pr => {
      if (pr.kind === "generic") {
        if (pr.value.kind === "object") {
          prop = getPropFromObject(pr.value, property) || prop;
        }
      } else if (pr.kind === "object") {
        prop = getPropFromObject(pr, property) || prop;
      }
    });
  } else if (props.kind === "object") {
    prop = getPropFromObject(props, property);
  }
  return prop;
};

const getDefaultProps = (path, context) => {
  let defaultProps = null;

  path
    .get("body")
    .get("body")
    .find(p => {
      if (
        p.isClassProperty() &&
        p.get("key").isIdentifier({ name: "defaultProps" })
      ) {
        defaultProps = convert(p, { ...context, mode: "value" });
      }
    });
  return defaultProps;
};

converters.Program = (path, context) => {
  let result = {};
  result.kind = "program";
  result.classes = [];

  path.traverse({
    ClassDeclaration(path) {
      if (!isReactComponentClass(path)) return;
      let params = path.get("superTypeParameters").get("params");
      let props = params[0];
      let defaultProps = getDefaultProps(path);

      let classProperties = convert(props, { ...context, mode: "type" });

      if (defaultProps && defaultProps.value && defaultProps.value.members) {
        defaultProps.value.members.forEach(property => {
          let ungeneric = resolveFromGeneric(classProperties);
          const prop = getProp(ungeneric, property);
          if (prop) prop.default = property.value;
        });
      }

      result.classes.push(classProperties);
    }
  });

  return result;
};

converters.SpreadElement = (path, context) => {
  return {
    kind: "spread",
    value: convert(path.get("argument"), context)
  };
};

converters.ClassProperty = (path, context) => {
  return {
    kind: "property",
    key: convert(path.get("key"), context),
    value: convert(path.get("value"), context)
  };
};

converters.CallExpression = (path, context) => {
  let callee = convert(path.get("callee"), context);
  let args = path.get("arguments").map(a => convert(a, context));

  return {
    kind: "call",
    callee,
    args
  };
};

converters.ObjectProperty = (path, context) => {
  return {
    kind: "property",
    key: convert(path.get("key"), context),
    value: convert(path.get("value"), context)
  };
};

converters.StringLiteral = (path, context) => {
  return { kind: "string", value: path.node.value };
};

converters.NumericLiteral = (path, context) => {
  return { kind: "number", value: path.node.value };
};

converters.NullLiteral = (path, context) => {
  return { kind: "null" };
};

converters.BooleanLiteral = (path, context) => {
  return { kind: "boolean", value: path.node.value };
};

converters.ArrayExpression = (path, context) => {
  return {
    kind: "array",
    elements: path.get("elements").map(e => convert(e, context))
  };
};

converters.BinaryExpression = (path, context) => {
  return {
    kind: "binary",
    operator: path.node.operator,
    left: convert(path.get("left"), context),
    right: convert(path.get("right"), context)
  };
};

converters.MemberExpression = (path, context) => {
  return {
    kind: "memberExpression",
    object: convert(path.get("object"), context),
    property: convert(path.get("property"), context)
  };
};

function convertParameter(param, context) {
  let { type, ...rest } = convert(param, context);
  return {
    kind: "param",
    value: rest,
    type
  };
}

converters.ArrowFunctionExpression = (path, context) => {
  let parameters = path.get("params").map(p => convertParameter(p, context));
  let returnType = null;

  if (path.node.returnType) {
    returnType = convert(path.get("returnType"), context);
  }

  return {
    kind: "function",
    id: null,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
};

converters.FunctionExpression = (path, context) => {
  let parameters = path.get("params").map(p => convertParameter(p, context));
  let returnType = null;

  if (path.node.returnType) {
    returnType = convert(path.get("returnType"), context);
  }

  return {
    kind: "function",
    id: null,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
};

converters.TypeAnnotation = (path, context) => {
  return convert(path.get("typeAnnotation"), context);
};

converters.ExistsTypeAnnotation = (path, context) => {
  return { kind: "exists" };
};

converters.ObjectTypeAnnotation = (path, context) => {
  let result = {};

  result.kind = "object";
  result.members = [];

  let properties = path.get("properties");

  for (let property of properties) {
    result.members.push(convert(property, context));
  }

  return result;
};

converters.ObjectTypeProperty = (path, context) => {
  let result = {};
  result.kind = "property";
  result.key = path.get("key").node.name;
  result.value = convert(path.get("value"), context);
  result.optional = path.node.optional;
  return result;
};

converters.UnionTypeAnnotation = (path, context) => {
  const types = path.get("types").map(p => convert(p, context));
  return { kind: "union", types };
};

converters.TypeParameterInstantiation = (path, context) => {
  return path.get("params").map(p => ({
    kind: "typeParam",
    type: convert(p, context)
  }));
};

converters.GenericTypeAnnotation = (path, context) => {
  let result = {};

  result.kind = "generic";
  result.value = convert(path.get("id"), context);
  if (path.node.typeParameters) {
    result.typeParams = convert(path.get("typeParameters"), context);
  }
  return result;
};

converters.ObjectMethod = (path, context) => {
  let parameters = path.get("params").map(p => convertParameter(p, context));
  let returnType = null;

  if (path.node.returnType) {
    returnType = convert(path.get("returnType"), context);
  }

  return {
    kind: "function",
    id: null,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
};

converters.ObjectExpression = (path, context) => {
  let members = [];
  path.get("properties").forEach(p => {
    let mem = convert(p, context);
    if (mem.kind === "spread") {
      if (mem.value.kind === "initial" && mem.value.value.kind === "object") {
        members = members.concat(mem.value.value.members);
      } else if (mem.value.kind === "object") {
        members = members.concat(mem.value.members);
      } else if (mem.value.kind === "variable") {
        let dcl = mem.value.declarations;
        dcl = dcl[dcl.length - 1].value;
        if (dcl.kind !== "object") {
          throw new Error("Trying to spread a non-object item onto an object");
        } else {
          members = members.concat(dcl.members);
        }
      }
    } else if (mem.kind === "property") {
      members.push(mem);
    }
  });

  return {
    kind: "object",
    members
  };
};

converters.VariableDeclaration = (path, context) => {
  let res = {};
  res.kind = "variable";
  res.declarations = path.get("declarations").map(p => convert(p, context));
  return res;
};
converters.VariableDeclarator = (path, context) => {
  return {
    kind: "initial",
    id: convert(path.get("id"), context),
    value: convert(path.get("init"), context)
  };
};

converters.Identifier = (path, context) => {
  let kind = getIdentifierKind(path);
  let name = path.node.name;

  if (context.mode === "value") {
    let res = {};
    if (kind === "reference") {
      let binding = path.scope.getBinding(name);

      if (binding) {
        let bindingPath = binding.path;
        let foundPath = null;

        if (bindingPath.isVariableDeclaration()) {
          foundPath = bindingPath.get("declarators").find(p => {
            return p.node.name === name;
          });
        } else if (bindingPath.isVariableDeclarator()) {
          foundPath = bindingPath.get("init");
        } else if (
          bindingPath.isImportDefaultSpecifier() ||
          bindingPath.isImportNamespaceSpecifier()
        ) {
          foundPath = bindingPath;
        } else if (bindingPath.isImportSpecifier()) {
          foundPath = bindingPath;
        } else if (bindingPath.isDeclaration()) {
          foundPath = bindingPath.get("id");
        }

        if (foundPath === null || foundPath === undefined) {
          throw new Error(
            `Unable to resolve binding path for: ${bindingPath.type}`
          );
        }
        return convert(foundPath, context);
      } else {
        let type = null;

        if (path.node.typeAnnotation) {
          type = convert(path.get("typeAnnotation"), {
            ...context,
            mode: "type"
          });
        }

        return {
          kind: "id",
          name,
          type
        };
      }
    } else if (kind === "static" || kind === "binding") {
      let type = null;

      if (path.node.typeAnnotation) {
        type = convert(path.get("typeAnnotation"), {
          ...context,
          mode: "type"
        });
      }

      return {
        kind: "id",
        name,
        type
      };
    } else {
      throw new Error(`Unable to resolve path for: ${kind}`);
    }
  } else if (context.mode === "type") {
    if (kind === "reference") {
      let bindingPath;

      if (isFlowIdentifier(path)) {
        let flowBinding = findFlowBinding(path, path.node.name);
        if (!flowBinding) throw new Error();
        bindingPath = flowBinding.path.parentPath;
      } else {
        bindingPath = path.scope.getBinding(path.node.name);
      }

      if (bindingPath) {
        return convert(bindingPath, context);
      } else {
        return { kind: "id", name: path.node.name };
      }
    }
  }
};

converters.TypeAlias = (path, context) => {
  return convert(path.get("right"), context);
};

converters.IntersectionTypeAnnotation = (path, context) => {
  const types = path.get("types").map(p => convert(p, context));
  return { kind: "intersection", types };
};

converters.QualifiedTypeIdentifier = (path, context) => {
  return convert(path.get("id"), context);
};

converters.VoidTypeAnnotation = path => {
  return { kind: "void" };
};

converters.BooleanTypeAnnotation = path => {
  return { kind: "boolean" };
};

converters.StringLiteralTypeAnnotation = path => {
  return { kind: "stringLiteral", value: path.node.value };
};

converters.NumberLiteralTypeAnnotation = path => {
  return { kind: "numberLiteral" };
};

converters.MixedTypeAnnotation = path => {
  return { kind: "mixed" };
};

converters.AnyTypeAnnotation = path => {
  return { kind: "any" };
};

converters.NumberTypeAnnotation = path => {
  return { kind: "number" };
};

converters.FunctionTypeParam = (path, context) => {
  return convert(path.get("typeAnnotation"), context);
};

converters.FunctionTypeAnnotation = (path, context) => {
  const parameters = path.get("params").map(p => convert(p, context));
  const returnType = convert(path.get("returnType"), context);

  return {
    parameters,
    returnType,
    kind: "function"
  };
};

converters.StringTypeAnnotation = path => {
  return { kind: "string" };
};

converters.NullableTypeAnnotation = (path, context) => {
  return {
    kind: "nullable",
    arguments: convert(path.get("typeAnnotation"), context)
  };
};

converters.TSStringKeyword = path => {
  return { kind: "string" };
};

converters.TSNumberKeyword = path => {
  return { kind: "number" };
};

converters.TSBooleanKeyword = path => {
  return { kind: "boolean" };
};

converters.TSVoidKeyword = path => {
  return { kind: "void" };
};

// converters.TSPropertySignature = path => {
// };

converters.TSTypeLiteral = (path, context) => {
  let result = {};

  result.kind = "object";
  // TODO: find object key
  // result.key = '';
  result.props = [];

  let properties = path.get("members");

  properties.forEach(memberPath => {
    result.props.push(
      convert(memberPath.get("typeAnnotation").get("typeAnnotation"), context)
    );
  });

  return result;
};

converters.TSLiteralType = path => {
  return {
    kind: "literal",
    value: path.node.literal.value
  };
};

converters.TSTypeReference = (path, context) => {
  return convert(path.get("typeName"), context);
};

converters.TSUnionType = (path, context) => {
  const types = path.get("types").map(p => convert(p, context));
  return { kind: "union", types };
};

converters.TSAnyKeyword = path => {
  return { kind: "any" };
};

converters.TSTupleType = (path, context) => {
  const types = path.get("elementTypes").map(p => convert(p, context));
  return { kind: "tuple", types };
};

converters.TSFunctionType = (path, context) => {
  const parameters = path.get("parameters").map(p => convert(p, context));
  const returnType = convert(
    path.get("typeAnnotation").get("typeAnnotation"),
    context
  );

  return {
    kind: "function",
    returnType,
    parameters
  };
};

converters.ObjectTypeSpreadProperty = (path, context) => {
  return {
    kind: "spread",
    value: convert(path.get("argument"), context)
  };
};

function importConverterGeneral(path, context) {
  let importKind = path.node.importKind || path.parent.importKind || "value";
  let moduleSpecifier = path.parent.source.value;

  if (!path.hub.file.opts.filename) {
    let name = path.node.imported.name;

    return {
      kind: "import",
      importKind,
      name,
      moduleSpecifier
    };
  } else {
    let kind = path.parent.importKind;
    if (kind === "typeof") {
      throw new Error({ path, error: "import typeof is unsupported" });
    }

    if (!/^\./.test(path.parent.source.value)) {
      return {
        kind: "external",
        importKind,
        name: path.node.imported.name,
        moduleSpecifier
      };
    }

    let file = loadImportSync(path.parentPath, context.resolveOptions);

    let name;
    if (path.type === "ImportDefaultSpecifier" && kind === "value") {
      name = "default";
    } else if (path.node.imported) {
      name = path.node.imported.name;
    } else {
      name = path.node.local.name;
    }

    let id;
    if (path.node.imported) {
      id = path.node.imported.name;
    } else {
      id = path.node.local.name;
    }

    let exported = matchExported(file, name);
    if (!exported) {
      let name = `${path.node.imported.name}`;

      return {
        kind: "import",
        importKind,
        name,
        moduleSpecifier
      };
    }

    return convert(exported, { ...context, replacementId: t.identifier(id) });
  }
}

converters.ImportDefaultSpecifier = (path, context) => {
  return importConverterGeneral(path, context);
};

converters.ImportSpecifier = (path, context) => {
  return importConverterGeneral(path, context);
};

function attachCommentProperty(source, dest, name) {
  if (!source || !source[name]) return;
  if (!dest[name]) dest[name] = [];

  let comments = source[name].map(comment => {
    return {
      type: comment.type === "CommentLine" ? "commentLine" : "commentBlock",
      value: normalizeComment(comment),
      raw: comment.value
    };
  });

  dest[name] = dest[name].concat(comments);
}

function attachComments(source, dest) {
  attachCommentProperty(source, dest, "leadingComments");
  attachCommentProperty(source, dest, "trailingComments");
  attachCommentProperty(source, dest, "innerComments");
}

function convert(path, context) {
  if (typeof path.get !== "function")
    throw new Error(
      `Did not pass a NodePath to convert() ${JSON.stringify(path)}`
    );
  let converter = converters[path.type];
  if (!converter) throw new Error(`Missing converter for: ${path.type}`);
  let result = converter(path, context);
  attachComments(path.node, result);
  return result;
}

function extractReactTypes(
  code /*: string */,
  typeSystem /*: 'flow' | 'typescript' */,
  filename /*:? string */,
  resolveOptions /*:? Object */ = {}
) {
  let plugins = ["jsx"];

  if (typeSystem === "flow") plugins.push("flow");
  else if (typeSystem === "typescript") plugins.push("typescript");
  else throw new Error('typeSystem must be either "flow" or "typescript"');

  let parserOpts = createBabylonOptions({
    stage: 2,
    plugins
  });

  let file = new babel.File({
    options: { parserOpts, filename },
    passes: []
  });

  try {
    file.addCode(code);
    file.parseCode(code);
  } catch (err) {
    console.log(err);
  }
  return convert(file.path, { resolveOptions });
}

module.exports = extractReactTypes;
