#!/usr/bin/env node

// This script converts for and do-while loops into equivalent while loops.
// Note that for-in statements are left unmodified, as they do not have a
// simple analogy to while loops. Also note that labeled continue statements
// are not correctly handled at this point, and will trigger an assertion
// failure if encountered.

var assert = require("assert");
var recast = require("recast");
var types = recast.types;
var n = types.namedTypes;
var b = types.builders;

recast.run(function(ast, callback) {
    recast.visit(ast, {
        visitForStatement: function(path) {
            var fst = path.node;

            path.replace(
                fst.init,
                b.whileStatement(
                    fst.test,
                    insertBeforeLoopback(fst, fst.update)
                )
            );

            this.traverse(path);
        },

        visitDoWhileStatement: function(path) {
            var dwst = path.node;
            return b.whileStatement(
                b.literal(true),
                insertBeforeLoopback(
                    dwst,
                    b.ifStatement(
                        dwst.test,
                        b.breakStatement()
                    )
                )
            );
        }
    });

    callback(ast);
});

function insertBeforeLoopback(loop, toInsert) {
    var body = loop.body;

    if (!n.Statement.check(toInsert)) {
        toInsert = b.expressionStatement(toInsert);
    }

    if (n.BlockStatement.check(body)) {
        body.body.push(toInsert);
    } else {
        body = b.blockStatement([body, toInsert]);
        loop.body = body;
    }

    recast.visit(body, {
        visitContinueStatement: function(path) {
            var cst = path.node;

            assert.equal(
                cst.label, null,
                "Labeled continue statements are not yet supported."
            );

            path.replace(toInsert, path.node);
            return false;
        },

        // Do not descend into nested loops.
        visitWhileStatement: function() {},
        visitForStatement: function() {},
        visitForInStatement: function() {},
        visitDoWhileStatement: function() {}
    });

    return body;
}