import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../lib/prisma";

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== "POST")
		return res.status(405).json({ message: "Method Not Allowed" });

	const { input, privyId } = req.body;

	if (!input || !privyId) {
		return res.status(400).json({ message: "Missing input or privyId" });
	}

	const prompt = `
You are an assistant that updates user profiles.
Given a user command, return a JSON object with the updated fields.

Only include:
- fullName (string)
- bio (string)

Examples:
Input: "Change my name to Charbel the Wise"
Output: { "fullName": "Charbel the Wise" }

Input: "Set my bio to 'I build apps and cast spells'"
Output: { "bio": "I build apps and cast spells" }

Now respond to this input: "${input}"
`;

	try {
		const openaiRes = await fetch(
			"https://api.openai.com/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					model: "gpt-4",
					messages: [{ role: "user", content: prompt }],
					temperature: 0.2,
				}),
			}
		);

		const json = await openaiRes.json();
		const content = json.choices?.[0]?.message?.content ?? "{}";
		const parsedUpdates = JSON.parse(content);

		const updates: Record<string, any> = {};
		if (parsedUpdates.fullName) updates.fullName = parsedUpdates.fullName;
		if (parsedUpdates.bio) updates.bio = parsedUpdates.bio;

		const user = await prisma.user.update({
			where: { privyId },
			data: updates,
		});

		return res.status(200).json({ user });
	} catch (error) {
		console.error("LLM update error:", error);
		return res.status(500).json({ message: "Failed to process user update" });
	}
}
