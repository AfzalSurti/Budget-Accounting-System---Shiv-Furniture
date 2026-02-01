import { prisma } from './src/config/prisma.js';

async function main() {
  const users = await prisma.user.findMany({
    include: {
      contact: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });
  
  console.log('Recent users:');
  users.forEach(user => {
    console.log('\n---');
    console.log('Email:', user.email);
    console.log('LoginId:', user.loginId);
    console.log('Role:', user.role);
    console.log('ContactId:', user.contactId);
    console.log('Contact:', user.contact ? {
      id: user.contact.id,
      displayName: user.contact.displayName,
      contactType: user.contact.contactType
    } : 'NULL');
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
