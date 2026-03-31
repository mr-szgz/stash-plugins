# LM Studio 0.4.x REST and OpenAI-Compatible Research

Saved: 2026-03-31

## Version status

- LM Studio has an official `0.4.8 Build 1` changelog entry dated `2026-03-26`.
- The changelog explicitly calls out OpenAI-compatible `v1/chat/completions` work and a new reasoning field in the `/api/v1/models` API response.

## LM Studio native REST API

- Native REST base path: `/api/v1/*`
- Official overview: `https://lmstudio.ai/docs/developer/rest`
- Core native endpoints documented in the current official docs:
  - `POST /api/v1/chat`
  - `GET /api/v1/models`
  - `POST /api/v1/models/load`
  - `POST /api/v1/models/unload`
  - `POST /api/v1/models/download`
  - `GET /api/v1/models/download/status`

## LM Studio OpenAI-compatible endpoints

- Compatibility overview: `https://lmstudio.ai/docs/developer/openai-compat`
- LM Studio says you can point existing OpenAI clients at LM Studio by changing the base URL to your local LM Studio server.
- Officially documented supported OpenAI-compatible endpoints:
  - `GET /v1/models`
  - `POST /v1/responses`
  - `POST /v1/chat/completions`
  - `POST /v1/embeddings`
  - `POST /v1/completions`

## Mapping to official OpenAI reference pages

### Responses

- LM Studio page: `https://lmstudio.ai/docs/developer/openai-compat/responses`
- OpenAI page: `https://platform.openai.com/docs/api-reference/responses`
- LM Studio positioning:
  - streaming supported
  - prior response state supported via `previous_response_id`
  - optional remote MCP tooling support
- OpenAI reference positioning:
  - canonical endpoint is `POST https://api.openai.com/v1/responses`
  - used to create a model response from text or image inputs
  - supports tools and structured outputs in the official OpenAI API model

### Chat Completions

- LM Studio page: `https://lmstudio.ai/docs/developer/openai-compat/chat-completions`
- OpenAI page: `https://platform.openai.com/docs/api-reference/chat`
- LM Studio positioning:
  - chat history in, assistant response out
  - prompt template applied automatically for chat-tuned models
  - inference parameters like `temperature` and `top_p` are passed in payload
- OpenAI reference positioning:
  - canonical chat-completions surface is `/chat/completions`
  - request is built around a conversation message list

### Embeddings

- LM Studio page: `https://lmstudio.ai/docs/developer/openai-compat/embeddings`
- OpenAI page: `https://platform.openai.com/docs/api-reference/embeddings`
- LM Studio positioning:
  - embedding vectors from input text
- OpenAI reference positioning:
  - canonical endpoint is `POST /v1/embeddings`
  - returns embedding vectors plus usage information

### Model listing

- LM Studio page: `https://lmstudio.ai/docs/developer/openai-compat/models`
- OpenAI page: `https://platform.openai.com/docs/api-reference/models/list`
- LM Studio positioning:
  - returns models visible to the LM Studio server
  - may include all downloaded models when Just-In-Time loading is enabled
- OpenAI reference positioning:
  - canonical endpoint is `GET /v1/models`
  - returns a list of model objects with identifiers and ownership metadata

## Practical default for this workspace

- User-provided live LM Studio server: `http://100.115.134.27:1234`
- OpenAI-compatible base URL for that server: `http://100.115.134.27:1234/v1`
- Native REST base URL for that server: `http://100.115.134.27:1234/api/v1`

## Saved artifacts in this folder

- `raw/lmstudio.ai/LMStudio_REST_API_Overview.md`
- `raw/lmstudio.ai/LMStudio_OpenAI_Compat_Overview.md`
- `raw/lmstudio.ai/LMStudio_OpenAI_Compat_Responses.md`
- `raw/lmstudio.ai/LMStudio_OpenAI_Compat_Chat_Completions.md`
- `raw/lmstudio.ai/LMStudio_OpenAI_Compat_Embeddings.md`
- `raw/lmstudio.ai/LMStudio_OpenAI_Compat_Models.md`
- `OPENAI_OFFICIAL_SPEC_NOTES.md`
- `SOURCE_URLS.md`
