import { prisma } from "../lib/prisma.js";

async function main() {
  const reg = await prisma.registration.findFirst({
    where: { bibNumber: { contains: "410349" } },
    include: { user: true, certificate: true },
  });

  console.log("=== DB RECORD ===");
  console.log("Registration ID:", reg?.id);
  console.log("User ID        :", reg?.user?.id);
  console.log("User Name      :", reg?.user?.name);
  console.log("User Email     :", reg?.user?.email);
  console.log("Shipping Name  :", reg?.shippingName);
  console.log("Certificate ID :", reg?.certificate?.id);
  console.log("Certificate No :", reg?.certificate?.certificateNumber);

  // Check all users with this email or name
  const allUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "vyasreshma", mode: "insensitive" } },
        { name: { contains: "Vyas", mode: "insensitive" } },
      ],
    },
  });
  console.log("All matching users:", JSON.stringify(allUsers, null, 2));
}

main().finally(() => prisma.$disconnect());
