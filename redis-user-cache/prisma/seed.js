import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      {
        name: "Rahul",
        email: "rahul@gmail.com",
      },
      {
        name: "Amit",
        email: "amit@gmail.com",
      },
      {
        name: "John",
        email: "john@gmail.com",
      },
    ],
  });

  console.log("Users Added");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
