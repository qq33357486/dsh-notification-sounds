# DSH Notification Sounds

[中文](#中文说明) · [English](#english)

## 中文说明

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI 的跨平台双音效通知插件。

- 请求审批、计划审核或等待回答 `ask_user_question` 时，播放“任务等待”。
- 正在运行的会话结束并进入空闲时，播放“任务完成”。
- 两个 WAV 已打包进 npm 插件，不需要另外下载或配置音频路径。
- 不依赖 PowerShell、`afplay`、`aplay` 等系统命令，支持 Windows、macOS 和 Linux。

### 直接通过 npm 安装

确保已经安装并可以运行 DSH，然后执行：

```powershell
dsh plugin --profile web add dsh-notification-sounds
```

安装完成后：

1. 关闭正在运行的 `dsh web`。
2. 重新启动 Web GUI：

   ```powershell
   dsh web
   ```

   如果你平时使用指定 Profile，也可以执行：

   ```powershell
   dsh --profile web
   ```

3. 打开 **Settings → General → DSH Notification Sounds**。
4. 打开通知，分别点击两个“试听”按钮，并设置音量与提醒范围。
5. 首次打开页面后点击或按键一次，以解除浏览器自动播放限制。

更新插件：

```powershell
dsh plugin --profile web up dsh-notification-sounds
```

卸载插件：

```powershell
dsh plugin --profile web remove dsh-notification-sounds
```

### 播放规则

| 场景 | 声音 |
|---|---|
| 权限审批、计划审核、普通提问 | 任务等待 |
| 会话从运行变为空闲，且没有待处理交互 | 任务完成 |

首次加载不会播放；重复状态和断线重连会去重；如果同一时刻既有等待提示又有完成提示，优先播放“任务等待”。

### 交给 AI 自动配置

复制下面整段提示词给能够操作终端的 AI：

```text
请为我安装并配置 DSH Notification Sounds 插件。

要求：
1. 先检查 dsh 命令是否可用，并确认当前使用的 Web Profile；默认使用 web Profile。
2. 从 npm 安装或更新插件：dsh-notification-sounds。
3. 使用命令：dsh plugin --profile web add dsh-notification-sounds；如果已经安装，则改用 dsh plugin --profile web up dsh-notification-sounds。
4. 安装后通过 dsh --profile web --dump-config 验证合并配置中存在：
   - id: notification-sounds
   - name: dsh-notification-sounds
5. 不要启动第二个 DSH Web 服务。如果已有 dsh web 正在运行，只告诉我需要重启现有进程；如果没有运行，也只给出启动命令，不要擅自常驻启动。
6. 告诉我重启后进入 Settings → General → DSH Notification Sounds，打开通知并分别试听“任务等待”和“任务完成”。
7. 提醒我首次进入页面后点击或按键一次，以解除浏览器自动播放限制。
8. 最后汇报实际执行的命令、安装版本和验证结果。不要修改 DSH 官方源码。
```

### 从源码开发

```powershell
git clone https://github.com/qq33357486/dsh-notification-sounds.git
cd dsh-notification-sounds
pnpm install
pnpm run check
dsh plugin --profile web add .
```

原始 WAV 位于 `src/audio/`，构建时自动嵌入客户端包。

---

## English

Cross-platform dual-sound notifications for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web UI.

- Plays **User action required** for approvals, plan reviews, and `ask_user_question`.
- Plays **Task completed** when a running session becomes idle.
- Both WAV files are bundled in the npm package; no external audio path is required.
- Uses browser audio instead of OS-specific commands, supporting Windows, macOS, and Linux.

### Install from npm

```sh
dsh plugin --profile web add dsh-notification-sounds
```

Restart the existing DSH web process, then open **Settings → General → DSH Notification Sounds**. Enable notifications, preview both sounds, and choose the volume and completion scope. Click or press a key once after opening the page to satisfy browser autoplay policy.

Update:

```sh
dsh plugin --profile web up dsh-notification-sounds
```

Remove:

```sh
dsh plugin --profile web remove dsh-notification-sounds
```

### Notification rules

| Event | Sound |
|---|---|
| Approval, plan review, or question requested | User action required |
| Running session becomes idle without a pending interaction | Task completed |

Initial state never rings. Repeated snapshots and reconnect replays are de-duplicated. Waiting takes priority over completion.

### AI setup prompt

Copy the following prompt into an AI agent with terminal access:

```text
Install and configure the DSH Notification Sounds plugin for me.

Requirements:
1. Verify that the dsh command is available and identify the Web profile; use the web profile by default.
2. Install dsh-notification-sounds from npm with: dsh plugin --profile web add dsh-notification-sounds. If already installed, use: dsh plugin --profile web up dsh-notification-sounds.
3. Verify with dsh --profile web --dump-config that the composed configuration contains id: notification-sounds and name: dsh-notification-sounds.
4. Do not start a second DSH web server. If one is already running, tell me to restart the existing process. Otherwise only provide the startup command.
5. Tell me to open Settings → General → DSH Notification Sounds, enable notifications, and preview both sounds.
6. Remind me to click or press a key once to unlock browser audio.
7. Report the commands run, installed version, and verification result. Do not modify official DSH source code.
```

### Development

```sh
git clone https://github.com/qq33357486/dsh-notification-sounds.git
cd dsh-notification-sounds
pnpm install
pnpm run check
dsh plugin --profile web add .
```

## License

MIT
