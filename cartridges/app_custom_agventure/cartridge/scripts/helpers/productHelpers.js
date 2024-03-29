'use strict';

var base = module.superModule;

var collections = require('*/cartridge/scripts/util/collections');
var urlHelper = require('*/cartridge/scripts/helpers/urlHelpers');




/**
 * If a product is master and only have one variant for a given attribute - auto select it
 * @param {dw.catalog.Product} apiProduct - Product from the API
 * @param {Object} params - Parameters passed by querystring
 *
 * @returns {Object} - Object with selected parameters
 */
function normalizeSelectedAttributes(apiProduct, params) {
    if (!apiProduct.master) {
        return params.variables;
    }

    var variables = params.variables || {};
    if (apiProduct.variationModel) {
        collections.forEach(apiProduct.variationModel.productVariationAttributes, function (attribute) {
            var allValues = apiProduct.variationModel.getAllValues(attribute);
            if (allValues.length === 1) {
                variables[attribute.ID] = {
                    id: apiProduct.ID,
                    value: allValues.get(0).ID
                };
            }
        });
    }

    return Object.keys(variables) ? variables : null;
}

/**
 * Get information for model creation
 * @param {dw.catalog.Product} apiProduct - Product from the API
 * @param {Object} params - Parameters passed by querystring
 *
 * @returns {Object} - Config object
 */
function getConfig(apiProduct, params) {
    var variables = normalizeSelectedAttributes(apiProduct, params);
    var variationModel = base.getVariationModel(apiProduct, variables);
    if (variationModel) {
        apiProduct = variationModel.selectedVariant || apiProduct; // eslint-disable-line
    }
    var PromotionMgr = require('dw/campaign/PromotionMgr');
    var promotions = PromotionMgr.activeCustomerPromotions.getProductPromotions(apiProduct);
    var optionsModel = base.getCurrentOptionModel(apiProduct.optionModel, params.options);

    //custom

    var formatMoney = require('dw/util/StringUtils').formatMoney;
    var Money = require('dw/value/Money');

    var formatprice = 0;
    if(promotions.length>0){
        var money = promotions[0].getPromotionalPrice(apiProduct);
        var value = money.value
        if(promotions[0].promotionClass=="PRODUCT" && value!=0){
            var name = promotions[0].name;
            var savedPrice = apiProduct.priceModel.price.value-value;
            var NewMoney = new Money(savedPrice, money.currencyCode);
            formatprice = formatMoney(NewMoney);
        }
    }

    var options = {
        variationModel: variationModel,
        options: params.options,
        optionModel: optionsModel,
        promotions: promotions,
        quantity: params.quantity,
        variables: variables,
        apiProduct: apiProduct,
        productType: base.getProductType(apiProduct),
        savedPrice: formatprice
    };

    return options;
}


base.getConfig = getConfig;

module.exports = base;
