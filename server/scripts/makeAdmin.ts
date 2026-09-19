import "dotenv/config";
import prisma from "../src/config/prisma";

const email = "traditionaldresseswebsite";

async function makeAdmin() {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      role: "ADMIN",
    },
  });

  console.log(`Admin role assigned successfully to: ${updatedUser.email}`);
  console.log(`Role: ${updatedUser.role}`);
}

makeAdmin()
  .catch((error) => {
    console.error("Failed to make user admin:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });