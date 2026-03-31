---
url: https://lmstudio.ai/docs/developer/openai-compat/chat-completions
title: Chat Completions | LM Studio Docs
description: Send a chat history and get the assistant's response.
access_date: 2026-03-31T17:49:49.000Z
current_date: 2026-03-31T17:49:49.280Z
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

# Chat Completions

Copy

Send a chat history and get the assistant's response.

* Method: `POST`
* Prompt template is applied automatically for chat‑tuned models
* Provide inference parameters (temperature, top\_p, etc.) in the payload
* See OpenAI docs: https://platform.openai.com/docs/api-reference/chat
* Tip: keep a terminal open with `lms log stream` to inspect model input

##### Python example

```
from openai import OpenAI
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

completion = client.chat.completions.create(
  model="model-identifier",
  messages=[
    {"role": "system", "content": "Always answer in rhymes."},
    {"role": "user", "content": "Introduce yourself."}
  ],
  temperature=0.7,
)

print(completion.choices[0].message)

```

### Supported payload parameters

See https://platform.openai.com/docs/api-reference/chat/create for parameter semantics.

```
model
top_p
top_k
messages
temperature
max_tokens
stream
stop
presence_penalty
frequency_penalty
logit_bias
repeat_penalty
seed

```

This page's source is available on GitHub
