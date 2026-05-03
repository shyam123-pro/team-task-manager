import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

export async function ensureAdminUser() {
  // Backfill role for older users
  await User.updateMany({ role: { $exists: false } }, { $set: { role: "member" } });

  const email = "admin@gmail.com";
  const existing = await User.findOne({ email }).select("_id role");
  if (existing) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    await User.updateOne(
      { _id: existing._id },
      { $set: { role: "admin", passwordHash } }
    );
    // eslint-disable-next-line no-console
    console.log("Ensured admin user: admin@gmail.com / admin123");
    return;
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({ name: "Admin", email, passwordHash, role: "admin" });

  // eslint-disable-next-line no-console
  console.log("Seeded admin user: admin@gmail.com / admin123");
}
