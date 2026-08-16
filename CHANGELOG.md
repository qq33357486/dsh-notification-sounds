# Changelog

## 0.1.2

- Treat each root session and all of its nested subagents as one task group.
- Suppress completion sounds for individual subagent completions.
- Allow one root task to notify independently while other root sessions keep running.
- Require the entire task group to remain idle without pending user interaction for one second before playing “任务完成”.

## 0.1.1

- Redesign README as a concise Chinese-first productivity landing page.
- Clearly describe the bundled Chinese audio prompts “任务等待” and “任务完成”.
- Add npm installation and AI-assisted setup instructions.

## 0.1.0

- Initial release.
- Bundle Task Waiting and Task Completed WAV notifications.
- Detect approval, plan-review, and question interactions.
- Detect running-to-idle completion edges.
- Add settings, previews, tests, CI, and npm release automation.
