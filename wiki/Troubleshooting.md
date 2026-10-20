# Troubleshooting

## Installation

| Problem | Fix |
| --- | --- |
| **macOS: "app can't be opened"** | Early builds aren't notarized. Go to **System Settings → Privacy & Security → Open Anyway**, or right-click → **Open**, or run `xattr -dr com.apple.quarantine "/Applications/Local Transcribe.app"`. |
| **Windows SmartScreen warning** | **More info → Run anyway**. Builds aren't code-signed yet. |
| **Linux: app won't start** | Install `webkit2gtk-4.1` (e.g. `sudo apt install libwebkit2gtk-4.1-0`). For an AppImage, check that it's executable (`chmod +x`). |
| **The website shows "Couldn't reach GitHub"** | GitHub is unreachable or rate-limited (60 requests/hour per IP). Use the **Open GitHub Releases** link. See below. |

![Download section when GitHub can't be reached](images/landing-download-offline.png)

## Recording

| Problem | Fix |
| --- | --- |
| **Microphone not allowed** | Allow it in your OS privacy settings (macOS: **System Settings → Privacy & Security → Microphone**). Then use **Grant microphone access** on the New Meeting screen or in Settings → Audio. |
| **"Microphone is clipping (too loud)"** | Lower the input volume in your system sound settings (about 50–70%) and turn off automatic mic gain in Zoom/Teams. Distortion can't be removed afterwards. |
| **Echo in Mic + Device recordings** | Wear headphones, so the mic doesn't pick up your speakers. |
| **Device Audio not available on macOS** | System audio capture needs macOS 14.2+. Use **Speaker** mode or **Import audio file**. |
| **The app crashed while recording** | Reopen it and click **Recover Recording** on the banner. |
| **"Some audio could not be saved to disk"** | Usually the disk is full. Free some space; the meeting keeps what was saved. |

## Transcription

| Problem | Fix |
| --- | --- |
| **"Transcription engine not found"** | Release builds include whisper.cpp. If you built from source, install `voxtype` or a `whisper-cli` build. Recording works without one. |
| **No model in the list** | Download one in **Settings → Models**. Only downloaded models appear. |
| **Model download fails** | Check your internet connection. Models come from Hugging Face. Set `WHISPER_MODEL_DIR` if the default folder isn't writable. |
| **Transcription failed** | The recording is safe. Press **Retry**, or try another model or a fixed language. |
| **Slow transcription** | Use a smaller tier (B/C), or turn on GPU acceleration (see [[Transcription#gpu-acceleration]]). |
| **Wrong language** | Choose the language instead of auto-detect, then Re-transcribe. |

## Integrations

| Problem | Fix |
| --- | --- |
| **LLM: Test connection fails** | For Ollama, check that it's running (`ollama serve`) and the model is pulled. Check the base URL, completions path and API key. |
| **GitLab: 401 / 403** | The token needs the `api` scope and access to the project. Check the instance URL for self-hosted GitLab. |
| **Calendar: can't find the server** | Try **Detect from server**, **Find in Thunderbird** or **Use SOGo address**, or paste the full calendar collection URL. |

## Data

| Problem | Fix |
| --- | --- |
| **"Your meetings list could not be loaded."** | **Start with a fresh database**. The old one is moved to a backup folder, not deleted. Finished meetings are also in `Documents/Local Transcribe/`. |
| **Where are my files?** | `~/Documents/Local Transcribe/<title-id>/`. Use **Settings → App → Local files → Open folder**. |

Still stuck? [Open an issue in the app repository](https://github.com/GrzeskoByte/local-transcript/issues).
