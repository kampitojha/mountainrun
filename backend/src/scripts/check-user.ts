import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const bib = '830765';
    console.log(`Checking user with ID or Bib: ${bib}`);

    // Try finding by Bib Number (e.g. MR-830765 or just 830765)
    const registrations = await prisma.registration.findMany({
      where: {
        OR: [
          { bibNumber: { contains: bib } },
          { id: { contains: bib } }
        ]
      },
      include: {
        user: true,
        event: true
      }
    });

    console.log(`Found ${registrations.length} registrations.`);
    for (const reg of registrations) {
      console.log(`- Reg ID: ${reg.id}`);
      console.log(`  Bib: ${reg.bibNumber}`);
      console.log(`  User: ${reg.user.name} (${reg.user.email})`);
      console.log(`  Event: ${reg.event.title} (${reg.event.slug})`);
      console.log(`  Distance: ${reg.distance}`);
      console.log(`  Proof Status: ${reg.proofStatus}`);
      console.log(`  Status: ${reg.status}`);
      console.log(`  Payment Status: ${reg.paymentId ? 'Has Payment' : 'No Payment'}`);
      console.log(`  Finish Time (s): ${reg.finishTimeSeconds}`);
    }
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
