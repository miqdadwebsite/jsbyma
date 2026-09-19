export interface LikeState {
	likes: number;
	liked: boolean;
}

// Point this at your deployed worker, or override during build with:
//   PUBLIC_LIKES_API_URL=https://your-worker.your-account.workers.dev
// For local dev, start the worker with `npm run dev` (worker dir) and set:
//   PUBLIC_LIKES_API_URL=http://localhost:8787
const API_BASE =
	(import.meta.env.PUBLIC_LIKES_API_URL as string | undefined) ??
	"https://jsbyma-likes.workers.dev";

const VISITOR_KEY = "jsbyma_visitor_id";

export function getVisitorId(): string {
	if (typeof window === "undefined") return "";
	let id = localStorage.getItem(VISITOR_KEY);
	if (!id) {
		try {
			id = crypto.randomUUID();
		} catch {
			id = `v-${Date.now()}-${Math.random().toString(36).slice(2)}`;
		}
		localStorage.setItem(VISITOR_KEY, id);
	}
	return id;
}

const state = new Map<string, LikeState>();
const listeners = new Map<string, Set<(s: LikeState) => void>>();
const loaded = new Set<string>();
const loading = new Set<string>();

function emit(id: string): void {
	const s = state.get(id);
	if (!s) return;
	listeners.get(id)?.forEach((cb) => cb(s));
}

// Subscribes a component to a post's like state. The shared state map keeps
// buttons of the same post (e.g. header + footer) in sync.
export function subscribeLike(
	id: string,
	cb: (s: LikeState) => void,
): () => void {
	if (!listeners.has(id)) listeners.set(id, new Set());
	listeners.get(id)!.add(cb);

	if (state.has(id)) {
		cb(state.get(id)!);
	} else if (!loaded.has(id) && !loading.has(id)) {
		loading.add(id);
		loadLikes([id])
			.then((map) => {
				const s = map.get(id);
				if (s) {
					state.set(id, s);
					emit(id);
				}
			})
			.catch(() => {
				// keep the default (0, false) state on failure
			})
			.finally(() => {
				loaded.add(id);
				loading.delete(id);
			});
	}

	return () => {
		listeners.get(id)?.delete(cb);
	};
}

// Batched count fetch for list pages. Returns a Map of post id -> state.
export async function loadLikes(ids: string[]): Promise<Map<string, LikeState>> {
	const unique = [...new Set(ids)].filter(Boolean);
	const result = new Map<string, LikeState>();
	if (unique.length === 0) return result;

	const url = new URL(`${API_BASE}/api/likes`);
	url.searchParams.set("ids", unique.join(","));

	const res = await fetch(url, {
		cache: "no-store",
		headers: { "X-Visitor-Id": getVisitorId() },
	});
	if (!res.ok) {
		throw new Error(`Failed to load likes: ${res.status}`);
	}
	const json = (await res.json()) as { data?: Record<string, LikeState> };
	for (const [id, likeState] of Object.entries(json.data ?? {})) {
		result.set(id, likeState);
	}
	return result;
}

// Optimistic toggle. Publishes changes to any subscribed like button and
// reverts if the worker request fails.
export async function toggleLike(id: string): Promise<LikeState> {
	const prev = state.get(id) ?? { likes: 0, liked: false };
	const optimistic: LikeState = {
		likes: Math.max(prev.likes + (prev.liked ? -1 : 1), 0),
		liked: !prev.liked,
	};
	state.set(id, optimistic);
	emit(id);

	try {
		const res = await fetch(
			`${API_BASE}/api/likes/${encodeURIComponent(id)}`,
			{
				method: "POST",
				headers: { "X-Visitor-Id": getVisitorId() },
			},
		);
		if (!res.ok) throw new Error(`Like request failed: ${res.status}`);

		const json = (await res.json()) as { liked: boolean; likes: number };
		const next: LikeState = { liked: json.liked, likes: json.likes };
		state.set(id, next);
		emit(id);
		return next;
	} catch (err) {
		state.set(id, prev);
		emit(id);
		throw err;
	}
}

export function formatLikes(n: number): string {
	if (n >= 1000) {
		return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
	}
	return String(n);
}