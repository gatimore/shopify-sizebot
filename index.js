async function addSizes(product) {
  const basePrice = product.variants?.[0]?.price;

  if (!basePrice) {
    console.log(`⚠️ Skipping ${product.title} — no price found.`);
    return;
  }

  const variants = SIZE_VARIANTS.map(size => ({
    option1: size,
    price: basePrice,
    inventory_management: "shopify",
    inventory_quantity: 10
  }));

  const body = {
    product: {
      id: product.id,
      options: [{ name: "Size" }],
      variants
    }
  };

  const res = await fetch(`https://${SHOP}/admin/api/2024-04/products/${product.id}.json`, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  const updated = await res.json();
  console.log(`✅ Updated: ${product.title} with ${SIZE_VARIANTS.length} sizes`);
}
