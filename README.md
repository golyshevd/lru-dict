lru-dict [![Build Status](https://travis-ci.org/golyshevd/lru-dict.svg)](https://travis-ci.org/golyshevd/lru-dict)
=========

```lru-dict``` is fast lru cache implemented in 3 interfaces

#LRUDict

Classic lru cache

##```LRUDict new LRUDict([Number size])```
Creates new lru-cache instance

```js
var LRUDict = require('lru-dict');
var cache = new LRUDict(7000);
```

The only constructor's arguments is size. Size is optional. The cache is unbounded if size omitted.

##```LRUDict cache.set(String key, * value)```
Adds new entry to cache

```js
cache.set('foo', 42);
```

##```* cache.get(String key)```
Retrieves a value from cache by key

```js
var value = cache.get('foo');
```

##```Boolean cache.del(String key)```
Deletes value from cache by key

```js
cache.set('foo', 42);
cache.get('foo'); // 42
cache.del('foo'); // true
cache.get('foo'); // undefined
```

##```Array<String> cache.keys()```
Retrieves all the keys of cache in most used order

```js
cache.set('foo', 42);
cache.keys(); // ['foo']
```

##```* cache.peek(String key)```
Retrieves value from cache by key, but no change most used order

```js
var cache = new LRUDict(2);
cache.set('foo', 42);
cache.set('bar', 43);
cache.get('foo');
cache.set('zot', 44);
cache.keys(); // ['foo', 'zot']
//  but
var cache = new LRUDict(2);
cache.set('foo', 42);
cache.set('bar', 43);
cache.peek('foo');
cache.set('zot', 44);
cache.keys(); // ['bar', 'zot']
```

##```Array<*> cache.vals()```
Retrieves all the values of cache in most used order

```js
cache.set('foo', 42);
cache.vals(); // [42]
```

##```Number cache.size```
Set or get cache maximum length

```js
var cache = new LRUDict(3);
cache.size; // 3
cache.size = 1;
cache.size; // 1
```

Crops less used entries if new size less than current

##```Number cache.length```
Set or get cache maximum length

```js
var cache = new LRUDict(3);
cache.size; // 3
cache.length; // 0
cache.set('foo', 42);
cache.length; // 1
```

Crops less used entries if new length less than current

#LRUDictTtl
Same as LRUDict but the entries have own expiration attribute in seconds.

```js
var LRUDictTtl = require('lru-cache/core/lru-dict-ttl');
var cache = new LRUDictTtl(7000);
```

##```cache.set(String key, * value[, Number ttl])```

```js
cache.set('foo', 'bar', 0.01); // time to life in SECONDS
cache.get('foo'); // "bar"
setTimeout(function () {
    cache.get('foo'); // undefined
}, 20);
```

if the third argument was omitted then value will be never expired

#LRUDictTtlAsync
Same as LRUDictTtl but with async interface of all methods. Last argument is callback function.

```js
var LRUDictTtlAsync = require('lru-dict/core/lru-dict-ttl-async');
var cache = new LRUDictTtlAsync(7000);
cache.set('foo', 'bar', 1, function (err, res) {
    // do stuff
});
```

---------
LICENSE [MIT](LICENSE)
