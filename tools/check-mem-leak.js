#!/usr/bin/env node --expose_gc
'use strict';

var weak = require('weak');
var uniqueId = require('unique-id');
var LRUCache = require('lru-cache');
var Cache = require('../');

var lruc = new LRUCache({max: 50});
var lrud = new Cache(50);
var lrucRefs = 0;
var lrudRefs = 0;

function LrucRef() {
    lrucRefs += 1;
    weak(this, derefLruc);
}

function LrudRef() {
    lrudRefs += 1;
    weak(this, derefLrud);
}

function derefLruc() {
    lrucRefs -= 1;
}

function derefLrud() {
    lrudRefs -= 1;
}

function run() {
    lruc.set(uniqueId(), new LrucRef());
    lrud.set(uniqueId(), new LrudRef());
    setTimeout(run, 0);
}

function log() {
    // gc();
    /*eslint no-console:0*/
    console.log('lrudRefs %d, lrucRefs %d', lrucRefs, lrudRefs);
}

setInterval(log, 1000);

run();
