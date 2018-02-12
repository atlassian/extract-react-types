# Extract React Types Types

A collection of flow types for the return values of Extract-React-Types' converter,
to allow parsers of this data structure to be built with type-safety.

## High level kinds

- `Program` - The kind returned from `extract-react-types`;
- `AnyTypeKind` - any kind that is used within the types system
- `AnyValueKind` - any kind that is used as a javascript value (generally in default props)
- `AnyKind` - A union of `AnyTypeKind` and `AnyValueKind`

## Converter kinds

- String
- Param
- TemplateElement
- TypeParam
- Id
- TemplateLiteral
- TemplateExpression
- AssignmentPattern
- ObjectPattern
- Obj
- ClassKind
- Spread
- Unary
- JSXAttribute
- JSXExpressionContainer
- JSXElement
- JSXIdentifier
- JSXMemberExpression
- JSXOpeningElement
- Property
- Call
- New
- Typeof
- Exists
- Number
- Null
- Boolean
- ArrayExpression
- BinaryExpression
- MemberExpression
- Func
- Union
- Generic
- Initial
- Variable
- Intersection
- Void
- Mixed
- Any
- Nullable
- Literal
- Tuple
- Import
