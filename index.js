// @flow
type String = { kind: "string", value?: string };
type Param = { kind: "param", value: Array<AnyKind>, type: AnyKind | null };
type TypeParam = { kind: "typeParam", type: AnyTypeKind };
type Id = { kind: "id", name: string, type?: $Diff<AnyKind, Id> | null };
type TemplateLiteral = {
  kind: "templateLiteral",
  expressions: Array<AnyValueKind>,
  quasis: any /* Array<TemplateElement> */
};

type TemplateExpression = { kind: "templateExpression", tag: Id };
type AssignmentPattern = {
  kind: "AssignmentPattern",
  left: AnyKind,
  right: AnyKind
};
/* *** */ type ObjectPattern = {
  kind: "ObjectPattern",
  members: Array<Property>
};
/* *** */ type Obj = { kind: "object", members: Array<Property> };
type ClassKind = { kind: "class", name: Id } | Generic;
/* *** */ type Spread = {
  kind: "spread",
  value: Array<Property | Generic>
};
/* *** */ type Unary = {
  kind: "unary",
  operator: string,
  argument: AnyValueKind
};
type JSXAttribute = { kind: "JSXAttribute", name: string, value: any };
type JSXExpressionContainer = {
  kind: "JSXExpressionContainer",
  value: any
};
type JSXElement = { kind: "JSXElement", value: any };
type JSXIdentifier = { kind: "JSXIdentifier", value: any };
/* *** */ type JSXMemberExpression = {
  kind: "JSXMemberExpression",
  object: any,
  property: any
};
type JSXOpeningElement = {
  kind: "JSXOpeningElement",
  name: any,
  attributes: any
};
type Property = {
  kind: "property",
  key: Id | String,
  value: AnyKind,
  optional?: boolean
};
/* *** */ type Call = {
  kind: "call",
  callee: Id,
  args: Array<AnyValueKind>
};
/* *** */ type New = {
  kind: "new",
  callee: Id,
  args: Array<AnyValueKind>
};
type Typeof = { kind: "typeof", name: string };
type Exists = { kind: "exists" };
type Number = {
  kind: "number",
  value?: number
};
type Null = { kind: "null" };
type Boolean = { kind: "boolean", value?: boolean };
/* *** */ type ArrayExpression = { kind: "array", elements: AnyKind };
/* rename for confusion */
type BinaryExpression = {
  kind: "binary",
  operator: string,
  left: AnyValueKind,
  right: AnyValueKind
};
/* &&& */ type MemberExpression = {
  kind: "memberExpression",
  object: Id,
  property: Id | MemberExpression
};
type Func = {
  kind: "function",
  id?: Id | null,
  async?: boolean,
  generator?: boolean,
  parameters: Param,
  returnType: AnyTypeKind | null
};
/* *** */ type Union = { kind: "union", types: Array<AnyTypeKind> };
/* ~~~ */ type Generic = { kind: "generic", value: AnyTypeKind };
type Initial = { kind: "initial", id: Id, value: AnyValueKind };
type Variable = { kind: "variable", declarations: Array<Initial> };
/* *** */ type Intersection = {
  kind: "intersection",
  types: Array<AnyTypeKind>
};
type Void = { kind: "void" };
type Mixed = { kind: "mixed" };
type Any = { kind: "any" };
type Nullable = { kind: "nullable", arguments: AnyKind };
type Literal = { kind: "literal" };
type Tuple = { kind: "tuple", types: AnyKind };
type Import = {
  kind: "import",
  importKind: "value" | "type",
  name: string,
  moduleSpecifier: string
};

/* ? */ type Program = { kind: "program", classes: Array<Property> };

type AnyTypeKind =
  | String
  | Id
  | AssignmentPattern
  | ObjectPattern
  | Obj
  | ClassKind
  | Unary
  | Property
  | Exists
  | Null
  | TypeParam
  | Number
  | Boolean
  | Func
  | Union
  | Generic
  | Void
  | Intersection
  | Mixed
  | Any
  | Nullable
  | Literal
  | Spread
  | Tuple;
type AnyValueKind =
  | String
  | Spread
  | Param
  | Id
  | TemplateLiteral
  | ArrayExpression
  | Variable
  | JSXMemberExpression
  | TemplateExpression
  | AssignmentPattern
  | ObjectPattern
  | JSXAttribute
  | JSXExpressionContainer
  | JSXElement
  | JSXIdentifier
  | JSXOpeningElement
  | Property
  | Call
  | New
  | Typeof
  | Number
  | Null
  | Boolean
  | BinaryExpression
  | MemberExpression
  | Func
  | Import;
type AnyKind = AnyTypeKind | AnyValueKind | Program;

// TODO: Add TemplateElement converter

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

const getPropFromObject = (props, property) => {
  let prop;

  props.members.forEach(p => {
    if (p.kind === "spread") {
      let p2 = getPropFromObject(p.value.value, property);
      if (p2) prop = p2;
      // The kind of the object member must be the same as the kind of the property
    } else if (property.key.kind === "id" && p.key.name === property.key.name) {
      prop = p;
    } else if (
      property.key.kind === "string" &&
      p.key.value === property.key.value
    ) {
      prop = p;
    }
  });

  return prop;
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

converters.Program = (path, context): Program => {
  let result = {};
  result.kind = "program";
  result.classes = [];

  path.traverse({
    ClassDeclaration(path) {
      if (!isReactComponentClass(path)) return;
      let classProperties = convertReactComponentClass(path, context);

      result.classes.push(classProperties);
    }
  });

  return result;
};

function convertReactComponentClass(path, context) {
  let params = path.get("superTypeParameters").get("params");
  let props = params[0];
  let defaultProps = getDefaultProps(path);

  let classProperties = convert(props, { ...context, mode: "type" });
  classProperties.name = convert(path.get("id"), {
    ...context,
    mode: "value"
  });
  if (defaultProps && defaultProps.value && defaultProps.value.members) {
    defaultProps.value.members.forEach(property => {
      let ungeneric = resolveFromGeneric(classProperties);
      const prop = getProp(ungeneric, property);
      if (!prop) {
        throw new Error(
          JSON.stringify(
            `could not find property to go with default of ${
              property.key.value ? property.key.value : property.key.name
            } in ${classProperties.name}`
          )
        );
      }
      prop.default = property.value;
    });
  }

  return classProperties;
}

converters.TaggedTemplateExpression = (path, context): TemplateExpression => {
  return {
    kind: "templateExpression",
    tag: convert(path.get("tag"), context)
  };
};
converters.TemplateLiteral = (path, context): TemplateLiteral => {
  return {
    kind: "templateLiteral",
    expressions: convert(path.get("expressions"), context),
    quasis: convert(path.get("quasis"), context)
  };
};

converters.AssignmentPattern = (path, context): AssignmentPattern => {
  return {
    kind: "AssignmentPattern",
    left: convert(path.get("left"), context),
    right: convert(path.get("right"), context)
  };
};

/* this seems broken ? */
converters.ObjectPattern = (path, context): ObjectPattern => {
  let members = [];

  for (const property of path.get("properties")) {
    members.push(convert(property, context));
  }

  return {
    kind: "ObjectPattern",
    members
  };
};

converters.ClassDeclaration = (path, context): ClassKind => {
  if (!isReactComponentClass(path)) {
    return {
      kind: "class",
      name: convert(path.get("id"), context)
    };
  } else {
    return convertReactComponentClass(path, context);
  }
};

converters.SpreadElement = (path, context): Spread => {
  return {
    kind: "spread",
    value: convert(path.get("argument"), context)
  };
};

converters.UnaryExpression = (path, context): Unary => {
  return {
    kind: "unary",
    operator: path.node.operator,
    argument: convert(path.get("argument"), context)
  };
};

converters.JSXAttribute = (path, context): JSXAttribute => {
  return {
    kind: "JSXAttribute",
    name: convert(path.get("name"), context),
    value: convert(path.get("value"), context)
  };
};

converters.JSXExpressionContainer = (path, context): JSXExpressionContainer => {
  return {
    kind: "JSXExpressionContainer",
    value: convert(path.get("expression"), context)
  };
};

converters.JSXElement = (path, context): JSXElement => {
  return {
    kind: "JSXElement",
    value: convert(path.get("openingElement"), context)
  };
};

converters.JSXIdentifier = (path, context): JSXIdentifier => {
  return {
    kind: "JSXIdentifier",
    value: path.node.name
  };
};

converters.JSXMemberExpression = (path, context): JSXMemberExpression => {
  return {
    kind: "JSXMemberExpression",
    object: convert(path.get("object"), context),
    property: convert(path.get("property"), context)
  };
};

converters.JSXOpeningElement = (path, context): JSXOpeningElement => {
  return {
    kind: "JSXOpeningElement",
    name: convert(path.get("name"), context),
    attributes: path.get("attributes").map(item => convert(item, context))
  };
};

converters.ClassProperty = (path, context): Property => {
  return {
    kind: "property",
    key: convert(path.get("key"), context),
    value: convert(path.get("value"), context)
  };
};

function convertCall(path, context) {
  const callee = convert(path.get("callee"), context);
  const args = path.get("arguments").map(a => convert(a, context));
  return { callee, args };
}

converters.CallExpression = (path, context): Call => {
  const { callee, args } = convertCall(path, context);
  return {
    kind: "call",
    callee,
    args
  };
};

converters.NewExpression = (path, context): New => {
  const { callee, args } = convertCall(path, context);
  return {
    kind: "new",
    callee,
    args
  };
};

converters.TypeofTypeAnnotation = (path, context): Typeof => {
  let type = convert(path.get("argument"), context);
  return {
    kind: "typeof",
    type,
    name: type.value.name
  };
};

converters.ObjectProperty = (path, context): Property => {
  return {
    kind: "property",
    key: convert(path.get("key"), context),
    value: convert(path.get("value"), context)
  };
};

converters.ExistentialTypeParam = (path, context): Exists => {
  return { kind: "exists" };
};

converters.StringLiteral = (path, context): String => {
  return { kind: "string", value: path.node.value };
};

converters.NumericLiteral = (path, context): Number => {
  return { kind: "number", value: path.node.value };
};

converters.NullLiteral = (path, context): Null => {
  return { kind: "null" };
};

converters.BooleanLiteral = (path, context): Boolean => {
  return { kind: "boolean", value: path.node.value };
};

converters.ArrayExpression = (path, context): ArrayExpression => {
  return {
    kind: "array",
    elements: path.get("elements").map(e => convert(e, context))
  };
};

converters.BinaryExpression = (path, context): BinaryExpression => {
  return {
    kind: "binary",
    operator: path.node.operator,
    left: convert(path.get("left"), context),
    right: convert(path.get("right"), context)
  };
};

converters.MemberExpression = (path, context): MemberExpression => {
  return {
    kind: "memberExpression",
    object: convert(path.get("object"), context),
    property: convert(path.get("property"), context)
  };
};

function convertParameter(param, context): Param {
  let { type, ...rest } = convert(param, context);
  return {
    kind: "param",
    value: rest,
    type: type || null
  };
}

function convertFunction(path, context): Func {
  const parameters = path.get("params").map(p => convertParameter(p, context));
  let returnType = null;
  let id = null;

  if (path.node.returnType) {
    returnType = convert(path.get("returnType"), context);
  }

  if (path.node.id) {
    id = convert(path.get("id"), context);
  }

  return {
    kind: "function",
    id: id,
    async: path.node.async,
    generator: path.node.generator,
    parameters,
    returnType
  };
}

converters.FunctionDeclaration = (path, context) => {
  return convertFunction(path, context);
};

converters.ArrowFunctionExpression = (path, context) => {
  return convertFunction(path, context);
};

converters.FunctionExpression = (path, context) => {
  return convertFunction(path, context);
};

converters.TypeAnnotation = (path, context) => {
  return convert(path.get("typeAnnotation"), context);
};

converters.ExistsTypeAnnotation = (path, context): Exists => {
  return { kind: "exists" };
};

converters.ObjectTypeAnnotation = (path, context): Object => {
  let result = {};

  result.kind = "object";
  result.members = [];

  let properties = path.get("properties");

  for (let property of properties) {
    result.members.push(convert(property, context));
  }

  return result;
};

converters.ObjectTypeProperty = (path, context): Property => {
  let result = {};
  result.kind = "property";
  result.key = convert(path.get("key"), context);
  result.value = convert(path.get("value"), context);
  result.optional = path.node.optional;
  return result;
};

converters.UnionTypeAnnotation = (path, context): Union => {
  const types = path.get("types").map(p => convert(p, context));
  return { kind: "union", types };
};

converters.TypeParameterInstantiation = (path, context): TypeParam => {
  return path.get("params").map(p => ({
    kind: "typeParam",
    type: convert(p, context)
  }));
};

converters.GenericTypeAnnotation = (path, context): Generic => {
  let result = {};

  result.kind = "generic";
  result.value = convert(path.get("id"), context);
  if (path.node.typeParameters) {
    result.typeParams = convert(path.get("typeParameters"), context);
  }
  return result;
};

converters.ObjectMethod = (path, context): Func => {
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

converters.ObjectExpression = (path, context): Object => {
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

converters.VariableDeclaration = (path, context): Variable => {
  let res = {};
  res.kind = "variable";
  res.declarations = path.get("declarations").map(p => convert(p, context));
  return res;
};

converters.VariableDeclarator = (path, context): Initial => {
  return {
    kind: "initial",
    id: convert(path.get("id"), context),
    value: convert(path.get("init"), context)
  };
};

converters.Identifier = (path, context): Id => {
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
        const convertedValue = convert(foundPath, context);
        return {
          ...convertedValue,
          referenceIdName: path.node.name
        };
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
        let flowBinding = findFlowBinding(path, name);
        if (!flowBinding) throw new Error();
        bindingPath = flowBinding.path.parentPath;
      } else {
        bindingPath = path.scope.getBinding(name);
      }

      if (bindingPath) {
        if (bindingPath.kind === "module") {
          bindingPath = bindingPath.path;
        }
        if (bindingPath.kind !== "module") return convert(bindingPath, context);
      } else {
        return { kind: "id", name: name };
      }
    } else if (kind === "static" || kind === "binding") {
      return { kind: "id", name };
    }
  }
  throw new Error(`Could not parse Identifier ${name} in mode ${context.mode}`);
};

converters.TypeAlias = (path, context) => {
  return convert(path.get("right"), context);
};

converters.IntersectionTypeAnnotation = (path, context): Intersection => {
  const types = path.get("types").map(p => convert(p, context));
  return { kind: "intersection", types };
};

converters.QualifiedTypeIdentifier = (path, context) => {
  return convert(path.get("id"), context);
};

converters.VoidTypeAnnotation = (path): Void => {
  return { kind: "void" };
};

converters.BooleanTypeAnnotation = (path): Boolean => {
  return { kind: "boolean" };
};

converters.BooleanLiteralTypeAnnotation = (path): Boolean => {
  return { kind: "boolean", value: path.node.value };
};

converters.NullLiteralTypeAnnotation = (path): Null => {
  return { kind: "null" };
};

converters.StringLiteralTypeAnnotation = (path): String => {
  return { kind: "string", value: path.node.value };
};

// This should absolutely return a value
converters.NumberLiteralTypeAnnotation = (path): Number => {
  return { kind: "number", value: path.node.value };
};

converters.MixedTypeAnnotation = (path): Mixed => {
  return { kind: "mixed" };
};

converters.AnyTypeAnnotation = (path): Any => {
  return { kind: "any" };
};

converters.NumberTypeAnnotation = (path): Number => {
  return { kind: "number" };
};

converters.FunctionTypeParam = (path, context) => {
  return convert(path.get("typeAnnotation"), context);
};

converters.FunctionTypeAnnotation = (path, context): Func => {
  const parameters = path.get("params").map(p => convert(p, context));
  const returnType = convert(path.get("returnType"), context);

  return {
    parameters,
    returnType,
    kind: "function"
  };
};

converters.StringTypeAnnotation = (path): String => {
  return { kind: "string" };
};

converters.NullableTypeAnnotation = (path, context): Nullable => {
  return {
    kind: "nullable",
    arguments: convert(path.get("typeAnnotation"), context)
  };
};

converters.TSStringKeyword = (path): String => {
  return { kind: "string" };
};

converters.TSNumberKeyword = (path): Number => {
  return { kind: "number" };
};

converters.TSBooleanKeyword = (path): Boolean => {
  return { kind: "boolean" };
};

converters.TSVoidKeyword = (path): Void => {
  return { kind: "void" };
};

// converters.TSPropertySignature = path => {
// };

converters.TSTypeLiteral = (path, context): Obj => {
  let result = {};

  result.kind = "object";
  // TODO: find object key
  // result.key = '';
  result.members = [];

  let members = path.get("members");

  members.forEach(memberPath => {
    result.members.push(
      convert(memberPath.get("typeAnnotation").get("typeAnnotation"), context)
    );
  });

  return result;
};

converters.TSLiteralType = (path): Literal => {
  return {
    kind: "literal",
    value: path.node.literal.value
  };
};

converters.TSTypeReference = (path, context) => {
  return convert(path.get("typeName"), context);
};

converters.TSUnionType = (path, context): Union => {
  const types = path.get("types").map(p => convert(p, context));
  return { kind: "union", types };
};

converters.TSAnyKeyword = (path): Any => {
  return { kind: "any" };
};

converters.TSTupleType = (path, context): Tuple => {
  const types = path.get("elementTypes").map(p => convert(p, context));
  return { kind: "tuple", types };
};

converters.TSFunctionType = (path, context): Func => {
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

converters.ObjectTypeSpreadProperty = (path, context): Spread => {
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
    let name;
    let kind = path.parent.importKind;
    if (kind === "typeof") {
      throw new Error({ path, error: "import typeof is unsupported" });
    }

    if (path.type === "ImportDefaultSpecifier" && kind === "value") {
      name = "default";
    } else if (path.node.imported) {
      name = path.node.imported.name;
    } else {
      name = path.node.local.name;
    }

    if (!/^\./.test(path.parent.source.value)) {
      return {
        kind: "external",
        importKind,
        name,
        moduleSpecifier
      };
    }

    let file = loadImportSync(path.parentPath, context.resolveOptions);

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
