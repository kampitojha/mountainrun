import net from "net";

async function main() {
  const targetHost = "52.76.108.241";
  const targetPort = 5432;
  const localPort = 54339;

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

  const rarRegs = await prisma.registration.findMany({
    where: {
      event: { slug: "rise-and-run" },
    },
    select: {
      id: true,
      bibNumber: true,
      distance: true,
      status: true,
      proofStatus: true,
      shippingName: true,
      finishTimeSeconds: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      certificate: {
        select: {
          id: true,
          certificateNumber: true,
          status: true,
        },
      },
    },
    take: 10,
  });

  console.log(`Found ${rarRegs.length} sample Rise and Run registrations:`);
  console.log(JSON.stringify(rarRegs, null, 2));

  server.close();
}

main().catch(console.error);
