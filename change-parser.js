const recast = require("recast");
const util = require("util");

const code = `
  function add(a, b) {
    return a * b;
  }
`
;

console.log(`input code:\n${code}`);
// Let us transform the order of the parameters and convert it in a functionExpression

// Parse the code using an interface similar to require("acorn").parse.
/*
const ast = recast.parse(code, {
  parser: require("acorn")
});
*/
const ast = recast.parse(code, {
  parser: require("recast/parsers/flow")
});

const add = ast.program.body[0];

debugger;

const n = recast.types.namedTypes;
n.FunctionDeclaration.assert(add);

// If you choose to use recast.builders to construct new AST nodes, all builder
// arguments will be dynamically type-checked against the Mozilla Parser API.
const B = recast.types.builders;

// This kind of manipulation should seem familiar if you've used Esprima or the
// Mozilla Parser API before.
ast.program.body[0] = B.variableDeclaration("const", [
  B.variableDeclarator(add.id, B.functionExpression(
    null, // Anonymize the function expression.
    add.params,
    add.body
  ))
]);

// Switch the parameters order:
add.params.push(add.params.shift());

const result = recast.print(ast, {sourceMapName: "map.json"});
output = result.code;
//const output = recast.prettyPrint(ast, { tabWidth: 2 }).code

console.log(`output code:\n${output}`);
console.log(`map: ${util.inspect(result.map)}`);