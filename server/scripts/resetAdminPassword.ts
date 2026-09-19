import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma";

const email = "naome.campbel@gmail.com";
const newPassword = "Admin@12345";

async function resetAdminPassword() {
  const passwordHash = await bcrypt.hash(
    newPassword,
    12,
  );

  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(
    `Admin password updated successfully for: ${user.email}`,
  );
  console.log(`Role: ${user.role}`);
  console.log(`New password: ${newPassword}`);
}

resetAdminPassword()
  .catch((error) => {
    console.error(
      "Failed to reset admin password:",
      error,
    );
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });