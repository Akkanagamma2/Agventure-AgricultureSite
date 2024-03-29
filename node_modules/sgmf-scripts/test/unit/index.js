'use strict';

const assert = require('chai').assert;
const mockSpawn = require('mock-spawn');
const proxyquire = require('proxyquire').noCallThru().noPreserveCache();

const mySpawn = mockSpawn();
mySpawn.setDefault(mySpawn.simple(0));

describe('Index', () => {
    describe('Lint', function () {
        this.timeout(5000); // first call is longer
        const args = process.argv;
        const processExit = process.exit;
        beforeEach(() => {
            process.exit = () => {};
            process.argv = [];
        });
        afterEach(() => {
            process.argv = args;
            process.exit = processExit;
        });

        it('should run eslint without --fix', () => {
            process.argv = ['', '', '--lint', 'js'];
            proxyquire('../../index', {
                child_process: {
                    spawn: mySpawn
                }
            });

            const mockCall = mySpawn.calls[0];
            assert.isTrue(mockCall.command.indexOf('.bin/eslint') >= 0);
            assert.isTrue(mockCall.command.indexOf('--fix') < 0);
        });

        it('should run eslint with --fix', () => {
            process.argv = ['', '', '--lint', 'js', '--fix'];
            proxyquire('../../index', {
                child_process: {
                    spawn: mySpawn
                }
            });

            const mockCall = mySpawn.calls[1];
            assert.isTrue(mockCall.command.indexOf('.bin/eslint --fix') >= 0);
        });

        it('should run stylelint without --fix', () => {
            process.argv = ['', '', '--lint', 'css'];
            proxyquire('../../index', {
                child_process: {
                    spawn: mySpawn
                }
            });

            const mockCall = mySpawn.calls[2];
            assert.isTrue(mockCall.command.indexOf('.bin/stylelint') >= 0);
            assert.isTrue(mockCall.command.indexOf('--fix') < 0);
        });

        it('should run stylelint with --fix', () => {
            process.argv = ['', '', '--lint', 'css', '--fix'];
            proxyquire('../../index', {
                child_process: {
                    spawn: mySpawn
                }
            });

            const mockCall = mySpawn.calls[3];
            assert.isTrue(mockCall.command.indexOf('.bin/stylelint --fix') >= 0);
        });
    });
});
