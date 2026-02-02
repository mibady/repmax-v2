# Telegram Payments

## Payment Types

| Type               | Currency | Use Case                     |
| ------------------ | -------- | ---------------------------- |
| **Telegram Stars** | XTR      | Digital goods, subscriptions |
| **Third-Party**    | USD, EUR | Physical goods               |

## Telegram Stars

Revenue split: ~75% to bot (Apple/Google take ~25%)

### Create Invoice

```typescript
const invoice = await bot.createInvoiceLink({
  title: "Premium Access",
  description: "Unlock all features for 30 days",
  payload: JSON.stringify({ type: "premium", userId: user.id }),
  provider_token: "", // Empty for Stars
  currency: "XTR",
  prices: [{ label: "Premium (30 days)", amount: 100 }], // 100 Stars
});

// Send to user
await bot.sendMessage(chatId, "Get Premium:", {
  reply_markup: {
    inline_keyboard: [[{ text: "Buy (100 ⭐)", url: invoice }]],
  },
});
```

### Handle Payment

```typescript
// Listen for successful_payment update
bot.on("successful_payment", (msg) => {
  const payment = msg.successful_payment;
  // payment.telegram_payment_charge_id
  // payment.invoice_payload (your JSON)
  // payment.total_amount (in Stars)

  // Deliver the product
  await deliverPremium(JSON.parse(payment.invoice_payload));
});
```

### Refunds

```typescript
await bot.refundStarPayment(userId, telegramPaymentChargeId);
```

## Mini App Payments

```typescript
// Open invoice in Mini App
Telegram.WebApp.openInvoice(invoiceLink, (status) => {
  // status: 'paid', 'cancelled', 'failed', 'pending'
  if (status === "paid") {
    showSuccess();
  }
});
```

## Subscriptions

```typescript
// Create subscription invoice
const invoice = await bot.createInvoiceLink({
  title: "Pro Subscription",
  description: "Monthly access",
  payload: JSON.stringify({ type: "subscription", plan: "pro" }),
  provider_token: "",
  currency: "XTR",
  prices: [{ label: "Monthly", amount: 50 }],
  subscription_period: 2592000, // 30 days in seconds
});
```

## Third-Party Payments

For physical goods requiring shipping:

```typescript
const invoice = await bot.createInvoiceLink({
  title: "T-Shirt",
  description: "Branded t-shirt",
  payload: JSON.stringify({ productId: "shirt-001" }),
  provider_token: "YOUR_PAYMENT_PROVIDER_TOKEN", // Stripe, etc.
  currency: "USD",
  prices: [
    { label: "T-Shirt", amount: 1999 }, // $19.99
    { label: "Shipping", amount: 500 }, // $5.00
  ],
  need_shipping_address: true,
  need_name: true,
});
```
