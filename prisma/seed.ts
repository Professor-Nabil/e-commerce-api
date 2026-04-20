import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.product.createMany({
    data: [
      {
        name: "Mechanical Keyboard",
        description: "Blue switches, RGB",
        price: 89.99,
        stock: 50,
      },
      {
        name: "Gaming Mouse",
        description: "16000 DPI, wireless",
        price: 45.5,
        stock: 120,
      },
      {
        name: "UltraWide Monitor",
        description: "34 inch, 144Hz",
        price: 450.0,
        stock: 15,
      },
    ],
  });
}

main()
  .then(() => console.log("✅ Database Seeded!"))
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());

/*
npx tsx prisma/seed.ts
🚀 Verification
Run npm run dev.
Open http://localhost:3000/reference in your browser.
Try hitting the GET /api/products button in the UI or use curl localhost:3000/api/products.
How does the Scalar UI look? It's a lot cleaner than just a raw JSON response, right?
 */
