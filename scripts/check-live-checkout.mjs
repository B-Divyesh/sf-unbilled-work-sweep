const checkout = 'https://api.sociobot.in/api/v1/products/unbilled-work-sweep/checkout';
const response = await fetch(checkout, { redirect: 'follow' });
const destination = new URL(response.url);

if (response.status !== 200 || !response.redirected || destination.hostname !== 'checkout.dodopayments.com') {
  throw new Error(`Checkout contract failed: HTTP ${response.status}, redirected=${response.redirected}, destination=${destination.hostname}`);
}

console.log(`Checkout contract passed: HTTP ${response.status} at ${destination.hostname}; no purchase attempted.`);
