import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create default municipality
  const municipality = await prisma.municipality.upsert({
    where: { name: 'Default Municipality' },
    update: {},
    create: {
      name: 'Default Municipality',
    },
  });

  console.log('✅ Created municipality:', municipality.name);

  // Create categories
  const categories = [
    { name: 'Pothole', icon: '🛣️' },
    { name: 'Garbage', icon: '🗑️' },
    { name: 'Water Leakage', icon: '💧' },
    { name: 'Streetlight', icon: '💡' },
    { name: 'Drainage', icon: '🚰' },
    { name: 'Other', icon: '📝' },
  ];

  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: {
        ...categoryData,
        municipalityId: municipality.id,
      },
    });

    console.log('✅ Created category:', category.name);
  }

  console.log('🎉 Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });