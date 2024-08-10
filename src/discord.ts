import type { User as MisskeyUser } from 'misskey-js/entities.js'

export class WebhookGenerator {
	private content?: string
	private username?: string
	private avatarUrl?: string
	private embeds: EmbedGenerator[] = []
	private components: ComponentGenerator[] = []

	setContent(content: string) {
		this.content = content
		return this
	}

	setUsername(username: string) {
		this.username = username
		return this
	}

	setAvatarUrl(avatarUrl: string) {
		this.avatarUrl = avatarUrl
		return this
	}

	addEmbed(embed: EmbedGenerator) {
		this.embeds.push(embed)
		return this
	}

	clearEmbeds() {
		this.embeds = []
		return this
	}

	addComponent(component: ComponentGenerator) {
		this.components.push(component)
		return this
	}

	clearComponents() {
		this.components = []
		return this
	}

	toJSON() {
		return {
			content: this.content,
			username: this.username,
			avatar_url: this.avatarUrl,
			embeds: this.embeds.map(embed => embed.toJSON()),
			components: this.components.map(component => component.toJSON())
		}
	}

	async send(channelId: string, token: string) {
		await fetch(`https://discord.com/api/webhooks/${channelId}/${token}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(this.toJSON())
		})
	}
}

export class EmbedGenerator {
	private title?: string
	private description?: string
	private url?: string
	private timestamp?: Date
	private color?: number
	private footer?: {
		text: string
		icon_url?: string
	}
	private image?: {
		url: string
	}
	private thumbnail?: {
		url: string
	}
	private author?: {
		name: string
		url?: string
		icon_url?: string
	}
	private fields: {
		name: string,
		value: string,
		inline?: boolean
	}[] = []

	setTitle(title: string) {
		this.title = title
		return this
	}

	setDescription(description: string | null) {
		this.description = description ?? undefined
		return this
	}

	setUrl(url: string) {
		this.url = url
		return this
	}

	setTimestamp(timestamp: Date) {
		this.timestamp = timestamp
		return this
	}

	setColor(color: number) {
		this.color = color
		return this
	}

	setFooter(footer: { text: string, icon_url?: string }) {
		this.footer = footer
		return this
	}

	setImage(url: string) {
		this.image = { url }
		return this
	}

	setThumbnail(url: string) {
		this.thumbnail = { url }
		return this
	}

	setAuthor(author: { name: string, url?: string, icon_url?: string }) {
		this.author = author
		return this
	}

	setMisskeyUser(user: MisskeyUser) {
		this.author = {
			name: user.name ?? user.username,
			icon_url: user.avatarUrl ?? undefined
		}
		return this
	}

	addField(name: string, value: string, inline?: boolean) {
		this.fields.push({ name, value, inline })
		return this
	}

	clearFields() {
		this.fields = []
		return this
	}

	toJSON() {
		return {
			title: this.title,
			description: this.description,
			url: this.url,
			timestamp: this.timestamp?.toISOString(),
			color: this.color,
			footer: this.footer,
			image: this.image,
			thumbnail: this.thumbnail,
			author: this.author,
			fields: this.fields.length > 0 ? this.fields : undefined
		}
	}
}

enum ComponentType {
	Button = 2,
}

export enum ButtonStyle {
	Primary = 1,
	Secondary = 2,
	Success = 3,
	Danger = 4,
	Link = 5
}

export class ComponentGenerator {
	private components: any[] = []

	addButton(label: string, style: ButtonStyle) {
		if (this.components.length >= 5) throw new Error('Too many components')
		this.components.push({
			type: ComponentType.Button,
			style,
			label,
			custom_id: Math.random().toString(36).slice(-8)
		})
		return this
	}

	addLinkButton(label: string, url: string) {
		if (this.components.length >= 5) throw new Error('Too many components')
		this.components.push({
			type: ComponentType.Button,
			style: ButtonStyle.Link,
			label,
			url
		})
		return this
	}

	clear() {
		this.components = []
		return this
	}

	toJSON() {
		return {
			type: 1,
			components: this.components
		}
	}
}
