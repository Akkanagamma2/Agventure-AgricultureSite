'use strict';

module.exports = function (object, savedPrice) {
    Object.defineProperty(object, 'savedPrice', {
        enumerable: true,
        value: savedPrice===0 ? null : savedPrice
    });
}