# Express File Uploader 🚀

A simple file upload app built with **Express.js** and **Cloudinary** for cloud storage. Users can upload and manage files securely with user authentication via **Passport.js**.

## Features 🌟

- Upload, rename and delete files with Cloudinary storage.
- Create, rename and delete folders with Cloudinary storage.
- User authentication using Passport.js and **bcrypt** for secure password hashing.
- Built using **Prisma** as the ORM.

## Technologies Used 🛠️

- **Express.js** for the server.
- **Passport.js** for user authentication.
- **Cloudinary** for file storage.
- **PostgreSQL** database.
- **Prisma** for database management.
- **bcrypt** for password hashing.
- **dotenv** for managing environment variables.

## Setup Instructions 📝

1.  Clone the repository:

    ```bash
    git clone https://github.com/dobrqka/file-uploader.git

    ```

2.  Install dependencies:

    ```bash
    cd file-uploader
    npm install
    ```

3.  Rename .env-template to .env and fill in your Cloudinary credentials:

    ```bash
    DATABASE_URL="your-postgresql-db-url"
    SECRET="your-random-safe-secret-string" # for passport.js authentication
    CLOUDINARY_CLOUD_NAME="your-cloud-name"
    CLOUDINARY_API_KEY="your-api-key"
    CLOUDINARY_API_SECRET="your-api-secret"

    ```

4.  Configure Prisma Client

    ```bash
    npx prisma generate
    npx prisma migrate dev

    ```

5.  Run the app

    ```bash
    npm start

    ```

6.  Open your browser and visit http://localhost:8000.
