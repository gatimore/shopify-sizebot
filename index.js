const fetch = require("node-fetch");

const SHOP = process.env.SHOP;
const TOKEN = process.env.TOKEN;

const SIZE_VARIANTS = [
  "6", "6.5", "7", "7.5", "8", "8.5",
  "9", "9.5", "10", "10.5", "11", "11.5",
  "12", "12.5", "13", "14", "15"
];

let lastCheckedId = 0;

async function getNewProducts() {
  const res = await fetch(`https://${SHOP}/admin/api/2024-04/products.json?limit=5&order=created_at desc`, {
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json"
    }
  });
  const data = await res.json();
  const newOnes = data.products.filter(p => p.id > lastCheckedId);
  if (newOnes.length > 0) {
    lastCheckedId = newOnes[0].id;
  }
  return newOnes;
}

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
    inventory_quantity: 100
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

async function runBot() {
  try {
    const products = await getNewProducts();

    for (const product of products) {
      if (product.variants.length <= 1) {
        console.log(`🛠 Adding sizes to: ${product.title}`);
        await addSizes(product);
      } else {
        console.log(`⏭ Skipped (already has variants): ${product.title}`);
      }
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

setInterval(runBot, 5 * 60 * 1000); // every 5 minutes
console.log("🤖 Shopify SizeBot is running...");
