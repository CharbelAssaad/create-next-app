import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";

export default function LLMUserUpdateChat() {
	const [message, setMessage] = useState("");
	const [response, setResponse] = useState("");
	const [loading, setLoading] = useState(false);

	const { user } = usePrivy();

	const handleSend = async () => {
		if (!message.trim()) return;

		setLoading(true);
		setResponse("");
		if (!user) {
			setResponse("❌ User not found.");
		}
		try {
			const res = await fetch("/api/llm-edit-user", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					input: message,
					privyId: user?.id,
				}),
			});

			const data = await res.json();

			if (res.ok) {
				setResponse(
					`✅ User updated:\n${JSON.stringify(data.user, null, 2)}`
				);
			} else {
				setResponse(`❌ Error: ${data.message}`);
			}
		} catch (err) {
			console.error("Request failed:", err);
			setResponse("❌ Internal error while updating user.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-xl mx-auto mt-10 p-6 border rounded-md shadow-sm bg-white space-y-4">
			<h2 className="text-xl font-semibold">Chat with your Assistant</h2>
			<textarea
				className="w-full p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
				placeholder="What would you like to update?"
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				disabled={loading}
			/>
			<button
				onClick={handleSend}
				disabled={loading || !message.trim()}
				className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
			>
				{loading ? "Updating..." : "Send to Assistant"}
			</button>
			{response && (
				<pre className="bg-gray-100 p-3 rounded text-sm overflow-auto whitespace-pre-wrap">
					{response}
				</pre>
			)}
		</div>
	);
}
