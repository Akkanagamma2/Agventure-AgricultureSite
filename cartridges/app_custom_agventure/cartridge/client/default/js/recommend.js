'use strict';

var processInclude = require('base/util');

$(document).ready(function () {
    processInclude(require('./product/quickView'));
    processInclude(require('wishlist/product/wishlistHeart'));
});