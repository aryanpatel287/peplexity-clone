# Perplexity Clone API Documentation (Auto-Generated)

> This document contains live, verified request and response examples captured by running the integration test suite.
> Base URL: `http://localhost:3000`
> Generated on: 2026-06-19

---

## Table of Contents

- [POST /api/auth/send-signup-email — Send magic signup link and OTP to user email](#post-apiauthsend-signup-email)
- [POST /api/auth/send-signup-email — Fails validation if email parameter is invalid](#post-apiauthsend-signup-email)
- [POST /api/auth/verify-signup-email — Verify signup OTP and login registered user](#post-apiauthverify-signup-email)
- [POST /api/auth/guest-session — Create a new guest session cookie if none exists](#post-apiauthguest-session)
- [GET /api/auth/get-me — Get logged-in user profile details using authentication token cookie](#get-apiauthget-me)
- [POST /api/auth/claim-guest-chats — Transfer chats created during guest session to logged-in user account](#post-apiauthclaim-guest-chats)
- [POST /api/auth/logout — Blacklist session token and clear authentication cookie](#post-apiauthlogout)
- [GET /api/chats — Fetch all chat histories created by active user/guest](#get-apichats)
- [GET /api/chats/507f1f77bcf86cd799439012/messages — Fetch chat messages for a specific conversation session](#get-apichats507f1f77bcf86cd799439012messages)
- [POST /api/chats/message — Submit user message to generate synchronous AI agent response](#post-apichatsmessage)
- [DELETE /api/chats/delete/507f1f77bcf86cd799439012 — Delete conversation thread and all corresponding messages](#delete-apichatsdelete507f1f77bcf86cd799439012)
- [POST /api/chats/uploads — Upload local files (images or documents) onto storage](#post-apichatsuploads)

---

<a name="post-apiauthsend-signup-email"></a>
## POST /api/auth/send-signup-email

**Description:** Send magic signup link and OTP to user email

**Authentication:** Public

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response Status:** `200`

**Response Body:**
```json
{
  "statusCode": 200,
  "message": "Registration email sent successfully",
  "success": true,
  "error": null
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/send-signup-email \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/send-signup-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
  "email": "john@example.com"
}),
});
const data = await response.json();
console.log(data);
```

---

<a name="post-apiauthsend-signup-email"></a>
## POST /api/auth/send-signup-email

**Description:** Fails validation if email parameter is invalid

**Authentication:** Public

**Request Body:**
```json
{
  "email": "invalid-email"
}
```

**Response Status:** `400`

**Response Body:**
```json
{
  "message": "email must be valid",
  "errors": [
    {
      "field": "email",
      "message": "email must be valid"
    }
  ]
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/send-signup-email \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/send-signup-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
  "email": "invalid-email"
}),
});
const data = await response.json();
console.log(data);
```

---

<a name="post-apiauthverify-signup-email"></a>
## POST /api/auth/verify-signup-email

**Description:** Verify signup OTP and login registered user

**Authentication:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response Status:** `200`

**Response Body:**
```json
{
  "statusCode": 200,
  "message": "Email verified successfully",
  "success": true,
  "error": null,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "createdAt": "2026-06-19T14:13:49.353Z"
  }
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/verify-signup-email \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","otp":"123456"}'
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/verify-signup-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
  "email": "john@example.com",
  "otp": "123456"
}),
});
const data = await response.json();
console.log(data);
```

---

<a name="post-apiauthguest-session"></a>
## POST /api/auth/guest-session

**Description:** Create a new guest session cookie if none exists

**Authentication:** Public

**Response Status:** `201`

**Response Body:**
```json
{
  "message": "guest session created",
  "success": true,
  "guestId": "c2728398-3b9c-49b5-9b93-584912c86452"
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/guest-session
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/guest-session', {
  method: 'POST',
  headers: {
  },
});
const data = await response.json();
console.log(data);
```

---

<a name="get-apiauthget-me"></a>
## GET /api/auth/get-me

**Description:** Get logged-in user profile details using authentication token cookie

**Authentication:** Registered User Session Token (Cookie)

**Response Status:** `200`

**Response Body:**
```json
{
  "message": "user found successfully",
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "john@example.com",
    "username": "john",
    "createdAt": "2026-06-19T14:13:49.369Z",
    "updatedAt": "2026-06-19T14:13:49.369Z"
  }
}
```

### Example Request (cURL)
```bash
curl -X GET http://localhost:3000/api/auth/get-me \
  -H "Cookie: token=<your-jwt-token>"
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/get-me', {
  method: 'GET',
  headers: {
    'Credentials': 'include',
  },
});
const data = await response.json();
console.log(data);
```

---

<a name="post-apiauthclaim-guest-chats"></a>
## POST /api/auth/claim-guest-chats

**Description:** Transfer chats created during guest session to logged-in user account

**Authentication:** Registered User Session Token (Cookie)

**Response Status:** `200`

**Response Body:**
```json
{
  "message": "Guest chats claimed successfully",
  "success": true,
  "claimedCount": 3
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/claim-guest-chats \
  -H "Cookie: token=<your-jwt-token>"
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/claim-guest-chats', {
  method: 'POST',
  headers: {
    'Credentials': 'include',
  },
});
const data = await response.json();
console.log(data);
```

---

<a name="post-apiauthlogout"></a>
## POST /api/auth/logout

**Description:** Blacklist session token and clear authentication cookie

**Authentication:** Registered User Session Token (Cookie)

**Response Status:** `200`

**Response Body:**
```json
{
  "message": "Logged out successfully",
  "success": true
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: token=<your-jwt-token>"
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/auth/logout', {
  method: 'POST',
  headers: {
    'Credentials': 'include',
  },
});
const data = await response.json();
console.log(data);
```

---

<a name="get-apichats"></a>
## GET /api/chats

**Description:** Fetch all chat histories created by active user/guest

**Authentication:** Registered User Session Token (Cookie)

**Response Status:** `200`

**Response Body:**
```json
{
  "message": "chats fetched successfully",
  "success": true,
  "chats": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "title": "What is Perplexity AI?",
      "createdAt": "2026-06-19T14:13:49.389Z"
    }
  ]
}
```

### Example Request (cURL)
```bash
curl -X GET http://localhost:3000/api/chats \
  -H "Cookie: token=<your-jwt-token>"
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/chats', {
  method: 'GET',
  headers: {
    'Credentials': 'include',
  },
});
const data = await response.json();
console.log(data);
```

---

<a name="get-apichats507f1f77bcf86cd799439012messages"></a>
## GET /api/chats/507f1f77bcf86cd799439012/messages

**Description:** Fetch chat messages for a specific conversation session

**Authentication:** Registered User Session Token (Cookie)

**Response Status:** `200`

**Response Body:**
```json
{
  "message": "messages fetched successfully",
  "success": true,
  "messages": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "chat": "507f1f77bcf86cd799439012",
      "role": "user",
      "content": "Hello AI",
      "files": [],
      "createdAt": "2026-06-19T14:13:49.395Z"
    },
    {
      "_id": "507f1f77bcf86cd799439014",
      "chat": "507f1f77bcf86cd799439012",
      "role": "ai",
      "content": "This is a mock AI response from Mistral.",
      "files": [],
      "createdAt": "2026-06-19T14:13:49.395Z"
    }
  ]
}
```

### Example Request (cURL)
```bash
curl -X GET http://localhost:3000/api/chats/507f1f77bcf86cd799439012/messages \
  -H "Cookie: token=<your-jwt-token>"
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/chats/507f1f77bcf86cd799439012/messages', {
  method: 'GET',
  headers: {
    'Credentials': 'include',
  },
});
const data = await response.json();
console.log(data);
```

---

<a name="post-apichatsmessage"></a>
## POST /api/chats/message

**Description:** Submit user message to generate synchronous AI agent response

**Authentication:** Registered User Session Token (Cookie)

**Request Body:**
```json
{
  "message": "Hello AI",
  "chat": null
}
```

**Response Status:** `201`

**Response Body:**
```json
{
  "chat": {
    "_id": "507f1f77bcf86cd799439012",
    "title": "Mock Chat Title"
  },
  "aiMessage": {
    "_id": "507f1f77bcf86cd799439014",
    "chat": "507f1f77bcf86cd799439012",
    "role": "ai",
    "content": "This is a mock AI response from Mistral.",
    "createdAt": "2026-06-19T14:13:49.403Z"
  },
  "userMessage": {
    "_id": "507f1f77bcf86cd799439013",
    "chat": "507f1f77bcf86cd799439012",
    "role": "user",
    "content": "Hello AI",
    "createdAt": "2026-06-19T14:13:49.403Z"
  },
  "success": true
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/chats/message \
  -H "Cookie: token=<your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello AI","chat":null}'
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/chats/message', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Credentials': 'include',
  },
  body: JSON.stringify({
  "message": "Hello AI",
  "chat": null
}),
});
const data = await response.json();
console.log(data);
```

---

<a name="delete-apichatsdelete507f1f77bcf86cd799439012"></a>
## DELETE /api/chats/delete/507f1f77bcf86cd799439012

**Description:** Delete conversation thread and all corresponding messages

**Authentication:** Registered User Session Token (Cookie)

**Response Status:** `200`

**Response Body:**
```json
{
  "message": "Chat deleted successfully",
  "success": "true"
}
```

### Example Request (cURL)
```bash
curl -X DELETE http://localhost:3000/api/chats/delete/507f1f77bcf86cd799439012 \
  -H "Cookie: token=<your-jwt-token>"
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/chats/delete/507f1f77bcf86cd799439012', {
  method: 'DELETE',
  headers: {
    'Credentials': 'include',
  },
});
const data = await response.json();
console.log(data);
```

---

<a name="post-apichatsuploads"></a>
## POST /api/chats/uploads

**Description:** Upload local files (images or documents) onto storage

**Authentication:** Registered User Session Token (Cookie)

**Response Status:** `200`

**Response Body:**
```json
{
  "message": "Files uploaded successfully",
  "success": true,
  "uploadedFiles": [
    {
      "fileId": "mock_file_123",
      "name": "test.jpg",
      "size": 1024,
      "filePath": "/mock_file_123.jpg",
      "url": "https://ik.imagekit.io/mock/test.jpg",
      "mimetype": "image/jpeg"
    }
  ]
}
```

### Example Request (cURL)
```bash
curl -X POST http://localhost:3000/api/chats/uploads \
  -H "Cookie: token=<your-jwt-token>"
```

### Example Request (JavaScript Fetch)
```javascript
const response = await fetch('http://localhost:3000/api/chats/uploads', {
  method: 'POST',
  headers: {
    'Credentials': 'include',
  },
});
const data = await response.json();
console.log(data);
```

---
