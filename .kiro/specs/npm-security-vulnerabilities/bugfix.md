# Bugfix Requirements Document

## Introduction

The PersonalLearningPro project has 6 high-severity npm dependency vulnerabilities
identified via `npm audit`. These affect transitive and direct dependencies including
`undici`, `path-to-regexp`, `lodash`, `node-forge`, `fast-xml-parser`, and `picomatch`.
The vulnerabilities expose the application to crashes, request smuggling, prototype
pollution, code injection, certificate forgery, and ReDoS attacks. All 6 have fixes
available via `npm audit fix` (some requiring `--force` for breaking changes).

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a WebSocket message with a 64-bit length field is received by undici (versions 7.0.0 - 7.23.0) THEN the system crashes the client due to integer overflow

1.2 WHEN an HTTP request or response is crafted with smuggling payloads and processed by undici (versions 7.0.0 - 7.23.0) THEN the system allows HTTP Request/Response Smuggling attacks

1.3 WHEN a WebSocket connection uses permessage-deflate compression via undici (versions 7.0.0 - 7.23.0) THEN the system consumes unbounded memory leading to denial of service

1.4 WHEN a CRLF sequence is injected via the undici `upgrade` option (versions 7.0.0 - 7.23.0) THEN the system allows header injection attacks

1.5 WHEN an Express route is defined with multiple parameters and a malicious URL is matched against path-to-regexp (versions <0.1.13) THEN the system enters catastrophic backtracking causing ReDoS and denial of service

1.6 WHEN `_.template` is called with user-controlled input containing malicious import key names via lodash (versions <=4.17.23) THEN the system executes arbitrary code injection

1.7 WHEN `_.unset` or `_.omit` is called with an array path containing `__proto__` via lodash (versions <=4.17.23) THEN the system allows prototype pollution of the global object

1.8 WHEN a certificate chain is validated via node-forge (versions <=1.3.3) THEN the system incorrectly accepts chains that violate RFC 5280, allowing certificate chain bypass

1.9 WHEN an Ed25519 or RSA-PKCS signature is verified via node-forge (versions <=1.3.3) THEN the system accepts forged signatures due to signature verification flaws

1.10 WHEN `BigInteger.modInverse()` is called with certain inputs via node-forge (versions <=1.3.3) THEN the system enters an infinite loop causing denial of service

1.11 WHEN an XML document containing numeric entity expansions is parsed via fast-xml-parser (versions 4.0.0-beta.3 - 5.5.6) THEN the system bypasses all entity expansion limits causing denial of service

1.12 WHEN a glob pattern containing POSIX character classes is matched via picomatch (versions <=2.3.1 or 4.0.0 - 4.0.3) THEN the system produces incorrect matching results due to method injection

1.13 WHEN a glob pattern containing extglob quantifiers is matched via picomatch (versions <=2.3.1 or 4.0.0 - 4.0.3) THEN the system enters catastrophic backtracking causing ReDoS

### Expected Behavior (Correct)

2.1 WHEN a WebSocket message with a 64-bit length field is received by undici THEN the system SHALL handle the length field safely without crashing

2.2 WHEN an HTTP request or response with smuggling payloads is processed by undici THEN the system SHALL reject or sanitize the request, preventing smuggling attacks

2.3 WHEN a WebSocket connection uses permessage-deflate compression via undici THEN the system SHALL enforce memory limits and prevent unbounded consumption

2.4 WHEN a CRLF sequence is present in the undici `upgrade` option THEN the system SHALL sanitize or reject the value, preventing header injection

2.5 WHEN an Express route with multiple parameters is matched against a malicious URL via path-to-regexp THEN the system SHALL complete matching in polynomial time without ReDoS

2.6 WHEN `_.template` is called with user-controlled input via lodash THEN the system SHALL NOT execute injected code from import key names

2.7 WHEN `_.unset` or `_.omit` is called with an array path via lodash THEN the system SHALL NOT allow prototype pollution of the global object

2.8 WHEN a certificate chain is validated via node-forge THEN the system SHALL correctly enforce RFC 5280 rules and reject non-compliant chains

2.9 WHEN an Ed25519 or RSA-PKCS signature is verified via node-forge THEN the system SHALL correctly reject forged signatures

2.10 WHEN `BigInteger.modInverse()` is called via node-forge THEN the system SHALL complete the computation without entering an infinite loop

2.11 WHEN an XML document with numeric entity expansions is parsed via fast-xml-parser THEN the system SHALL enforce entity expansion limits and prevent denial of service

2.12 WHEN a glob pattern with POSIX character classes is matched via picomatch THEN the system SHALL produce correct matching results without method injection

2.13 WHEN a glob pattern with extglob quantifiers is matched via picomatch THEN the system SHALL complete matching in bounded time without ReDoS

### Unchanged Behavior (Regression Prevention)

3.1 WHEN undici makes standard HTTP/HTTPS requests THEN the system SHALL CONTINUE TO send and receive responses correctly

3.2 WHEN undici establishes standard WebSocket connections THEN the system SHALL CONTINUE TO send and receive messages correctly

3.3 WHEN Express routes with valid URL patterns are matched via path-to-regexp THEN the system SHALL CONTINUE TO resolve route parameters correctly

3.4 WHEN lodash utility functions (`_.template`, `_.unset`, `_.omit`, etc.) are called with safe, trusted inputs THEN the system SHALL CONTINUE TO return correct results

3.5 WHEN node-forge validates legitimate certificate chains THEN the system SHALL CONTINUE TO accept valid certificates

3.6 WHEN node-forge verifies valid Ed25519 and RSA-PKCS signatures THEN the system SHALL CONTINUE TO accept them correctly

3.7 WHEN fast-xml-parser parses well-formed XML without excessive entity expansion THEN the system SHALL CONTINUE TO return correct parsed output

3.8 WHEN picomatch matches standard glob patterns without POSIX character classes or extglob quantifiers THEN the system SHALL CONTINUE TO return correct matching results

3.9 WHEN firebase-admin performs its standard operations (auth, firestore, storage) THEN the system SHALL CONTINUE TO function correctly after transitive dependency upgrades

3.10 WHEN the Vite build process runs THEN the system SHALL CONTINUE TO build successfully after dependency upgrades
