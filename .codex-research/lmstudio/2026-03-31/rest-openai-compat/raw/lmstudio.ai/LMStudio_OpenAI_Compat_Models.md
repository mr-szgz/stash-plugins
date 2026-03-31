---
url: https://lmstudio.ai/docs/developer/openai-compat/models
title: List Models | LM Studio Docs
description: List available models via the OpenAI-compatible endpoint.
access_date: 2026-03-31T17:49:49.000Z
current_date: 2026-03-31T17:49:50.137Z
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

# List Models

Copy

List available models via the OpenAI-compatible endpoint.

* Method: `GET`
* Returns the models visible to the server. The list may include all downloaded models when Just‑In‑Time loading is enabled.

##### cURL

```
curl http://localhost:1234/v1/models

```

This page's source is available on GitHub
