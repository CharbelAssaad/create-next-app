import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getAccessToken, usePrivy } from "@privy-io/react-auth";
import Head from "next/head";
import LLMUserUpdateChat from "../components/LlmUserUpdateChat";

async function verifyToken() {
	const url = "/api/verify";
	const accessToken = await getAccessToken();
	const result = await fetch(url, {
		headers: {
			...(accessToken
				? { Authorization: `Bearer ${accessToken}` }
				: undefined),
		},
	});

	return await result.json();
}

export default function DashboardPage() {
	const [verifyResult, setVerifyResult] = useState();
	const router = useRouter();
	const { ready, authenticated, user, logout } = usePrivy();

	useEffect(() => {
		if (ready && !authenticated) {
			router.push("/");
		}
	}, [ready, authenticated, router]);
	const [dbUser, setdbUser] = useState<null | {
		fullName?: null | string;
		privyId: string;
		email?: null | string;
		wallet?: null | string;
	}>();

	useEffect(() => {
		if (authenticated) {
			verifyToken()
				.then((result) => {
					setVerifyResult(result);
					fetch("/api/sync-user", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							privyId: user?.id,
							email: user?.email,
							wallet: user?.wallet?.id,
							fullName: undefined,
						}),
					}).then(async (res) => {
						if (res.status === 200) {
							const user = await res.json();
							setdbUser(user);
						}
					});
				})
				.catch((error) => {
					console.error("Error verifying token:", error);
				});
		}
	}, [authenticated]);

	return (
		<>
			<Head>
				<title>Privy Auth</title>
			</Head>
			<main className="flex flex-col min-h-screen px-4 sm:px-20 py-6 sm:py-10 bg-privy-light-blue">
				{" "}
				hello {dbUser?.fullName}
				with id {dbUser?.privyId}
				<button
					style={{
						backgroundColor: "blue",
						color: "white",
						padding: "10px 20px",
						borderRadius: "5px",
						maxWidth: "120px",
						margin: "0 auto",
					}}
					onClick={() => {
						void logout();
						router.push("/");
					}}
				>
					Log out
				</button>
				<LLMUserUpdateChat />
			</main>
		</>
	);
}
