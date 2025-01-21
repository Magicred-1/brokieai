<a href="https://livekit.io/">
  <img src="./.github/assets/livekit-mark.png" alt="LiveKit logo" width="100" height="100">
</a>

# Python Outbound Call Agent

<p>
  <a href="https://docs.livekit.io/agents/overview/">LiveKit Agents Docs</a>
  •
  <a href="https://livekit.io/cloud">LiveKit Cloud</a>
  •
  <a href="https://blog.livekit.io/">Blog</a>
</p>

This example demonstrates an full workflow of an AI agent that makes outbound calls. It uses LiveKit SIP and Python [Agents Framework](https://github.com/livekit/agents).

It has two modes:

- **VoicePipelineAgent**: uses a voice pipeline of STT, LLM, and TTS for the call.
- **MultimodalAgent**: uses OpenAI's realtime speech to speech model.

The guide for this example is available at https://docs.livekit.io/agents/quickstarts/outbound-calls/. Make sure a SIP outbound trunk is configured before trying this example.

## Features

This example demonstrates the following features:

- Making outbound calls
- Detecting voicemail
- Looking up availability via function calling
- Detecting intent to end the call

## Dev Setup

Clone the repository and install dependencies to a virtual environment:
