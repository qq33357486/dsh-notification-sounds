<div align="center">

# 🔔 DSH Notification Sounds

### 让 AI 安静工作，让你专注生活；该回来时，声音会叫你。

**专注 · 高效 · 少切屏 · 快速回到任务**

[![npm](https://img.shields.io/npm/v/dsh-notification-sounds?color=cb3837&logo=npm)](https://www.npmjs.com/package/dsh-notification-sounds)
[![CI](https://github.com/qq33357486/dsh-notification-sounds/actions/workflows/ci.yml/badge.svg)](https://github.com/qq33357486/dsh-notification-sounds/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

[中文](#中文) · [English](#english)

</div>

## 中文

AI 工作时，你可以去处理别的事情。

当它需要你，插件会播放中文音频 **“任务等待”**；当它做完，播放 **“任务完成”**。

> 不再反复切回页面确认进度。听到声音，立刻回来，快速接上工作节奏。

| 时机 | 中文音频 |
|---|---|
| 需要审批、确认、计划审核或回答问题 | **任务等待** |
| AI 当前任务完成 | **任务完成** |

### 一键安装

```powershell
dsh plugin --profile web add dsh-notification-sounds
```

重启现有的 DSH Web 进程，然后进入：

`Settings → General → DSH Notification Sounds`

打开通知并试听两个声音。首次进入页面后点击或按键一次，以解锁浏览器音频。

<details>
<summary><strong>让 AI 帮你安装</strong></summary>

复制下面的提示词：

```text
请安装并配置 dsh-notification-sounds：
1. 检查 dsh 是否可用，默认使用 web Profile。
2. 执行 dsh plugin --profile web add dsh-notification-sounds；如果已安装则执行 dsh plugin --profile web up dsh-notification-sounds。
3. 用 dsh --profile web --dump-config 验证存在 id: notification-sounds 和 name: dsh-notification-sounds。
4. 不要启动第二个 Web 服务；提醒我重启现有的 dsh web。
5. 告诉我进入 Settings → General → DSH Notification Sounds，打开通知、试听“任务等待”和“任务完成”，并点击或按键一次解锁音频。
6. 最后汇报安装版本和验证结果，不要修改 DSH 官方源码。
```

</details>

### 更新

```powershell
dsh plugin --profile web up dsh-notification-sounds
```

---

## English

Let AI work in the background without pulling you into constant progress checks.

- **“任务等待”** plays when AI needs your action.
- **“任务完成”** plays when the task is complete.

**Stay focused. Switch less. Return at the right moment.**

### Install

```sh
dsh plugin --profile web add dsh-notification-sounds
```

Restart the existing DSH web process, open **Settings → General → DSH Notification Sounds**, enable notifications, and preview both sounds. Click or press a key once to unlock browser audio.

## License

MIT
