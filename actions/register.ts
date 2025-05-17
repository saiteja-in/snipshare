// app/actions/register.ts
"use server";

import bcrypt from "bcryptjs";
import * as z from "zod";
import { RegisterSchema } from "@/schemas";
import { db } from "@/lib/db";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/mail";
import { slugify } from "@/lib/slugify";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
  const parsed = RegisterSchema.safeParse(values);
  if (!parsed.success) {
    return { error: "Invalid fields" };
  }

  const { name, email, password } = parsed.data;
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if email already exists
  if (await db.user.findUnique({ where: { email } })) {
    return { error: "Email already in use!" };
  }

  // Generate a base slug from name or email prefix
  const baseSlug = slugify(name ?? email.split("@")[0]);
  let uniqueSlug = baseSlug;
  let counter = 1;

  // Ensure slug is unique
  while (await db.user.findUnique({ where: { slug: uniqueSlug } })) {
    uniqueSlug = `${baseSlug}-${counter++}`;
  }

  // Create the user with the unique slug
  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      slug: uniqueSlug,
    },
  });

  // Send email verification
  const { token } = await generateVerificationToken(email);
  await sendVerificationEmail(email, token);

  return { success: "Confirmation email sent" };
};
