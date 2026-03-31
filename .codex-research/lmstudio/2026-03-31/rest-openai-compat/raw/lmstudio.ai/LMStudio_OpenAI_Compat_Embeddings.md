---
url: https://lmstudio.ai/docs/developer/openai-compat/embeddings
title: Embeddings | LM Studio Docs
description: Generate embedding vectors from input text.
access_date: 2026-03-31T17:49:49.000Z
current_date: 2026-03-31T17:49:49.594Z
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

# Embeddings

Copy

Generate embedding vectors from input text.

* Method: `POST`
* See OpenAI docs: https://platform.openai.com/docs/api-reference/embeddings

##### Python example

```
from openai import OpenAI
client = OpenAI(base_url="http://localhost:1234/v1", api_key="lm-studio")

def get_embedding(text, model="model-identifier"):
   text = text.replace("\n", " ")
   return client.embeddings.create(input=[text], model=model).data[0].embedding

print(get_embedding("Once upon a time, there was a cat."))

```

This page's source is available on GitHub
