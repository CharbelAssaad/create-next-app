// pages/api/llm-edit-user.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { PrismaClient } from "@prisma/client";
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	const { input, privyId } = req.body as {
		input: string;
		privyId: string;
	};

	if (!input || !privyId) {
		return res.status(400).json({ message: "Missing input or privyId" });
	}

	try {
		const completion = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful assistant that updates user profiles.",
				},
				{ role: "user", content: input },
			],
			functions: [
				{
					name: "updateUserProfile",
					description:
						"Update the user's profile with the provided information.",
					parameters: {
						type: "object",
						properties: {
							fullName: { type: "string" },
						},
						required: ["fullName"],
						additionalProperties: false,
					},
				},
			],
			function_call: "auto",
		});

		const fnCall = completion.choices[0]?.message.function_call;
		if (!fnCall) {
			return res
				.status(400)
				.json({ message: "No valid function call produced by the model." });
		}

		const { fullName } = JSON.parse(fnCall.arguments ?? "{}");
		const prisma = new PrismaClient();
		const updatedUser = await prisma.user.update({
			where: { privyId },
			data: { fullName },
		});

		return res.status(200).json({ updatedUser });
	} catch (err: any) {
		console.error("Sync failed:", err);
		return res
			.status(500)
			.json({ message: "Internal server error", error: err });
	}
}
