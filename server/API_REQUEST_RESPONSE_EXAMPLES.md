# Perplexity Server API Request and Response Examples

This document contains practical examples for all current REST routes in the server.

Base URL used in examples:

- http://localhost:3000/api

Notes:

- Auth uses cookie-based JWT. Protected routes require a valid token cookie.
- Error payloads may vary slightly by controller path, but examples below reflect current behavior.

## Auth Routes

### 1. Register User

- Method: POST
- Endpoint: /auth/register
- Public: Yes

Request:

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "aryan",
  "email": "aryan@example.com",
  "password": "StrongPass123"
}
```

Success response example:

```json
{
  "message": "user registered successfully"
}
```

Failure response example (email exists):

```json
{
  "message": "email already exists",
  "success": false,
  "error": "email already exists"
}
```

### 2. Verify Email

- Method: GET
- Endpoint: /auth/verify-email?token=<verificationToken>
- Public: Yes

Request:

```http
GET /api/auth/verify-email?token=<verificationToken>
```

Success response example:

- Returns an HTML success page.

Failure response example:

```json
{
  "message": "Invalid token",
  "success": false,
  "error": "user not found"
}
```

### 3. Login

- Method: POST
- Endpoint: /auth/login
- Public: Yes

Request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "aryan@example.com",
  "password": "StrongPass123"
}
```

Success response example:

```json
{
  "message": "logged in successfully",
  "success": true,
  "user": {
    "_id": "680d90f05c6d5319f5cbce18",
    "username": "aryan",
    "email": "aryan@example.com",
    "verified": true
  }
}
```

Failure response example:

```json
{
  "message": "Invalid credentials",
  "success": false,
  "error": "user not found"
}
```

### 4. Get Current User

- Method: GET
- Endpoint: /auth/get-me
- Public: No (requires auth cookie)

Request:

```http
GET /api/auth/get-me
Cookie: token=<jwt>
```

Success response example:

```json
{
  "message": "user found successfully",
  "success": true,
  "user": {
    "_id": "680d90f05c6d5319f5cbce18",
    "username": "aryan",
    "email": "aryan@example.com",
    "verified": true
  }
}
```

Failure response example:

```json
{
  "message": "unauthorized access",
  "success": true,
  "error": "user details not attached in the req"
}
```

### 5. Resend Verification Email

- Method: POST
- Endpoint: /auth/resend-verify-email
- Public: Yes

Request:

```http
POST /api/auth/resend-verify-email
Content-Type: application/json

{
  "email": "aryan@example.com"
}
```

Success response example:

```json
{
  "message": "Verification link sent registered email successfully",
  "success": true
}
```

Failure response example:

```json
{
  "message": "Invalid credentials",
  "success": false,
  "error": "user not found"
}
```

### 6. Logout

- Method: POST
- Endpoint: /auth/logout
- Public: No (requires auth cookie)

Request:

```http
POST /api/auth/logout
Cookie: token=<jwt>
```

Success response example:

```json
{
  "message": "Logged out successfully",
  "success": true
}
```

Failure response example:

```json
{
  "message": "Invalid token",
  "success": false,
  "error": "No token provided"
}
```

### 7. Forgot Password

- Method: POST
- Endpoint: /auth/forgot-password
- Public: Yes

Request:

```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "aryan@example.com"
}
```

Success response example:

```json
{
  "message": "Reset Password link sent to email",
  "success": true
}
```

Failure response example:

```json
{
  "message": "Invalid credentials",
  "success": false,
  "error": "user not found"
}
```

### 8. Update Password

- Method: PATCH
- Endpoint: /auth/update-password?token=<resetToken>
- Public: Yes (token in query)

Request:

```http
PATCH /api/auth/update-password?token=<resetToken>
Content-Type: application/json

{
  "password": "NewStrongPass123"
}
```

Success response example:

- Status: 204 No Content
- Controller currently sends a JSON body with 204, but most clients treat 204 as empty response body.

Failure response example:

```json
{
  "message": "Invalid token",
  "success": false,
  "error": "No token provided"
}
```

## Chat Routes

### 1. Send Message

- Method: POST
- Endpoint: /chats/message
- Public: No (requires auth cookie)

Request:

```http
POST /api/chats/message
Content-Type: application/json
Cookie: token=<jwt>

{
  "message": "What is the weather in Mumbai right now?",
  "chat": "680d9868c9e6bd4dfcc45ae2",
  "uploadedFiles": []
}
```

Success response example:

```json
{
  "chat": {
    "_id": "680d9868c9e6bd4dfcc45ae2",
    "title": "Mumbai Weather",
    "user": "680d90f05c6d5319f5cbce18"
  },
  "aiMessage": {
    "_id": "680d9894c9e6bd4dfcc45ae8",
    "chat": "680d9868c9e6bd4dfcc45ae2",
    "content": "Current weather details...",
    "role": "ai"
  },
  "userMessage": {
    "_id": "680d9879c9e6bd4dfcc45ae6",
    "chat": "680d9868c9e6bd4dfcc45ae2",
    "content": "What is the weather in Mumbai right now?",
    "role": "user"
  },
  "success": true
}
```

Failure response example:

```json
{
  "message": "Internal server error",
  "success": false
}
```

### 2. Get Chats

- Method: GET
- Endpoint: /chats
- Public: No (requires auth cookie)

Request:

```http
GET /api/chats
Cookie: token=<jwt>
```

Success response example:

```json
{
  "message": "chats fetched successfully",
  "success": true,
  "chats": [
    {
      "_id": "680d9868c9e6bd4dfcc45ae2",
      "title": "Mumbai Weather",
      "user": "680d90f05c6d5319f5cbce18"
    }
  ]
}
```

### 3. Get Messages by Chat

- Method: GET
- Endpoint: /chats/:chatId/messages
- Public: No (requires auth cookie)

Request:

```http
GET /api/chats/680d9868c9e6bd4dfcc45ae2/messages
Cookie: token=<jwt>
```

Success response example:

```json
{
  "message": "messages fetched successfully",
  "success": true,
  "messages": [
    {
      "_id": "680d9879c9e6bd4dfcc45ae6",
      "chat": "680d9868c9e6bd4dfcc45ae2",
      "content": "What is the weather in Mumbai right now?",
      "role": "user",
      "files": []
    },
    {
      "_id": "680d9894c9e6bd4dfcc45ae8",
      "chat": "680d9868c9e6bd4dfcc45ae2",
      "content": "Current weather details...",
      "role": "ai",
      "files": []
    }
  ]
}
```

Failure response example:

```json
{
  "message": "Chat not found",
  "success": false,
  "error": "Chat not found"
}
```

### 4. Delete Chat

- Method: DELETE
- Endpoint: /chats/delete/:chatId
- Public: No (requires auth cookie)

Request:

```http
DELETE /api/chats/delete/680d9868c9e6bd4dfcc45ae2
Cookie: token=<jwt>
```

Success response example:

```json
{
  "message": "Chat deleted successfully",
  "success": "true"
}
```

### 5. Upload Files

- Method: POST
- Endpoint: /chats/uploads
- Public: No (requires auth cookie)
- Content-Type: multipart/form-data

Request:

```http
POST /api/chats/uploads
Cookie: token=<jwt>
Content-Type: multipart/form-data

files: <image-or-pdf-file>
files: <another-file>
```

Success response example:

```json
{
  "message": "Files uploaded successfully",
  "success": true,
  "uploadedFiles": [
    {
      "fileId": "680d9b8dc9e6bd4dfcc45b20",
      "name": "architecture.png",
      "url": "https://ik.imagekit.io/.../architecture.png",
      "mimetype": "image/png"
    }
  ]
}
```

Failure response example:

```json
{
  "message": "File upload failed",
  "success": false,
  "error": "File upload failed"
}
```

## Postman Collection

Use this collection for faster route testing:

- [Cohort2.0 Backend Collection](https://www.postman.com/aryanpatel287-9653818/workspace/cohort2-0-backend/collection/47014706-4b0ef594-e434-465c-a382-87d22c11b4a5?action=share&source=copy-link&creator=47014706)
