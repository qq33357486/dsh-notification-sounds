# DSH Notification Sounds

Cross-platform audio notifications for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI.

- Plays **User action required** for approvals, plan reviews, and `ask_user_question`.
- Plays **Task completed** when a running session becomes idle.
- Bundles both WAV files; no OS-specific audio command is used.
- Supports Windows, macOS, and Linux wherever the DSH web UI runs.

[简体中文](README.zh-CN.md)

## Install

```sh
dsh plugin --profile web add dsh-notification-sounds
```

Local checkout:

```sh
dsh plugin --profile web add /path/to/dsh-notification-sounds
```

Restart `dsh web`, then open **Settings → General → DSH Notification Sounds**.

## Rules

| Event | Sound |
|---|---|
| Approval, plan review, or question requested | User action required |
| Running session becomes idle without pending interaction | Task completed |

Initial state never rings. Repeated snapshots and reconnect replays are de-duplicated. Waiting takes priority over completion.

## Browser autoplay

The first pointer or keyboard action unlocks audio. The latest blocked reminder is queued until unlock.

## Development

```sh
pnpm install
pnpm run check
```

Source WAV files live in `src/audio/`; `pnpm run embed-audio` embeds them into the client bundle.

## Release

Push a matching tag such as `v0.1.0` after configuring npm trusted publishing or the `NPM_TOKEN` repository secret.

## License

MIT
