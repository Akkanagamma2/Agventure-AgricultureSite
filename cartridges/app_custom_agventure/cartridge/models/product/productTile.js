'use strict';

var decorators = require('*/cartridge/models/product/decorators/index');
var promotionCache = require('*/cartridge/scripts/util/promotionCache');


/**
 * Decorate product with product tile information
 * @param {Object} product - Product Model to be decorated
 * @param {dw.catalog.Product} apiProduct - Product information returned by the script API
 * @param {string} productType - Product type information
 *
 * @returns {Object} - Decorated product model
 */
module.exports = function productTile(product, apiProduct, productType, params) {
    var productHelper = require('*/cartridge/scripts/helpers/productHelpers');
    var productSearchHit = productHelper.getProductSearchHit(apiProduct);
    var options = productHelper.getConfig(apiProduct, params);
    decorators.base(product, apiProduct, productType);
    decorators.searchPrice(product, productSearchHit, promotionCache.promotions, productHelper.getProductSearchHit);
    decorators.images(product, apiProduct, { types: ['medium'], quantity: 'single' });
    decorators.ratings(product);
    decorators.promotions(product, options.promotions);
    decorators.savedPrice(product, options.savedPrice);
    if (productType === 'set') {
        decorators.setProductsCollection(product, apiProduct);
    }

    decorators.searchVariationAttributes(product, productSearchHit);

    return product;
};
