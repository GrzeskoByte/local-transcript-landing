# Privacy

**Private by architecture, not by promise.** There's no account and no server of ours. Recording, transcription (including live transcription) and storage all run on your computer.

![Privacy table on the website](images/landing-privacy.png)

## What can go online, and when

The app connects to the network **only when you do something that needs it**:

| What | When | Where |
| --- | --- | --- |
| Speech model download | You click **Download** / **Set up transcription** | Hugging Face (`ggerganov/whisper.cpp`) |
| Update check | You click **Check for updates**, or you turned on the launch check | GitHub Releases |
| GitLab sharing | You click **Upload**, **Test connection** or create issues | Your GitLab server |
| Company calendar | You open Calendar, test, detect or approve an event | Your calendar server |
| LLM summary | You click **Summarize**. Ollama stays local; API / Open WebUI / OpenCode / Claude Code send the **transcript text** to that provider. | The endpoint you configured |

**Audio is never uploaded.** Integrations send text only.

## What the app never does

- No analytics, telemetry or crash reports. Not anonymous, not opt-out: none.
- No accounts.
- The built-in whisper.cpp is built without its network features (`WHISPER_CURL=OFF`, `GGML_RPC=OFF`, no server).
- The recording engine (`cpal` + `libopus`) talks only to your OS sound service (WASAPI, CoreAudio, PulseAudio/PipeWire).
- An automated test (`src/privacy.test.ts` in the app repository) fails if the code gains a new way to reach the network.

The OS web view (WebView2 / WebKit) follows your operating system's own diagnostic-data settings.

## Where secrets are stored

GitLab tokens, calendar passwords and LLM API keys are stored only on this device, in the app's local storage.

## The website

The landing page uses cookieless Vercel Web Analytics and reads public release data from GitHub. It stores nothing on your device. See [[Legal Pages]] and [[Analytics and Download Counts]].
