/*eslint max-nested-callbacks: 0, no-console: 0*/
'use strict';

var childProcess = require('child_process');
var glob = require('glob');
var path = require('path');
var _ = require('lodash-node');
var vow = require('vow');
var fs = require('fs');

module.exports = function () {

    this.task('benchmark', ['test'], function (done) {
        var runners = glob.sync(path.join(__dirname, '..', '..', 'benchmark', '*'));

        runners = runners.filter(function (name) {
            return !fs.statSync(name).isDirectory();
        });

        _.reduce(runners, function (promise, name) {
            return promise.then(function () {
                var defer = vow.defer();
                var childProc = childProcess.spawn(name, []);
                childProc.stdout.pipe(process.stdout);
                childProc.stderr.pipe(process.stderr);
                childProc.on('exit', function (code) {
                    if (code) {
                        defer.reject(code);
                    } else {
                        defer.resolve(code);
                    }
                });

                childProc.on('error', function (err) {
                    defer.reject(err);
                });

                return defer.promise();
            });
        }, vow.resolve()).then(function () {
            done();
        }, done);
    });
};
