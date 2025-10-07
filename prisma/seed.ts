import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    await tx.user.upsert({
      where: { email: 'john@example.com' },
      update: {},
      create: {
        email: 'john@example.com',
        name: 'John Doe',
        password:
          'd7cd730711e747c1:faeff21ede8dcc56a1046c883c7712261ba251d58f2170de1c369acccb4ebd361183af0a2285b572ba3be08984334cf42c178800bf457ad53b803b046b657c9a',
      },
    });

    await tx.user.upsert({
      where: { email: 'jane@example.com' },
      update: {},
      create: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password:
          'd7cd730711e747c1:faeff21ede8dcc56a1046c883c7712261ba251d58f2170de1c369acccb4ebd361183af0a2285b572ba3be08984334cf42c178800bf457ad53b803b046b657c9a',
      },
    });

    await tx.user.upsert({
      where: { email: 'phuong@example.com' },
      update: {},
      create: {
        email: 'phuong@example.com',
        name: 'Vũ Đức Phương',
        password:
          'd7cd730711e747c1:faeff21ede8dcc56a1046c883c7712261ba251d58f2170de1c369acccb4ebd361183af0a2285b572ba3be08984334cf42c178800bf457ad53b803b046b657c9a',
      },
    });
  });

  console.log('✅ Seed data completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  .finally(async () => {
    await prisma.$disconnect();
  });
