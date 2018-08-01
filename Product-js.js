const mongoose = require('mongoose');
const mongooseTimestamps = require('mongoose-timestamp');
const mongoosePaginate = require('../common/guzzu-paginate');
const ShortId = require('shortid');
const Schema = mongoose.Schema;

/**
 * @class Product
 * @prop {String} slug - The URL component for product.
 * @prop {String} name - Product name in the primary language.
 * @prop {String} description - Product description in the primary language.
 * @prop {Number} price - Primary price of the product in cent. Only used if `productOptions` is empty (which means there is no product option).
 * @prop {Boolean} isDiscounted - If set the true, then `originalPrice` is used to display as the original price before discount.
 * @prop {Number} originalPrice - Original price before discount (unit:cent).
 * @prop {String=draft,published,private,archived} status - Product visibility in the public site.
 * - "draft" - a product is not visible to the public yet.
 * - "published"
 * - "private"
 * - "archived"
 * @prop {Date} publishedAt - if product `status` is "published", then this is the date the product is published.
 * @prop {Mongoose.ObjectId} store - Pointer to the store of the product.
 * @prop {array} groups - Array of objectid, store specific groups the product is assigned to.
 * @prop {String} sku - Stock keeping unit reserved for internal use.
 * @prop {Number} weight - In gram.
 * @prop {String} inventoryPolicy - Should we worry about the number of product in stock?
 * - "unlimited" - allow the product to be purchased regardless of `maxQuantity` and `purchased`
 * - "limited" - allow purchase only if `purchased` < `maxQuantity`
 * @prop {Number=0} purchased - how many sold. Auto increment when an order is paid.
 * @prop {Number} maxQuantity - how many can be sold.
 * @prop {String=default} type - Product type.
 * @prop {Number} maxPurchasePerCustomer - up to how many pieces of the product a customer can buy.
 * @prop {Date} onlineAt
 * @prop {Date} offlineAt
 * @prop {String} metaDescription - HTML "description" meta tag
 * @prop {String} weixinShareTitle - WeChat share title
 * @prop {String} weixinShareDescription - WeChat share description
 * @prop {Object} image
 * @prop {String} image.url - absolute url of the medium size image.
 * @prop {String} image.thumb.url
 * @prop {String} image.medium.url
 * @prop {String} image.large.url
 * @prop {Object[]} gallery
 * @prop {String} gallery.url - url
 * @prop {String} gallery.thumb.url
 * @prop {String} gallery.medium.url
 * @prop {String} gallery.large.url
 * @prop {Object[]} productOptions - if product options are available, this table will be used to override the product's primary `price`, `inventoryPolicy`, `maxQuantity`, `purchased`, `status`
 * @prop {Number} productOptions.price - price of the option (unit: cent)
 * @prop {String} productOptions.name - option name in the primary language
 * @prop {String} productOptions.description
 * @prop {String} productOptions.inventoryPolicy - "limited" or "unlimited"
 * @prop {Number} productOptions.maxQuantity
 * @prop {Number} productOptions.purchased
 * @prop {String} productOptions.status - "active", "inactive", "soldout"
 * @prop {Object[]} inOrders - Track products that are currently reserved for **pending** orders. When these orders expire, the reserve products will be release back to the pool.
 * @prop {Number} inOrders.quantity
 * @prop {Date} inOrders.createdAt
 * @prop {Mongoose.ObjectId} inOrders.order - Pointer to the order
 * @prop {Mongoose.ObjectId} inOrders.productOption - Pointer to the product option
 * @prop {Mongoose.ObjectId} inOrders.customer
 * @prop {String=default,rate-table} shippingType - 'default' flat rate shipping per piece, 'rate-table' use shipping-rate-table
 * @prop {ObjectId} shippingDescription
 * @prop {ObjectId} productSpec
 * @prop {Object[]} shippingCosts - List of shipping cost for different countries.
 * @prop {String} shippingCosts.country - 3-letter country code: "CHN", "HKG"
 * @prop {Number} shippingCosts.price - shipping cost for default shipping-type
 * @prop {Mongoose.ObjectId} shippingRateTable
 * @prop {Date} eventStartTime For `ticket` type product
 * @prop {Date} eventEndTime For `ticket` type product
 * @prop {String} eventLocation For `ticket` type product
 * @prop {Object} customOrderFields
 */

const CustomOrderField = new Schema({
	type: {
		type: String
	},
	name: {
		zh: String,
		en: String
	},
	required: {
		type: Boolean
	},
	enum: [{
		zh: String,
		en: String
	}]
}, {
	id: false
});

const MainSchema = new Schema({
	slug: {
		type: String,
		index: true,
		default: ShortId.generate,
		unique: true
	},
	name: {
		zh: String,
		en: String,
		jp: String
	},
	description: {
		zh: String,
		en: String,
		jp: String
	},
	price: Number,
	isDiscounted: Boolean,
	originalPrice: Number,
	status: String,
	isArchived: Boolean,
	publishedAt: Date,
	store: {
		type: Schema.Types.ObjectId,
		ref: 'Store'
	},
	// sku: String,
	weight: Number,
	inventoryPolicy: String,
	purchased: {
		type: Number,
		default: 0
	},
	maxQuantity: {
		type: Number,
		default: 0
	},
	type: String,
	// maxPurchasePerCustomer: Number,
	// onlineAt: Date,
	// offlineAt: Date,
	metaDescription: {
		zh: String,
		en: String,
		jp: String
	},
	weixinShareTitle: {
		zh: String,
		en: String,
		jp: String
	},
	weixinShareDescription: {
		zh: String,
		en: String,
		jp: String
	},
	image: Schema.Types.Mixed,
	gallery: [Schema.Types.Mixed],
	productOptions: [{
		price: Number,
		name: {
			zh: String,
			en: String,
			jp: String
		},
		description: {
			zh: String,
			en: String,
			jp: String
		},
		inventoryPolicy: String,
		maxQuantity: Number,
		purchased: Number,
		image: Schema.Types.Mixed,
		// sku: String,
		weight: Number
	}],
	inOrders: [{
		quantity: Number,
		createdAt: Date,
		order: {
			type: Schema.Types.ObjectId,
			ref: 'Order'
		},
		productOption: {
			type: Schema.Types.ObjectId
		},
		customer: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		}
	}],
	shippingType: {
		type: String
	},
	shippingDescription: {
		type: Schema.Types.ObjectId,
		ref: 'ShippingDescription'
	},
	productSpec: {
		type: Schema.Types.ObjectId,
		ref: 'ProductSpec'
	},
	shippingCosts: [{
		country: String,
		price: Number
	}],
	shippingRateTable: {
		type: Schema.Types.ObjectId,
		ref: 'ShippingRateTable'
	},
	reviewCount: {
		type: Number,
		default: 0
	},
	ratingTotal: {
		positive: {
			type: Number,
			default: 0
		},
		moderate: {
			type: Number,
			default: 0
		},
		negative: {
			type: Number,
			default: 0
		}
	},
	eventStartTime: Date,
	eventEndTime: Date,
	eventLocation: String,
	customOrderFields: [CustomOrderField]
});

/**
 * If the product type is "default" or "timesale", determine of the product is available for sale.
 * @memberof Product
 * @method enableBuy
 * @param {Object} product
 * @param {Number} quantity
 * @return {Boolean}
 */
MainSchema.statics.enableBuy = function(product, quantity) {
	if (product.status !== 'published' && product.status !== 'private') {
		return false;
	}
	var now = new Date();
	if (product.type === 'timesale') {
		//	check onlineAt if exist
		if (product.onlineAt) {
			var onlineAt = new Date(product.onlineAt);
			if (now < onlineAt) {
				return false;
			}
		}
		//	check offlineAt if exist
		if (product.offlineAt) {
			var offlineAt = new Date(product.offlineAt);
			if (now > offlineAt) {
				return false;
			}
		}
	}
	// check if inventory can cover requested number of item
	if (product.inventoryPolicy === 'limited' && product.purchased + quantity > product.maxQuantity) {
		return false;
	}
	return true;
};

/**
 * Return the product price. If option is provided, return the option price instead.
 * @memberof Product
 * @method checkoutPrice
 * @param {Object} product
 * @param {Object} option
 * @return {Number}
 */
MainSchema.statics.checkoutPrice = function(product, option) {
	var result = product.price;
	if (option && option.price) {
		result = option.price;
	}
	return result;
};

MainSchema.plugin(mongoosePaginate);
MainSchema.plugin(mongooseTimestamps);

module.exports = mongoose.model('Product', MainSchema, 'products');
