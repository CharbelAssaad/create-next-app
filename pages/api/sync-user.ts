import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "../../generated/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	try {
		if (req.method !== "POST") {
			return res.status(405).json({ message: "Method Not Allowed" });
		}

		console.log("🧠 Body:", req.body);

		const { privyId, email, wallet, fullName } = req.body;

		if (!privyId) {
			return res.status(400).json({ message: "Missing privyId" });
		}
		const prisma = new PrismaClient();

		const user = await prisma.user.upsert({
			where: { privyId },
			update: { email, wallet, fullName },
			create: { privyId, email, wallet, fullName },
		});

		return res.status(200).json({ user });
	} catch (error) {
		return res.status(500).json({ message: "Internal server error", error });
	}
}
