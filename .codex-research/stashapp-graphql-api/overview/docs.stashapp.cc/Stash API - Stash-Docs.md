---
url: https://docs.stashapp.cc/api/
title: Stash API - Stash-Docs
description: Stash documentation, guides, plugins and support.
access_date: 2026-03-31T17:59:18.000Z
current_date: 2026-03-31T17:59:18.767Z
---

# Stash GraphQL API¶

The Stash GraphQL API facilitates automated operations through a type-based schema that is both introspective and self-documenting.

Stash includes an integrated playground where users can execute queries and retrieve schema structures and documentation via a special introspection query.

Learn more about GraphQL

For further information, visit the official GraphQL site.

## Accessing the GraphQL playground¶

1. Navigate to **Settings** \> **Tools** \> **GraphQL playground**.
2. Click on the left to access the Documentation Explorer.

## Endpoint¶

All HTTP requests should be directed to `<server>:<port>/graphql` (default: `localhost:9999/graphql`).

## Authentication¶

Include the API key generated in Stash in the header of every request. For details on obtaining the API Key, refer to Stash's in-app manual.

`curl -X POST -H "ApiKey: <your_api_key>" -H "Content-Type: application/json" --data '{ "query": "<graphql_query>" }' localhost:9999/graphql
`

Replace `<your_api_key>` with your **API Key** found under **Settings** \> **Security** \> **Authentication**.

Replace `<graphql_query>` with the raw query, which can be formatted using the playground.

### Legacy cookie authentication¶

Info

Was made obsolete in version v0.7\. It is recommended to use the `API Key` method.

For configurations using a username/password, cookies must be used for authentication.

`curl --verbose --cookie-jar cookie.txt --data 'username=stash&password=**' localhost:9999/login
curl --cookie cookie.txt -H "Content-Type: application/json" --data '{ "query": "<graphql_query>" }' localhost:9999/graphql
`

December 17, 2025 November 14, 2024 GitHub
