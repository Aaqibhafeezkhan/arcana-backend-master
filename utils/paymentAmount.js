// Shared conversion: stored order total (USD) → Paystack charge amount (NGN kobo).
//
// order.totalPrice is in USD and already includes the server-computed shipping fee
// (USD 5 for Nigeria, USD 20 international — routes/orderRoutes.js).
// Both POST /api/paystack/initialize and the charge.success webhook use this
// function so they can never disagree on the expected amount.
const EXCHANGE_RATE = 1547.30;

function orderAmountKobo(order) {
  return Math.round(order.totalPrice * EXCHANGE_RATE * 100);
}

module.exports = { orderAmountKobo, EXCHANGE_RATE };
