# DSH Notification Sounds

面向 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web GUI 的跨平台双音效通知插件。

- 请求审批、计划审核或等待回答 `ask_user_question` 时，播放“任务等待”。
- 正在运行的会话结束并进入空闲时，播放“任务完成”。
- 两个 WAV 直接打包进浏览器插件，不依赖系统播放命令。
- 支持 Windows、macOS 和 Linux。

## 安装

```powershell
dsh plugin --profile web add dsh-notification-sounds
```

本地目录安装：

```powershell
dsh plugin --profile web add D:\git\dsh-notification-sounds
```

安装后重启 `dsh web`，设置位于 **Settings → General → DSH Notification Sounds**。

## 播放规则

| 场景 | 声音 |
|---|---|
| 权限审批、计划审核、普通提问 | 任务等待 |
| 会话从运行变为空闲，且没有待处理交互 | 任务完成 |

首次加载不播放；重复状态和断线重连会去重；等待提示优先于完成提示。

## 自动播放限制

浏览器可能在首次用户操作前禁止声音。插件会在第一次点击或按键时解锁，并补播最近一次被阻止的提醒。

## 开发

```powershell
pnpm install
pnpm run check
```

原始 WAV 位于 `src/audio/`，构建时自动嵌入客户端包。

## 许可证

MIT
