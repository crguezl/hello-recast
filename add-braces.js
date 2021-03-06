#!/usr/bin/env node

var recast = require("recast");
var types = recast.types;
var n = types.namedTypes;
var b = types.builders;

require("recast").run(function(ast, callback) {
    recast.visit(ast, {
        visitIfStatement: function(path) {
            var stmt = path.node;
            stmt.consequent = fix(stmt.consequent);

            var alt = stmt.alternate;
            if (!n.IfStatement.check(alt)) {
                stmt.alternate = fix(alt);
            }

            this.traverse(path);
        },

        visitWhileStatement: visitLoop,
        visitForStatement: visitLoop,
        visitForInStatement: visitLoop
    });

    callback(ast);
});

function visitLoop(path) {
    var loop = path.node;
    loop.body = fix(loop.body);
    this.traverse(path);
}

function fix(clause) {
    if (clause) {
        if (!n.BlockStatement.check(clause)) {
            clause = b.blockStatement([clause]);
        }
    }

    return clause;
}