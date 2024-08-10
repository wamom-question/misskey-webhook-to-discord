declare const KV: KVNamespace;

const kvs = {
	misskeyWebhookSecret: null,
	lang: null,
	overrideWebhookUser: null,
}

type KVS = {
	[key in keyof typeof kvs]: string | null
}

export async function getKV() {
	const cache = await KV.get('internal-kv-cache')

	if (cache) {
		return Object.assign({}, kvs, JSON.parse(decodeURIComponent(atob(cache)))) as KVS
	}

	const newKvs = Object.assign({}, kvs) as KVS
	for (const key in kvs) {
		newKvs[key as keyof KVS] = await KV.get(key)
	}

	await KV.put('internal-kv-cache', btoa(encodeURIComponent(JSON.stringify(newKvs))), { expirationTtl: 60 * 60 * 24 * 7 })
	return newKvs
}
