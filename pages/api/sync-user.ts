// pages/api/sync-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	const { privyId, email, wallet, fullName } = req.body;

	if (!privyId) return res.status(400).json({ message: "Missing privyId" });

	try {
		const user = await prisma.user.upsert({
			where: { privyId },
			update: {
				email: email ?? undefined,
				wallet: wallet ?? undefined,
				fullName: fullName ?? undefined,
			},
			create: {
				privyId,
				email,
				wallet,
				fullName,
			},
		});

		return res.status(200).json({ user });
	} catch (error) {
		console.error("Failed to sync user:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
}
