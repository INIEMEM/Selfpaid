const Paystack = require("paystack-node");

const paystackClient = new Paystack(process.env.PAYSTACK_SECRET_KEY);

module.exports = paystackClient;
