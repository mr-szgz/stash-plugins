# OpenAI Official Endpoint Spec Notes

Saved: 2026-03-31

This file is a compact research note derived from the official OpenAI API reference pages linked below. It is intended as a local compatibility reference for LM Studio work.

## Responses API

- URL: `https://platform.openai.com/docs/api-reference/responses`
- Primary create endpoint: `POST /v1/responses`
- Official positioning:
  - create a model response from text or image input
  - tools can be part of the request
  - streaming is supported
  - response objects expose output items, usage, reasoning metadata, and prior-response linkage

## Chat Completions API

- URL: `https://platform.openai.com/docs/api-reference/chat`
- Primary endpoint family: `/chat/completions`
- Official positioning:
  - request is structured around a list of messages
  - result returns one or more choices
  - tool calls and streaming are part of the official surface

## Embeddings API

- URL: `https://platform.openai.com/docs/api-reference/embeddings`
- Primary create endpoint: `POST /v1/embeddings`
- Official positioning:
  - returns vector embeddings for input text
  - response includes embedding vectors and usage token counts

## Models API

- URL: `https://platform.openai.com/docs/api-reference/models/list`
- Primary list endpoint: `GET /v1/models`
- Official positioning:
  - lists currently available models
  - returned items include model identifier, created time, object type, and owner metadata

## Compatibility reading rule for LM Studio

- When an LM Studio page links to an official OpenAI reference page, treat the OpenAI page as the upstream request/response semantic reference.
- Then treat the LM Studio page as the local compatibility and behavior note for what LM Studio implements, extends, or omits.
