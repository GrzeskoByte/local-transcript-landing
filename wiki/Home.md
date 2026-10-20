# Local Transcriber — Documentation

![Local Transcriber landing page](images/landing-hero.png)

**Local Transcriber** is a free, open-source (MIT) desktop app for macOS, Windows and Linux. It records your meetings, transcribes them **on your own computer** with whisper.cpp or Parakeet, and can summarize them with a local AI. Your audio never leaves your machine. You don't need an account, and nothing goes to the cloud.

This wiki covers two things:

| | Who it's for | Start here |
| --- | --- | --- |
| 📘 **User manual** | Anyone using the desktop app | [[Installation]] → [[Getting Started]] |
| 🌐 **Website guide** | Visitors and maintainers of the landing page ([this repository](https://github.com/GrzeskoByte/local-transcript-landing)) | [[Website Tour]] → [[Website Development]] |

The app's source code lives in [GrzeskoByte/local-transcript](https://github.com/GrzeskoByte/local-transcript). This repository holds only the static download/landing site.

---

## User manual

1. [[Installation]]: download the right installer and install it on macOS, Windows or Linux
2. [[Getting Started]]: first launch, the main window, setting up transcription
3. [[Recording a Meeting]]: recording modes, agenda, pause/stop, crash recovery, importing files
4. [[Transcription]]: speech models, languages, GPU, live transcription
5. [[Meeting Details]]: playback, transcript, summary, agenda, audio check, export, delete
6. [[Meetings List and Search]]: the dashboard, filters, full-text search, rename/delete
7. [[AI Summaries]]: Ollama, OpenAI-compatible APIs, OpenCode
8. [[Calendar Integration]]: CalDAV, Microsoft 365, Exchange; follow-up events
9. [[GitLab Sharing]]: publish transcripts and summaries to a wiki, issue or repository
10. [[Settings]]: a reference for every Settings tab
11. [[Updates]]: in-app updates and the update check
12. [[Keyboard Shortcuts]]
13. [[Privacy]]: exactly what can leave your computer, and when
14. [[Troubleshooting]]
15. [[FAQ]]

## Website guide

- [[Website Tour]]: every section of the landing page, explained with screenshots
- [[Website Development]]: run it locally, how it works, deploy
- [[Releases and Downloads]]: how GitHub Releases feed the download section
- [[Analytics and Download Counts]]
- [[Design System]]: the "catalog-era 1996" visual language (`DESIGN.md`)
- [[Legal Pages]]: privacy policy and legal notice
- [[Contributing to the Wiki]]

---

### The idea in one line

> **Record first. Transcribe when you're ready.** Recording and transcription are separate on purpose. Your audio is saved the moment it's captured, and AI is an optional second step that can never damage the original.
