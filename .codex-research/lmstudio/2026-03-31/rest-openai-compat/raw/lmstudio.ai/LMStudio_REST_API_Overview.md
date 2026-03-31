---
url: https://lmstudio.ai/docs/developer/rest
title: LM Studio API | LM Studio Docs
description: LM Studio's REST API for local inference and model management
access_date: 2026-03-31T17:49:48.000Z
current_date: 2026-03-31T17:49:48.117Z
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

# LM Studio API

Copy

LM Studio's REST API for local inference and model management

LM Studio offers a powerful REST API with first-class support for local inference and model management. In addition to our native API, we provide OpenAI-compatible endpoints (learn more) and Anthropic-compatible endpoints (learn more).

## What's new

Previously, there was a v0 REST API. With LM Studio 0.4.0, we have officially released our native v1 REST API at `/api/v1/*` endpoints and recommend using it.

The v1 REST API includes enhanced features such as:

* MCP via API
* Stateful chats
* Authentication configuration with API tokens
* Model download, load and unload endpoints

## Supported endpoints

The following endpoints are available in LM Studio's v1 REST API.

| Endpoint                       | Method | Docs            |
| ------------------------------ | ------ | --------------- |
| /api/v1/chat                   | POST   | Chat            |
| /api/v1/models                 | GET    | List Models     |
| /api/v1/models/load            | POST   | Load            |
| /api/v1/models/unload          | POST   | Unload          |
| /api/v1/models/download        | POST   | Download        |
| /api/v1/models/download/status | GET    | Download Status |

## Inference endpoint comparison

The table below compares the features of LM Studio's `/api/v1/chat` endpoint with OpenAI-compatible and Anthropic-compatible inference endpoints.

| Feature                                   | /api/v1/chat | /v1/responses | /v1/chat/completions | /v1/messages |
| ----------------------------------------- | ------------ | ------------- | -------------------- | ------------ |
| Streaming                                 | ✅            | ✅             | ✅                    | ✅            |
| Stateful chat                             | ✅            | ✅             | ❌                    | ❌            |
| Remote MCPs                               | ✅            | ✅             | ❌                    | ❌            |
| MCPs you have in LM Studio                | ✅            | ✅             | ❌                    | ❌            |
| Custom tools                              | ❌            | ✅             | ✅                    | ✅            |
| Include assistant messages in the request | ❌            | ✅             | ✅                    | ✅            |
| Model load streaming events               | ✅            | ❌             | ❌                    | ❌            |
| Prompt processing streaming events        | ✅            | ❌             | ❌                    | ❌            |
| Specify context length in the request     | ✅            | ❌             | ❌                    | ❌            |

---

Please report bugs by opening an issue on Github.

This page's source is available on GitHub
