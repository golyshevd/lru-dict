'use strict';

/**
 * @class LRUDict
 * @param {Number} [size]
 * */
function LRUDict(size) {
    var self = this;

    /**
     * @public
     * @memberOf {LRUDict}
     * @property
     * @type {Number}
     * */
    Object.defineProperty(this, 'size', {
        get: function () {
            return self._size;
        },
        set: function (size) {
            size = Math.max(size, 0);
            crop(self, size);
            self._size = size;
        }
    });

    /**
     * @public
     * @memberOf {LRUDict}
     * @property
     * @type {Number}
     * */
    Object.defineProperty(this, 'length', {
        get: function () {
            return self._leng;
        },
        set: function (leng) {
            leng = Math.max(leng, 0) | 0;
            crop(self, leng);
            self._leng = leng;
        }
    });

    /**
     * @protected
     * @memberOf {LRUDict}
     * @property
     * @type {Link}
     * */
    this._head = null;

    /**
     * @protected
     * @memberOf {LRUDict}
     * @property
     * @type {Number}
     * */
    this._leng = 0;

    /**
     * @protected
     * @memberOf {LRUDict}
     * @property
     * @type {Number}
     * */
    this._size = NaN;

    /**
     * @protected
     * @memberOf {LRUDict}
     * @property
     * @type {Link}
     * */
    this._tail = null;

    /**
     * @protected
     * @memberOf {LRUDict}
     * @property
     * @type {Object}
     * */
    this._vals = Object.create(null);

    this.size = size;
}

/**
 * @public
 * @memberOf {LRUDict}
 * @method
 *
 * @constructs
 * */
LRUDict.prototype.constructor = LRUDict;

/**
 * @public
 * @memberOf {LRUDict}
 * @method
 *
 * @param {String} key
 * @param {*} val
 *
 * @returns {LRUDict}
 * */
LRUDict.prototype.set = function (key, val) {
    var link;

    unlink(this, this._vals[key]);

    if (crop(this, this.size - 1)) {
        link = new Link(key, val, null, null);
        push(this, link);
        this._vals[key] = link;
    }

    return this;
};

/**
 * @public
 * @memberOf {LRUDict}
 * @method
 *
 * @param {String} key
 *
 * @returns {Boolean}
 * */
LRUDict.prototype.del = function (key) {
    if (unlink(this, this._vals[key])) {
        delete this._vals[key];

        return true;
    }

    return false;
};

/**
 * @public
 * @memberOf {LRUDict}
 * @method
 *
 * @param {String} key
 *
 * @returns {*}
 * */
LRUDict.prototype.get = function (key) {
    var link = unlink(this, this._vals[key]);

    if (link) {
        push(this, link);
        link = link.data;
    }

    return link;
};

/**
 * @public
 * @memberOf {LRUDict}
 * @method
 *
 * @param {String} key
 *
 * @returns {*}
 * */
LRUDict.prototype.peek = function (key) {
    return this._vals[key] && this._vals[key].data;
};

/**
 * @public
 * @memberOf {LRUDict}
 * @method
 *
 * @returns {Array<String>}
 * */
LRUDict.prototype.keys = function () {
    var i = 0;
    var keys = new Array(this._leng);
    var link = this._tail;

    while (link) {
        keys[i] = link.name;
        link = link.next;
        i += 1;
    }

    return keys;
};

/**
 * @public
 * @memberOf {LRUDict}
 * @method
 *
 * @returns {Array<*>}
 * */
LRUDict.prototype.vals = function () {
    var i = 0;
    var link = this._tail;
    var vals = new Array(this.length);

    while (link) {
        vals[i] = link.data;
        link = link.next;
        i += 1;
    }

    return vals;
};

function crop(self, l) {
    var link;
    while (self._leng > l) {
        link = self._tail;
        if (unlink(self, link)) {
            delete self._vals[link.name];
            continue;
        }

        return false;
    }

    return true;
}

function unlink(self, link) {

    if (link) {
        if (link.prev) {
            link.prev.next = link.next;
        } else {
            self._tail = link.next;
        }

        if (link.next) {
            link.next.prev = link.prev;
        } else {
            self._head = link.prev;
        }

        link.prev = null;
        link.next = null;

        self._leng -= 1;
    }

    return link;
}

function push(self, link) {
    if (self._head) {
        self._head.next = link;
    }

    link.prev = self._head;
    link.next = null;
    self._head = link;

    if (!self._tail) {
        self._tail = link;
    }

    self._leng += 1;
}

/**
 * @class Link
 *
 * @param {String} name
 * @param {*} data
 * @param {Link} [prev]
 * @param {Link} [next]
 * */
function Link(name, data, prev, next) {

    /**
     * @public
     * @memberOf {Link}
     * @property
     * @type {String}
     * */
    this.name = name;

    /**
     * @public
     * @memberOf {Link}
     * @property
     * @type {Link}
     * */
    this.prev = prev;

    /**
     * @public
     * @memberOf {Link}
     * @property
     * @type {Link}
     * */
    this.next = next;

    /**
     * @public
     * @memberOf {Link}
     * @property
     * @type {*}
     * */
    this.data = data;
}

/**
 * @public
 * @memberOf {Link}
 * @method
 *
 * @returns {Number}
 * */
Link.prototype.index = function () {
    return (this.prev && this.prev.index() + 1) | 0;
};

module.exports = LRUDict;
