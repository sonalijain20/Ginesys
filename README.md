# Dog Gallery

Dog Gallery is a node.js project which lets user upload/update/fetch and delete the dog images.

## Installation

Clone the repository 
```bash
https://github.com/sonalijain20/Ginesys.git
```
Install npm packages 
```bash
npm install
```
Set up .env file
```bash
JWT_SECRET=
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=
```

## Routes
### User Routes

| Method | Endpoint         | Description           | Request Body / Params              | Auth Required |
|--------|------------------|------------------------|-------------------------------------|----------------|
| POST   | `api/auth/register`     | Register new user      | `{ "username": "sonalijain", "password": 123456 }` | ❌              |
| POST   | `/api/auth/login`     | Login and get token    | `{ "username": "sonalijain", "password": "123456" }`                | ❌              |

### Dog Image Routes

| Method | Endpoint         | Description           | Request Body / Params              | Auth Required |
|--------|------------------|------------------------|-------------------------------------|----------------|
| POST   | `api/dogs`     | Uploads the dog image    | `image: File` |         ✅       |
| PUT   | `api/dogs/:id`     | Updates the dog image    | `image: File` |         ✅       |
| GET   | `api/dogs`     | List the dog image    | `?page=1&limit=20` |         ✅       |
| GET   | `api/dogs/:id`     | Fetch the dog image by id    |  |         ✅       |
| DELETE   | `api/dogs/:id`     | Delete the dog image by id    |  |         ✅       |




