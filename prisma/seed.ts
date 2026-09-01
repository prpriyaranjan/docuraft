import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a demo user
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@docucraft.app" },
    update: {},
    create: {
      email: "demo@docucraft.app",
      name: "Demo User",
      passwordHash: "$2a$10$demo.hash.placeholder", // Will need real hash in production
    },
  });

  console.log("✅ Created demo user:", demoUser.email);

  // Create sample orders for demo
  const orders = [
    {
      userId: demoUser.id,
      templateId: "resume-modern-001",
      amount: 500, // ₹5 in paise
      status: "paid",
      paymentId: "pay_demo_001",
    },
    {
      userId: demoUser.id,
      templateId: "biodata-traditional-002",
      amount: 500,
      status: "paid",
      paymentId: "pay_demo_002",
    },
  ];

  for (const order of orders) {
    await prisma.order.upsert({
      where: { id: order.paymentId },
      update: {},
      create: {
        id: order.paymentId,
        ...order,
      },
    });
  }

  console.log("✅ Created demo orders");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });