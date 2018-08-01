const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const mongoosePaginate = require('../common/guzzu-paginate');
const mongooseTimestamps = require('mongoose-timestamp');
const ShortId = require('shortid');

const MainSchema = new Schema({
	name: {
		zh: String,
		en: String,
		jp: String
	},
	store: {
		type: Schema.Types.ObjectId,
		ref: 'Store',
		index: true
	},
	slug: {
		type: String,
		index: true,
		default: ShortId.generate,
		unique: true
	},
	products: [{
		type: Schema.Types.ObjectId,
		ref: 'Product'
	}],
	description: {
		zh: String,
		en: String,
		jp: String
	},
	image: Schema.Types.Mixed,
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
	}
});

MainSchema.plugin(mongooseTimestamps);
MainSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('Category', MainSchema, 'categories');
