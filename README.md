# misskey-webhook-to-discord
MisskeyのWebhookをDiscordに転送するCfWorker

## セットアップ方法
### KVを作成する
```bash
pnpx wrangler kv:namespace create KV

# ✨ Success!
# Add the following to your configuration file in your kv_namespaces array:
# { binding = "KV", id = "551140f776e14d82ac680e777918eef8" }
```
`wrangler.toml` のkv_namespaces内にあるidを表示されたIDで置き換えます (上記の場合は`551140f776e14d82ac680e777918eef8`)  
```diff
[[kv_namespaces]]
binding = "KV"
-id = "1091c85365ab4b588f595adb5d136f66"
+id = "551140f776e14d82ac680e777918eef8"
```

### シークレットを設定する (任意)
以下の手順に従って操作することで、このWorkerを利用するためのシークレット(パスワード)を設定することができます。  
自分のみが使用できるようにしたい場合はこの設定を行うことを推奨します。  
  
#### 手順
Cloudflareのダッシュボードから、先程作成したKVを編集します。  
- Workers & Pages -> KV -> misskey-webhook-to-discord-KV -> view

以下のキーと値を設定します
- Key: `misskeyWebhookSecret`
- Value: (任意のシークレット)

> [!NOTE]
> ここで設定したシークレットは、MisskeyのWebhookの設定を行う際に必要になります。  
> 必要に応じてシークレットを控えておいてください。

### デプロイをする
```bash
pnpm run deploy

# ...
# Uploaded misskey-webhook-to-discord (1.63 sec)
# Published misskey-webhook-to-discord (3.82 sec)
#   https://misskey-webhook-to-discord.example.workers.dev
# Current Deployment ID: 0d41a885-b906-44e0-b565...
# ...
```
ここで表示されたWorkerのURLは後で使用するため、控えておいてください。  
上記の場合は`https://misskey-webhook-to-discord.example.workers.dev`です

### Misskey側で設定する
- 設定 -> Webhook -> Webhookを作成
- (システムに関するWebhookの場合は) コントロールパネル -> Webhook -> Webhookを作成
  
以下のように設定してください

#### 名前
(任意)  

#### URL
Discordの任意のチャンネルで作成したWebhookURLの`https://discord.com`の部分を、先程控えたWorkerのURLに書き換えたものを入力  
(例: <https://misskey-webhook-to-discord.example.workers.dev/api/webhooks/1234567890123456789/0L_DoZjEduE_3ZI_p5VKjJ56Tq8_uFQQACWneiyCe1YYaCW3GJwxJIJ9FnXN1yUjNfga>)  

> [!TIP]
> 例えばDiscordのWebhookが以下のようなURLで  
> <https://discord.com/api/webhooks/1234567890123456789/0L_DoZjEduE_3ZI_p5VKjJ56Tq8_uFQQACWneiyCe1YYaCW3GJwxJIJ9FnXN1yUjNfga>  
>  
> WorkerのURLが <https://misskey-webhook-to-discord.example.workers.dev> だった場合は、以下のようなURLになります  
> <https://misskey-webhook-to-discord.example.workers.dev/api/webhooks/1234567890123456789/0L_DoZjEduE_3ZI_p5VKjJ56Tq8_uFQQACWneiyCe1YYaCW3GJwxJIJ9FnXN1yUjNfga>

#### シークレット
先程設定したシークレット  
(シークレットを設定していない場合は空欄でOK)

> [!WARNING]
> もしあなたがサーバー管理者で、通報に関するWebhookを転送したいと考えている場合は、**追加で以下の設定を行う必要があります。**  
>   
> - コントロールパネル -> 通報 -> 通知設定 -> 通報の通知先を追加 -> 先程作成したWebhookを選択
>
> この設定を行わないとWebhookが送信されません (1敗)

### おわり
以上で設定は完了です。  
これでMisskeyのWebhookがDiscordに転送されるようになるはずです。

## 追加設定
KVに以下のキーと値を設定することで、オプションの機能を設定できます。  

> [!NOTE]
> 設定変更後はKVの`internal-kv-cache`を削除してください。  
> 削除をしなかった場合は設定が反映されるまで最長で1週間程度かかる場合があります。

### 言語設定
送信されるメッセージの言語を設定します。  
- Key: `lang`
- Value: 
  - English: `en_us`
  - Japanese: `ja_jp`

### Discordのユーザー名/アイコンの自動設定
Misskeyのユーザー(またはサーバー)アイコンをDiscordのユーザー名/アイコンとして使用します。  
この設定はKeyが存在すると有効、存在しないと無効になります。
- Key: `overrideWebhookUser`
- Value: (任意)

## マイグレーション
### v1.0.0 -> v2.0.0
- KVの`discordWebhookUrl`は使用されなくなりました  
  - 必要に応じて削除をお願いします  
- Misskey側のWebhookURLの再設定をお願いします
  - これまでの `https://misskey-webhook-to-discord.example.workers.dev/proxy` の形式では転送できなくなりました
  - ドキュメントの「Misskey側で設定する」を参考に再設定をお願いします
