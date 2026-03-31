---
url: https://lmstudio.ai/docs/developer/openai-compat
title: OpenAI Compatibility Endpoints | LM Studio Docs
description: Send requests to Responses, Chat Completions (text and images), Completions, and Embeddings endpoints.
access_date: 2026-03-31T17:49:48.000Z
current_date: 2026-03-31T17:49:48.561Z
---

Documentation

![lmstudio icon](IMAGE) 

App

![developer logo](IMAGE) 

Developer DocsLM Linklmstudio-jslmstudio-pythonCLIIntegrations

Introduction

API Changelog

Core

Authentication

`llmster` \- Headless Mode

Linux Startup Task

Using with LM Link

Using MCP via API

Idle TTL and Auto-Evict

Local Server

LM Studio REST API

Overview

Quickstart

Stateful Chats

Streaming events

Chat with a model

POST

List your models

GET

Load a model

POST

Download a model

POST

Unload a model

POST

Get download status

GET

REST API v0

OpenAI Compatible Endpoints

Overview

Structured Output

Tools and Function Calling

List Models

GET

Responses

POST

Chat Completions

POST

Embeddings

POST

Completions (Legacy)

POST

Anthropic Compatible Endpoints

Overview

Messages

POST

# OpenAI Compatibility Endpoints

Copy

Send requests to Responses, Chat Completions (text and images), Completions, and Embeddings endpoints.

### Supported endpoints

| Endpoint             | Method | Docs             |
| -------------------- | ------ | ---------------- |
| /v1/models           | GET    | Models           |
| /v1/responses        | POST   | Responses        |
| /v1/chat/completions | POST   | Chat Completions |
| /v1/embeddings       | POST   | Embeddings       |
| /v1/completions      | POST   | Completions      |

---

## Set the `base url` to point to LM Studio

You can reuse existing OpenAI clients (in Python, JS, C#, etc) by switching up the "base URL" property to point to your LM Studio instead of OpenAI's servers.

Note: The following examples assume the server port is `1234`

### Python Example

```
from openai import OpenAI

client = OpenAI(
+    base_url="http://localhost:1234/v1"
)

# ... the rest of your code ...

```

### Typescript Example

```
import OpenAI from 'openai';

const client = new OpenAI({
+  baseUrl: "http://localhost:1234/v1"
});

// ... the rest of your code ...

```

### cURL Example

```
- curl https://api.openai.com/v1/chat/completions \
+ curl http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
-     "model": "gpt-4o-mini",
+     "model": "use the model identifier from LM Studio here",
     "messages": [{"role": "user", "content": "Say this is a test!"}],
     "temperature": 0.7
   }'

```

## Using Codex with LM Studio

Codex is supported because LM Studio implements the OpenAI-compatible `POST /v1/responses` endpoint.

See: Use Codex with LM Studio and Responses.

---

Other OpenAI client libraries should have similar options to set the base URL.

If you're running into trouble, hop onto our Discord and enter the `#🔨-developers` channel.

This page's source is available on GitHub
