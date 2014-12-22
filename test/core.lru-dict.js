/*eslint max-nested-callbacks: 0*/
/*global describe, it*/
'use strict';

var assert = require('assert');

describe('core/lru-dict', function () {
    var StdLRUDict = require('../core/lru-dict');

    function LRUDict() {
        StdLRUDict.apply(this, arguments);

        Object.defineProperty(this, 'links', {
            get: function () {
                return this._vals;
            }
        });
    }

    LRUDict.prototype = Object.create(StdLRUDict.prototype);
    LRUDict.prototype.constructor = LRUDict;

    describe('new LRUDict()', function () {

        it('Should be an instance of LRUDict', function () {
            assert.ok(new LRUDict() instanceof LRUDict);
        });

        it('Should take size', function () {
            var dict = new LRUDict(42);
            assert.ok(dict.size);
            assert.strictEqual(dict.size, 42);
        });

        it('Should have length', function () {
            var dict = new LRUDict(3);
            assert.strictEqual(dict.length, 0);
        });
    });

    describe('ld.set()', function () {
        it('Should set entry', function () {
            var dict = new LRUDict();
            dict.set('foo', 42);
            assert.strictEqual(dict.links.foo.data, 42);
            assert.strictEqual(dict.length, 1);
        });

        it('Should not exceed size', function () {
            var dict = new LRUDict(3);

            dict.set('foo', 42);
            assert.strictEqual(dict.links.foo.data, 42);
            assert.strictEqual(dict.length, 1);

            dict.set('foo', 43);
            assert.strictEqual(dict.links.foo.data, 43);
            assert.strictEqual(dict.length, 1);

            dict.set('bar', 44);
            assert.strictEqual(dict.links.foo.data, 43);
            assert.strictEqual(dict.links.bar.data, 44);
            assert.strictEqual(dict.length, 2);

            dict.set('zot', 45);
            assert.strictEqual(dict.links.foo.data, 43);
            assert.strictEqual(dict.links.bar.data, 44);
            assert.strictEqual(dict.links.zot.data, 45);
            assert.strictEqual(dict.length, 3);

            dict.set('foo', 46);
            assert.strictEqual(dict.links.foo.data, 46);
            assert.strictEqual(dict.links.bar.data, 44);
            assert.strictEqual(dict.links.zot.data, 45);
            assert.strictEqual(dict.length, 3);

            dict.set('moo', 47);
            assert.strictEqual(dict.links.bar, void 0);
            assert.strictEqual(dict.links.foo.data, 46);
            assert.strictEqual(dict.links.zot.data, 45);
            assert.strictEqual(dict.links.moo.data, 47);
            assert.strictEqual(dict.length, 3);
        });

        it('Should not set anything if size is not normal', function () {
            var dict = new LRUDict(0);

            dict.set('foo', 42);
            assert.strictEqual(dict.links.foo, void 0);
            assert.strictEqual(dict.length, 0);

            dict.size = -1;

            dict.set('foo', 42);
            assert.strictEqual(dict.links.foo, void 0);
            assert.strictEqual(dict.length, 0);
        });
    });

    describe('ld.get()', function () {
        it('Should get link value', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            assert.strictEqual(dict.get('foo'), 42);
            assert.strictEqual(dict.get('bar'), void 0);
        });
    });

    describe('ld.keys()', function () {
        it('Should return dict keys', function () {
            var dict = new LRUDict();
            dict.set('foo', 42);
            dict.set('bar', 42);
            assert.deepEqual(dict.keys(), ['foo', 'bar']);
        });

        it('Should have priority order', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            assert.deepEqual(dict.keys(), ['foo', 'bar']);
            dict.get('foo');
            assert.deepEqual(dict.keys(), ['bar', 'foo']);
            dict.set('zot', 44);
            assert.deepEqual(dict.keys(), ['bar', 'foo', 'zot']);
            dict.get('bar');
            dict.get('zot');
            assert.deepEqual(dict.keys(), ['foo', 'bar', 'zot']);
        });
    });

    describe('ld.peek()', function () {
        it('Should return value but should not touch priority', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 1);
            dict.set('bar', 2);
            dict.set('zot', 3);
            assert.strictEqual(dict.peek('bar'), 2);
            assert.strictEqual(dict.peek('omg'), void 0);
            assert.deepEqual(dict.keys(), ['foo', 'bar', 'zot']);
        });
    });

    describe('ld.vals()', function () {
        it('Should return array of dict values', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 1);
            dict.set('bar', 2);
            dict.set('zot', 3);
            assert.deepEqual(dict.vals(), [1, 2, 3]);
        });
    });

    describe('ld.del()', function () {
        it('Should delete link', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 1);
            dict.set('bar', 2);
            dict.set('zot', 3);
            assert.strictEqual(dict.length, 3);

            assert.ok(dict.del('bar'));
            assert.strictEqual(dict.peek('bar'), void 0);
            assert.strictEqual(dict.length, 2);
            assert.ok(!dict.del('bar'));

            assert.ok(dict.del('foo'));
            assert.strictEqual(dict.peek('foo'), void 0);
            assert.strictEqual(dict.length, 1);
            assert.ok(!dict.del('foo'));

            assert.ok(dict.del('zot'));
            assert.strictEqual(dict.peek('zot'), void 0);
            assert.strictEqual(dict.length, 0);
            assert.ok(!dict.del('zot'));
        });
    });

    describe('link.index()', function () {
        it('Should return link index', function () {
            var dict = new LRUDict();
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);

            assert.strictEqual(dict.links.foo.index(), 0);
            assert.strictEqual(dict.links.bar.index(), 1);
            assert.strictEqual(dict.links.zot.index(), 2);

            dict.get('bar');

            assert.strictEqual(dict.links.foo.index(), 0);
            assert.strictEqual(dict.links.bar.index(), 2);
            assert.strictEqual(dict.links.zot.index(), 1);
        });
    });

    describe('resizing .length', function () {
        it('Should remove less used values', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            dict.get('foo');
            assert.strictEqual(dict.length, 3);
            dict.length = 2;
            assert.strictEqual(dict.length, 2);

            assert.strictEqual(dict.get('bar'), void 0);
            assert.strictEqual(dict.get('foo'), 42);
            assert.strictEqual(dict.get('zot'), 44);
        });

        it('Should remove all values', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            dict.get('foo');
            assert.strictEqual(dict.length, 3);
            dict.length = 0;
            assert.strictEqual(dict.length, 0);

            assert.strictEqual(dict.get('bar'), void 0);
            assert.strictEqual(dict.get('foo'), void 0);
            assert.strictEqual(dict.get('zot'), void 0);
        });

        it('Should remove all values if length is less than 0', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            dict.get('foo');
            assert.strictEqual(dict.length, 3);
            dict.length = -100;
            assert.strictEqual(dict.length, 0);

            assert.strictEqual(dict.get('bar'), void 0);
            assert.strictEqual(dict.get('foo'), void 0);
            assert.strictEqual(dict.get('zot'), void 0);
        });

        it('Should remove all values if length is NaN', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            dict.get('foo');
            assert.strictEqual(dict.length, 3);
            dict.length = NaN;
            assert.strictEqual(dict.length, 0);

            assert.strictEqual(dict.get('bar'), void 0);
            assert.strictEqual(dict.get('foo'), void 0);
            assert.strictEqual(dict.get('zot'), void 0);
        });
    });

    describe('resizing .size', function () {
        it('Should remove less used values', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            dict.get('foo');
            assert.strictEqual(dict.size, 3);
            assert.strictEqual(dict.length, 3);
            dict.size = 2;
            assert.strictEqual(dict.size, 2);
            assert.strictEqual(dict.length, 2);

            assert.strictEqual(dict.get('bar'), void 0);
            assert.strictEqual(dict.get('foo'), 42);
            assert.strictEqual(dict.get('zot'), 44);
        });

        it('Should remove all values if size is 0', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            dict.get('foo');
            assert.strictEqual(dict.size, 3);
            dict.size = 0;
            assert.strictEqual(dict.size, 0);
            assert.strictEqual(dict.length, 0);

            assert.strictEqual(dict.get('bar'), void 0);
            assert.strictEqual(dict.get('foo'), void 0);
            assert.strictEqual(dict.get('zot'), void 0);
        });

        it('Should remove all values if size is less than 0', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            dict.get('foo');
            assert.strictEqual(dict.length, 3);
            assert.strictEqual(dict.size, 3);
            dict.size = -100;
            assert.strictEqual(dict.size, 0);
            assert.strictEqual(dict.length, 0);

            assert.strictEqual(dict.get('bar'), void 0);
            assert.strictEqual(dict.get('foo'), void 0);
            assert.strictEqual(dict.get('zot'), void 0);
        });

        it('Should be unbounded if size is NaN', function () {
            var dict = new LRUDict(3);
            dict.set('foo', 42);
            dict.set('bar', 43);
            dict.set('zot', 44);
            assert.strictEqual(dict.length, 3);
            assert.strictEqual(dict.size, 3);
            dict.set('moo', 45);
            assert.strictEqual(dict.length, 3);
            assert.strictEqual(dict.size, 3);
            assert.strictEqual(dict.get('moo'), 45);
            assert.strictEqual(dict.get('foo'), void 0);
            dict.size = NaN;

            dict.set('foo', 42);
            assert.strictEqual(dict.get('foo'), 42);
            assert.strictEqual(dict.get('bar'), 43);
            assert.strictEqual(dict.get('zot'), 44);
            assert.strictEqual(dict.get('moo'), 45);
        });
    });
});
