import { Hono } from 'hono'
import { getLang } from './i18n'
import { getKV } from './kv'
import { WebhookGenerator, EmbedGenerator, ComponentGenerator } from './discord'
import { error, misskeyApi, getUserText, getUsername } from './utils'
import type { MetaLite, User } from 'misskey-js/entities.js'
import type { MisskeyWebhookPayload } from './types'

type Bindings = {
	KV: KVNamespace;
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', r => r.redirect('https://github.com/hideki0403/misskey-webhook-to-discord/'))
app.post('/api/webhooks/:id/:token', async r => {
	const secret = r.req.header('X-Misskey-Hook-Secret')
	const kv = await getKV(r.env.KV)

	const misskeyWebhookSecret = kv.misskeyWebhookSecret
	if (misskeyWebhookSecret != null && secret !== misskeyWebhookSecret) {
		return r.json(error('Invalid secret'), 401)
	}

	const channelId = r.req.param('id')
	if (!channelId) return r.json(error('ChannelID is required'), 400)

	const token = r.req.param('token')
	if (!token) return r.json(error('Token is required'), 400)

	const i18n = getLang(kv.lang)

	const payload = await r.req.json<MisskeyWebhookPayload>()
	const webhook = new WebhookGenerator()
	const embed = new EmbedGenerator().setTitle(i18n.unknown)
	const component = new ComponentGenerator()

	switch (payload.type) {
		case 'note': {
			embed.setColor(0x007aff)
			embed.setTitle(i18n.note)
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'reply': {
			embed.setColor(0x007aff)
			embed.setTitle(i18n.reply)
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'renote': {
			embed.setColor(0x36d298)
			embed.setTitle(i18n.renote)
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'mention': {
			embed.setColor(0x88a6b7)
			embed.setTitle(i18n.mention)
			embed.setDescription(payload.body.note.text)
			embed.setMisskeyUser(payload.body.note.user)
			break
		}

		case 'unfollow': {
			embed.setColor(0xcb9a11)
			embed.setTitle(i18n.unfollowed)
			embed.setDescription(i18n.unfollowedDescription(getUsername(payload.server, payload.body.user)))
			embed.setMisskeyUser(payload.body.user)
			break
		}

		case 'follow': {
			embed.setColor(0x36aed2)
			embed.setTitle(i18n.follow)
			embed.setDescription(i18n.followDescription(getUsername(payload.server, payload.body.user)))
			embed.setMisskeyUser(payload.body.user)
			break
		}

		case 'followed': {
			embed.setColor(0x36aed2)
			embed.setTitle(i18n.followed)
			embed.setDescription(i18n.followedDescription(getUsername(payload.server, payload.body.user)))
			embed.setMisskeyUser(payload.body.user)
			break
		}

		case 'reaction': {
			embed.setColor(0x36d298)
			embed.setTitle(i18n.reaction)
			embed.setDescription(i18n.reactionDescription)
			break
		}

		case 'abuseReport':
		case 'abuseReportResolved': {
			const reporter = await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.reporterId })
			const reportedUser = await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.targetUserId })
			const assignee = payload.body.assigneeId ? await misskeyApi<User>(payload.server, 'users/show', { userId: payload.body.assigneeId }) : null

			if (payload.type === 'abuseReport') {
				embed.setColor(0xdd2e44)
				embed.setTitle(i18n.createdAbuseReport)
				embed.setDescription(`${i18n.createdAbuseReportDescription(getUsername(payload.server, reporter))}\n[${i18n.viewAbuseReport}](${payload.server}/admin/abuses)`)
				// component.addLinkButton(i18n.viewAbuseReport, `${payload.server}/admin/abuses`)
				// https://discord.com/developers/docs/resources/webhook#execute-webhook
				// > Requires an application-owned webhook.
			} else {
				embed.setColor(0x36d298)
				embed.setTitle(i18n.resolvedAbuseReport)
				embed.setDescription(i18n.resolvedAbuseReportDescription(assignee ? getUsername(payload.server, assignee) : '???'))
			}

			embed.addField(i18n.comment, payload.body.comment, false)
			embed.addField(i18n.reporter, getUserText(payload.server, reporter), true)
			embed.addField(i18n.reportedUser, getUserText(payload.server, reportedUser), true)

			if (assignee) embed.addField(i18n.assignee, getUserText(payload.server, assignee), true)
			if (reportedUser.avatarUrl) embed.setThumbnail(reportedUser.avatarUrl)

			break
		}

		case 'userCreated': {
			embed.setColor(0xcb9a11)
			embed.setTitle(i18n.userCreated)
			embed.setDescription(i18n.userCreatedDescription(getUsername(payload.server, payload.body)))
			break
		}
	}

	const instance = await misskeyApi<MetaLite>(payload.server, 'meta')

	embed.setTimestamp(new Date(payload.createdAt))
	embed.setFooter({
		text: `${instance.shortName ?? instance.name ?? 'Misskey'} (${instance.uri.replace(/^https?:\/\//, '')})`,
		icon_url: instance.iconUrl ?? undefined
	})

	webhook.addEmbed(embed)
	webhook.addComponent(component)

	if (kv.overrideWebhookUser) {
		if ('userId' in payload) {
			const user = await misskeyApi<User>(payload.server, 'users/show', { userId: payload.userId })
			webhook.setUsername(user.name ?? user.username)
			if (user.avatarUrl) webhook.setAvatarUrl(user.avatarUrl)
		} else {
			webhook.setUsername(instance.shortName ?? instance.name ?? 'Misskey')
			if (instance.iconUrl) webhook.setAvatarUrl(instance.iconUrl)
		}
	}

	try {
		await webhook.send(channelId, token)
	} catch (e) {
		console.error(e)
		return r.json(error('Failed to send webhook. Please check the channel ID and secret.'), 500)
	}

	return r.json({
		status: 'ok',
	})
})

app.post('/api/purge-cache/:key', async r => {
	const secret = r.req.header('X-Secret')
	const webhookSecret = (await getKV(r.env.KV)).misskeyWebhookSecret
	if (webhookSecret != null && secret !== webhookSecret) {
		return r.json(error('Invalid secret'), 401)
	}

	const cache = caches.default
	const result = await cache.delete(decodeURIComponent(atob(r.req.param('key'))))

	return r.json({
		status: 'ok',
		purged: result
	})
})

export default app
