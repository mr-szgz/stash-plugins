---
url: https://lmstudio.ai/docs/developer/openai-compat/responses
title: Responses | LM Studio Docs
description: Create responses with support for streaming, reasoning, prior response state, and optional Remote MCP tools.
access_date: 2026-03-31T17:49:48.000Z
current_date: 2026-03-31T17:49:48.987Z
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

# Responses

Copy

Create responses with support for streaming, reasoning, prior response state, and optional Remote MCP tools.

* Method: `POST`
* See OpenAI docs: https://platform.openai.com/docs/api-reference/responses

##### cURL (non‑streaming)

```
curl http://localhost:1234/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "input": "Provide a prime number less than 50",
    "reasoning": { "effort": "low" }
  }'

```

##### Stateful follow‑up

Use the `id` from a previous response as `previous_response_id`.

```
curl http://localhost:1234/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "input": "Multiply it by 2",
    "previous_response_id": "resp_123"
  }'

```

##### Streaming

```
curl http://localhost:1234/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai/gpt-oss-20b",
    "input": "Hello",
    "stream": true
  }'

```

You will receive SSE events such as `response.created`, `response.output_text.delta`, and `response.completed`.

##### Tools and Remote MCP (opt‑in)

Enable Remote MCP in the app (Developer → Settings). Example payload using an MCP server tool:

```
curl http://localhost:1234/v1/responses \
  -H "Content-Type: application/json" \
  -d '{
    "model": "ibm/granite-4-micro",
    "input": "What is the top trending model on hugging face?",
    "tools": [
      {
        "type": "mcp",
        "server_label": "huggingface",
        "server_url": "https://huggingface.co/mcp",
        "allowed_tools": [
          "model_search"
        ]
      }
    ]
  }'

```

This page's source is available on GitHub
