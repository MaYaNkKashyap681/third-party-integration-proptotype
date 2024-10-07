# Third Party Services Integration System

This project allows users to connect and integrate with third-party services such as Todoist and Notion. The system supports both OAuth and API key-based integrations and uses PostgreSQL for storing user data and tokens.

## Prerequisites

Make sure you have the following tools installed before you begin:

- **Node.js** (v14 or higher)
- **Docker** and **Docker Compose**
- **npm** (Node Package Manager)

---

## Installation

Follow these steps to set up the project locally.

1. **Clone the repository:**

   First, clone the repository to your local machine and navigate to the project folder.

   ```bash
   git clone <your-repository-url>
   cd <your-repository-folder>```

2). Install the npm packages
    ```bash
    npm install
    ```

3). Start the Docker containers
Use Docker Compose to start the PostgreSQL database and any other services in the background.
```bash
docker-compose up -d
```

4). Running PostgreSQL
PostgreSQL is used as the main database to store user information, including OAuth tokens. Follow the steps below to interact with the PostgreSQL instance.

Accessing PostgreSQL Container
After starting the Docker containers, you can enter the PostgreSQL container to interact with the database directly.

Run the following command to enter the PostgreSQL instance:
```bash
docker exec -it postgres_instance_tps psql -U mayank -d tps
```

5). This will start an interactive psql session where you can execute SQL commands directly within the database.

Inserting Dummy Data
To test the system, you can manually insert some dummy user data into the database. Run the following SQL query inside the psql session:

```bash
INSERT INTO "User" (id, email, "todoistToken", "todoistTokenExpires", "notionToken", "notionTokenExpires", "createdAt", "updatedAt") 
VALUES
(1, 'mayank@example.com', NULL, NULL, NULL, NULL, NOW(), NOW()),
(2, 'testuser@example.com', NULL, NULL, NULL, NULL, NOW(), NOW());
```

This will insert two dummy users into the User table for testing purposes.

6). Run the application.

```bash
npm run dev
```
