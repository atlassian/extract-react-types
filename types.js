'use strict';

export interface Location {
  line: number,
  column: number,
}

export interface SourceLocation {
  start: Location,
  end: Location,
}

export type Comment =
  | CommentBlock
  | CommentLine;

export interface BaseComment {
  +kind: string,
  value: string,
  start: number,
  end: number,
  loc: SourceLocation,
}

export interface CommentBlock extends BaseComment {
  kind: 'CommentBlock',
}

export interface CommentLine extends BaseComment {
  kind: 'CommentLine',
}

export interface BaseNode {
  +kind: string,
  start: number,
  end: number,
  loc: SourceLocation,
  leadingComments?: Array<Comment>,
  innerComments?: Array<Comment>,
  trailingComments?: Array<Comment>,
}

export interface BaseTypeNode extends BaseNode {}

export type Node =
  | ProgramNode
  | ReactComponentNode
  | ObjectTypeNode
  | ObjectTypePropertyNode
  | ObjectTypeMethodNode
  | UnionTypeNode
  | IntersectionTypeNode;

export type TypeNode =
  | ObjectType
  | UnionTypeNode
  | IntersectionTypeNode
  | AnyTypeNode
  | MixedTypeNode
  | VoidTypeNode
  | NullTypeNode
  | BooleanTypeNode
  | StringTypeNode
  | NumberTypeNode
  | BooleanLiteralTypeNode
  | StringLiteralTypeNode
  | NumberLiteralTypeNode
  | ThisTypeNode
  | FunctionTypeNode;

export type TypeExpressionNode =
  | TypeNode
  | ReferenceIdentifierNode;

export type ObjectMemberNode =
  | ObjectTypePropertyNode
  | ObjectTypeMethodNode
  | ObjectTypeIndexerNode;

export type Variance =
  | 'covariant'
  | 'contravariant';

export interface ProgramNode extends BaseNode {
  kind: 'Program',
  components: Array<ReactComponent>,
}

export interface BaseIdentifierNode extends BaseNode {
  name: string,
}

export interface BindingIdentifierNode extends BaseIdentifierNode {}

export interface ReferenceIdentifierNode extends BaseIdentifierNode {
  // TODO: metadata pointing to source?
}

export interface ReactComponentNode extends BaseNode {
  kind: 'ReactComponent',
  name: BindingIdentifierNode,
  props: TypeExpressionNode,
  state: TypeExpressionNode,
}

export interface ObjectTypeNode extends BaseTypeNode {
  kind: 'ObjectType',
  members: Array<ObjectMemberNode>,
}

export interface ObjectTypePropertyNode extends BaseNode {
  kind: 'ObjectTypeProperty',
  key: string,
  value: Type,
  optional: boolean,
  readonly: boolean | null, // Flow: null, TypeScript: boolean
  writeonly: boolean | null, // Flow: null, TypeScript: boolean
}

export interface ObjectTypeMethodNode extends BaseNode {
  kind: 'ObjectTypeMethod',
  name: string,
  // TODO
}

export interface ObjectTypeIndexerNode extends BaseNode {
  kind: 'ObjectTypeIndexer',
  name: string,
  key: TypeExpressionNode,
  value: TypeExpressionNode,
}

export interface UnionTypeNode extends BaseTypeNode {
  kind: 'UnionType',
  types: Array<TypeExpressionNode>,
}

export interface IntersectionTypeNode extends BaseTypeNode {
  kind: 'IntersectionType',
  types: Array<TypeExpressionNode>,
}

export interface TupleTypeNode extends BaseTypeNode {
  kind: 'TupleType',
  types: Array<TypeExpressionNode>,
}

export interface AnyTypeNode extends BaseTypeNode {
  kind: 'AnyType',
}

export interface MixedTypeNode extends BaseTypeNode {
  kind: 'MixedType',
}

export interface VoidTypeNode extends BaseTypeNode {
  kind: 'VoidType',
}

export interface NullTypeNode extends BaseTypeNode {
  kind: 'NullType',
}

export interface BooleanTypeNode extends BaseTypeNode {
  kind: 'BooleanType',
}

export interface StringTypeNode extends BaseTypeNode {
  kind: 'StringType',
}

export interface NumberTypeNode extends BaseTypeNode {
  kind: 'NumberType',
}

export interface BooleanLiteralTypeNode extends BaseTypeNode {
  kind: 'BooleanLiteralType',
  value: boolean,
}

export interface StringLiteralTypeNode extends BaseTypeNode {
  kind: 'StringLiteralTypeNode',
  value: string,
  extra: {
    rawValue: string,
    value: string,
  },
}

export interface NumberLiteralTypeNode extends BaseTypeNode {
  kind: 'NumberLiteralType',
  value: number,
}

export interface ThisTypeNode extends BaseTypeNode {
  kind: 'ThisType',
}

export interface FunctionTypeNode extends BaseTypeNode {
  kind: 'FunctionType',
  typeParameters: TypeParametersNode,
  params: ParametersNode,
  returns: TypeExpressionNode,
}

export interface TypeParametersNode extends BaseNode {
  kind: 'TypeParameters',
  items: Array<TypeParameterNode>,
}

export interface TypeParameterNode extends BaseNode {
  kind: 'TypeParameter',
  name: BindingIdentifier,
  variance: Variance | null, // Flow: Variance, TypeScript: null
}

export interface ParametersNode extends BaseNode {
  kind: 'Parameters',
  items: Array<ParameterNode>,
  rest: ParameterNode | null,
}

export interface ParameterNode extends BaseNode {
  kind: 'Parameter',
  id: BindingIdentifier,
  type: TypeExpressionNode | null,
}
