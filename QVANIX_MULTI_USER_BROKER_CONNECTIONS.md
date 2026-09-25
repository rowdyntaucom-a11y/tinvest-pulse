# QVANIX — Multi-user Broker Connection Architecture

Date: 2026-09-25
Status: target architecture; current single-user Render token remains a development bridge.

## Goal

A future QVANIX user registers, creates one or more portfolios and connects their own broker account through the safest supported read-only mechanism.

QVANIX is an analytics product. Broker connectivity exists only to read and normalize financial data. It must never become an execution path.

## Security invariants

1. Broker credentials are never stored in frontend code, cookies readable by JavaScript, localStorage, IndexedDB, logs, analytics events or source control.
2. Prefer OAuth / delegated read-only access when a broker genuinely supports it.
3. When a broker requires an API token, the token is submitted only to a secure backend endpoint over TLS.
4. The backend encrypts the credential at rest with a dedicated key-management boundary.
5. Database rows store encrypted payload + metadata, never a plaintext token.
6. Application services receive decrypted credentials only for the shortest required broker-sync operation.
7. Read-only permission is validated where the broker API exposes scopes/permission metadata.
8. Users can revoke and rotate credentials without deleting their historical normalized portfolio data.
9. Broker responses are normalized before analytics. Calculation code should not need to know which credential or tenant produced the data.
10. No order-create / order-replace / order-cancel client or server route belongs in the product.

## Core entities

### User
- id
- email / auth identity
- status
- created_at
- legal/consent versions

### Portfolio
- id
- user_id
- name
- base_currency
- strategy metadata
- archived_at

### BrokerConnection
- id
- user_id
- broker_adapter
- display_name
- connection_status
- credential_reference
- read_only_verified
- last_successful_sync_at
- last_error_code
- created_at / revoked_at

### BrokerAccount
- id
- broker_connection_id
- external_account_id_hash or protected identifier
- user-visible account name
- account type
- status
- portfolio_id mapping

### CredentialVaultRecord
- id
- broker_connection_id
- encrypted_secret
- encryption_version
- key_reference
- created_at / rotated_at / revoked_at

The frontend must never receive `encrypted_secret` either. It receives only a safe BrokerConnection view.

## API flow

### Create connection
1. authenticated user requests a broker connection;
2. server returns broker-specific instructions and accepted auth mode;
3. credential is posted directly to backend;
4. backend validates the credential against a harmless read-only endpoint;
5. backend checks available permission/scope information;
6. credential is encrypted and persisted;
7. initial sync starts;
8. normalized accounts/positions/operations/history become available to the user's portfolio.

### Runtime sync
1. scheduler or user refresh requests sync;
2. connection ownership is checked;
3. credential is decrypted server-side;
4. broker adapter fetches read-only data;
5. raw response is validated;
6. normalized domain events/snapshots are stored;
7. deterministic analytics consume normalized data;
8. credential is discarded from process memory after the operation.

## Broker-adapter boundary

Each broker adapter may implement only read capabilities required by QVANIX:
- accounts;
- portfolio / positions;
- operations / cash flows;
- instruments / metadata;
- prices / candles;
- dividends / coupons / corporate actions when supported;
- futures/options specification and market data where supported.

The adapter interface must not expose:
- createOrder;
- replaceOrder;
- cancelOrder;
- withdraw;
- transfer;
- margin borrowing actions.

If an SDK contains such methods, QVANIX wraps only the approved read methods.

## Tenant isolation

Every persisted portfolio, account, operation, derived metric and broker connection is owned by a user/tenant.

Server queries must scope by authenticated user before loading a portfolio or connection. Never trust a client-provided portfolio id without ownership verification.

Analytics caches must include tenant + portfolio identity in cache keys.

## Audit

Record security-sensitive events without recording secrets:
- connection created;
- validation succeeded/failed;
- credential rotated;
- connection revoked;
- sync started/completed/failed;
- permission mismatch.

Audit logs must not contain tokens or full broker payloads with secrets.

## Current migration path

The existing Render `TINvest_API_TOKEN` remains a single-user development mechanism.

Migration should be:
1. keep current adapter behavior stable;
2. extract broker requests behind a connection-aware adapter interface;
3. add user/portfolio/connection ownership;
4. add encrypted vault;
5. route the current development account through a seeded private connection;
6. remove dependency on one global production token for registered users.

Do not attempt this migration by exposing the current environment token to the browser.
