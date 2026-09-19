export interface Env {
	DB: D1Database;
}

const JSON_HEADERS: Record<string, string> = {
	"Content-Type": "application/json; charset=utf-8",
	"Cache-Control": "public, max-age=60, s-maxage=60",
};

function corsHeaders(origin: string | null): Record<string, string> {
	return {
		"Access-Control-Allow-Origin": origin ?? "*",
		"Access-Control-Allow-Methods": "GET,POST,OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type, X-Visitor-Id",
		"Vary": "Origin, X-Visitor-Id",
	};
}

function json(data: unknown, init: ResponseInit = {}, origin: string | null = null): Response {
	return new Response(JSON.stringify(data), {
		...init,
		headers: { ...JSON_HEADERS, ...corsHeaders(origin) },
	});
}

async function getCounts(
	env: Env,
	ids: string[],
	visitorId: string,
): Promise<Record<string, { likes: number; liked: boolean }>> {
	const out: Record<string, { likes: number; liked: boolean }> = {};
	if (ids.length === 0) return out;

	const placeholders = ids.map(() => "?").join(",");
	const { results: countRows } = await env.DB.prepare(
		`SELECT id, likes FROM posts WHERE id IN (${placeholders})`,
	).bind(...ids).all<{ id: string; likes: number }>();

	for (const id of ids) out[id] = { likes: 0, liked: false };
	for (const row of countRows) {
		if (out[row.id]) out[row.id].likes = row.likes;
	}

	if (visitorId) {
		const { results: likedRows } = await env.DB.prepare(
			`SELECT post_id FROM like_records WHERE visitor_id = ? AND post_id IN (${placeholders})`,
		).bind(visitorId, ...ids).all<{ post_id: string }>();
		for (const row of likedRows) {
			if (out[row.post_id]) out[row.post_id].liked = true;
		}
	}

	return out;
}

async function toggleLike(
	env: Env,
	id: string,
	visitorId: string,
): Promise<{ liked: boolean; likes: number }> {
	if (!id || id.length > 200) {
		return { liked: false, likes: 0 };
	}

	const existing = await env.DB.prepare(
		"SELECT 1 FROM like_records WHERE post_id = ? AND visitor_id = ?",
	).bind(id, visitorId).first();

	if (existing) {
		await env.DB.prepare(
			"DELETE FROM like_records WHERE post_id = ? AND visitor_id = ?",
		).bind(id, visitorId).run();
		await env.DB.prepare(
			"UPDATE posts SET likes = MAX(likes - 1, 0) WHERE id = ?",
		).bind(id).run();
	} else {
		await env.DB.prepare(
			"INSERT INTO like_records (post_id, visitor_id) VALUES (?, ?)",
		).bind(id, visitorId).run();
		await env.DB.prepare(
			"INSERT INTO posts (id, likes) VALUES (?, 1) ON CONFLICT(id) DO UPDATE SET likes = likes + 1",
		).bind(id).run();
	}

	const row = await env.DB.prepare("SELECT likes FROM posts WHERE id = ?")
		.bind(id).first<{ likes: number }>();

	return { liked: !existing, likes: row?.likes ?? 0 };
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const origin = request.headers.get("Origin");

		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: corsHeaders(origin),
			});
		}

		const visitorId = (request.headers.get("X-Visitor-Id") ?? "").trim();

		if (request.method === "GET" && url.pathname === "/api/likes") {
			const ids = (url.searchParams.get("ids") ?? "")
				.split(",")
				.map((s) => s.trim())
				.filter((s) => s.length > 0)
				.slice(0, 50);
			const data = await getCounts(env, ids, visitorId);
			return json({ data }, {}, origin);
		}

		if (request.method === "POST" && url.pathname.startsWith("/api/likes/")) {
			const id = decodeURIComponent(url.pathname.slice("/api/likes/".length));
			if (!visitorId) {
				return json({ error: "Missing X-Visitor-Id" }, { status: 400 }, origin);
			}
			const result = await toggleLike(env, id, visitorId);
			return json(result, {}, origin);
		}

		return json({ error: "Not found" }, { status: 404 }, origin);
	},
};