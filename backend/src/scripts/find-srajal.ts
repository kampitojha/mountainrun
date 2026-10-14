import net from "net";

async function main() {
  const targetHost = "52.76.108.241";
  const targetPort = 5432;
  const localPort = 54338;

  const server = net.createServer((clientSocket) => {
    const upstream = net.connect(targetPort, targetHost, () => {
      clientSocket.pipe(upstream).pipe(clientSocket);
    });
    upstream.on("error", () => clientSocket.destroy());
    clientSocket.on("error", () => upstream.destroy());
  });

  await new Promise<void>((resolve) => server.listen(localPort, "127.0.0.1", resolve));

  const endpoint = "ep-lively-boat-azbjpwf4";
  process.env.DATABASE_URL = `postgresql://neondb_owner:endpoint%3D${endpoint}%24npg_XWpJ0v9ulPKm@127.0.0.1:${localPort}/neondb?sslmode=require`;

  const { prisma } = await import("../lib/prisma.js");

  console.log("Checking DB for user rshashi604@gmail.com or Srajal Rathore...");

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: "rshashi604", mode: "insensitive" } },
        { name: { contains: "Srajal", mode: "insensitive" } },
        { name: { contains: "Rathore", mode: "insensitive" } },
      ],
    },
    include: {
      registrations: {
        include: {
          event: true,
          certificate: true,
          medalDelivery: true,
        },
      },
    },
  });

  console.log(`Found ${users.length} matching users:`);
  console.log(JSON.stringify(users, null, 2));

  // Also check registrations by shipping info
  const regs = await prisma.registration.findMany({
    where: {
      OR: [
        { shippingPhone: { contains: "8957898402" } },
        { shippingName: { contains: "Srajal", mode: "insensitive" } },
      ],
    },
    include: {
      user: true,
      event: true,
      certificate: true,
    },
  });
  console.log(`Found ${regs.length} matching registrations by shipping:`);
  console.log(JSON.stringify(regs, null, 2));

  // Find Rise and Run Event
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { title: { contains: "Rise", mode: "insensitive" } },
        { slug: { contains: "rise", mode: "insensitive" } },
      ],
    },
  });
  console.log("Rise and Run Events in DB:", JSON.stringify(events, null, 2));

  server.close();
}

main().catch(console.error);
