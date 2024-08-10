const en_us = {
	unknown: 'Unknown',
	note: 'Note posted',
	reply: 'Reply received',
	renote: 'Renoted',
	mention: 'Mentioned',
	unfollowed: 'Unfollowed',
	unfollowedDescription: (username: string) => `Unfollowed ${username}`,
	follow: 'Following',
	followDescription: (username: string) => `Following ${username}`,
	followed: 'Followed',
	followedDescription: (username: string) => `Followed ${username}`,
	reaction: 'Reaction',
	reactionDescription: 'Reaction',
	createdAbuseReport: 'Created abuse report',
	createdAbuseReportDescription: (username: string) => `Created abuse report by ${username}`,
	view: 'View',
	resolvedAbuseReport: 'Resolved abuse report',
	resolvedAbuseReportDescription: (username: string) => `Resolved abuse report by ${username}`,
	comment: 'Comment',
	reporter: 'Reporter',
	reportedUser: 'Reported user',
	assignee: 'Assignee',
	userCreated: 'User created',
	userCreatedDescription: (username: string) => `User created: ${username}`,
}

type BaseLang = typeof en_us

const ja_jp = {
	unknown: '不明',
	note: 'ノートを投稿しました',
	reply: '返信されました',
	renote: 'Renoteされました',
	mention: 'メンションされました',
	unfollowed: 'フォローを解除しました',
	unfollowedDescription: (username: string) => `${username}のフォローを解除しました`,
	follow: 'フォローしました',
	followDescription: (username: string) => `${username}をフォローしました`,
	followed: 'フォローされました',
	followedDescription: (username: string) => `${username}にフォローされました`,
	reaction: 'リアクションされました',
	reactionDescription: 'リアクションされました',
	createdAbuseReport: '通報があります',
	createdAbuseReportDescription: (username: string) => `${username}から通報があります`,
	view: '表示',
	resolvedAbuseReport: '通報が解決されました',
	resolvedAbuseReportDescription: (username: string) => `${username}によって通報が解決されました`,
	comment: 'コメント',
	reporter: '通報者',
	reportedUser: '通報されたユーザー',
	assignee: 'モデレーター',
	userCreated: 'ユーザーが作成されました',
	userCreatedDescription: (username: string) => `ユーザーが作成されました: ${username}`,
} satisfies BaseLang

const availableLangs = {
	en_us,
	ja_jp,
}

type AvailableLangs = keyof typeof availableLangs

export function getLang(language: AvailableLangs | null | string): BaseLang {
	return (language != null && language in availableLangs) ? availableLangs[language as AvailableLangs] : availableLangs.en_us
}
