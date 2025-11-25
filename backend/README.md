# Jenga Backend

Jenga backend using Quarkus, the Supersonic Subatomic Java Framework.

## Documentation

Swagger: [URL](http://localhost:8080/swagger)

## Running the application in dev mode

You can run your application in dev mode that enables live coding using:

```shell script
./mvnw quarkus:dev
```

> **_NOTE:_**  Quarkus now ships with a Dev UI, which is available in dev mode only at <http://localhost:8080/q/dev/>.

## Packaging and running the application

The application can be packaged using:

```shell script
./mvnw package
```

It produces the `quarkus-run.jar` file in the `target/quarkus-app/` directory.
Be aware that it’s not an _über-jar_ as the dependencies are copied into the `target/quarkus-app/lib/` directory.

The application is now runnable using `java -jar target/quarkus-app/quarkus-run.jar`.

If you want to build an _über-jar_, execute the following command:

```shell script
./mvnw package -Dquarkus.package.jar.type=uber-jar
```

The application, packaged as an _über-jar_, is now runnable using `java -jar target/*-runner.jar`.

### JWT Keypair Setup

For JWT authentication, a **keypair** (private and public keys) must be generated and stored under the following locations, when not running in dev mode:

* `src/main/resources/privateKey.pem`
* `src/main/resources/publicKey.pem`

You can generate the keypair using the following commands:

```shell script
# Generate the private key
openssl genrsa -out privateKey.pem 2048 

# Generate the public key from the private key
openssl rsa -in privateKey.pem -pubout -out publicKey.pem
```

Ensure that these files are correctly placed in the `src/main/resources` directory before running or packaging the application.

## Creating a native executable

You can create a native executable using:

```shell script
./mvnw package -Dnative
```

Or, if you don't have GraalVM installed, you can run the native executable build in a container using:

```shell script
./mvnw package -Dnative -Dquarkus.native.container-build=true
```

You can then execute your native executable with: `./target/jenga-0.0.1-SNAPSHOT-runner`

<br>

# Configuring Quarkus Langchain4j with Gemini

To run Langchain4j with the Gemini model in your Quarkus application, you need to configure your API key and model properties.

### 1\. Set Your Gemini API Key (in `.env`)

Your API key must be set as an environment variable in a `.env` file located at the root of your project. Quarkus will automatically load this file.

**`.env`**

```dotenv
QUARKUS_LANGCHAIN4J_AI_GEMINI_API_KEY=your_actual_api_key_goes_here
```

### 2\. Configure `application.properties`

Your `application.properties` file should then reference this environment variable to inject the API key. Here, you also specify which Gemini model you intend to use.

**`src/main/resources/application.properties`**

```properties
# Gemini AI Model Configuration
# -----------------------------

# Reference the API key from the .env file.
# The ':${}' syntax provides an empty default, but .env will supply the value.
quarkus.langchain4j.ai.gemini.api-key=${QUARKUS_LANGCHAIN4J_AI_GEMINI_API_KEY:}

# Set the desired chat model.
# This value can be changed to any other supported Gemini model.
quarkus.langchain4j.ai.gemini.chat-model.model-id=gemini-1.5-flash
```

Here is the new section for your README, formatted to match your existing file:

# Configuring the Google Web Search Tool

This setup is required to enable the `WebSearchTool`, which allows the AI to perform live web searches using the Google Custom Search Engine (CSE) API.

### 1. Get Google API Key and Search Engine ID

You will need two pieces of information from Google:

* **API Key:** This is a standard API key from your [Google Cloud Console](https://console.cloud.google.com/apis/credentials). You must ensure the **"Custom Search API"** is enabled for your project.
* **Search Engine ID (cse.id):** This ID connects your API key to a specific search configuration.
    1.  Go to the [Google Programmable Search Engine control panel](https://programmablesearchengine.google.com/controlpanel/all).
    2.  Click **Add** to create a new search engine.
    3.  In the "What to search?" section, select the option to **"Search the entire web"**.
    4.  After creation, go to the "Setup" tab and copy your **"Search engine ID"**.

### 2. Set Environment Variables (in `.env`)

Add your two new credentials to the `.env` file at the project root. This file is loaded by Quarkus and keeps your secrets out of the code.

**`.env`**

```dotenv
# Google Custom Search Credentials
GOOGLE_API_KEY=your-actual-api-key-goes-here
GOOGLE_CSE_ID=your-actual-search-engine-id-goes-here
````

### 3\. Configure `application.properties`

Finally, add the following to your `application.properties` file. This tells the Quarkus REST Client the API's URL and tells your `WebSearchTool` to read its credentials from the environment. By default this is already set up.

**`src/main/resources/application.properties`**

```properties
quarkus.rest-client.google-search-api.url=https://www.googleapis.com

google.api.key=${GOOGLE_API_KEY}
google.cse.id=${GOOGLE_CSE_ID}
```

# How to Export GitHub Issues

This guide covers the basic steps to export all issues from a repository to a JSON file using the official GitHub CLI.

**Regarding Ticket:** [github.com/Jenga-PMS/Jenga/issues/56](https://github.com/Jenga-PMS/Jenga/issues/56)

---

### Introduction

With the official GitHub CLI, you can easily export all issues. The following command will save the data to a **JSON** file (not CSV).

### Step 1: Install the GitHub CLI

If you are on a Mac, you can use Homebrew.

```bash
brew install gh
```

### Step 2: Log In

You will need to authenticate with your GitHub account. This command requests the `read:project` scope, which is necessary to access project information.

```bash
gh auth login -h github.com -s read:project
```

### Step 3: Export All Issues

Run this command to fetch all issues (both open and closed) and save them to a file named `issues.json`.

```bash
gh issue list --repo Jenga-PMS/Jenga --state all --json number,title,body,state,assignees,labels,milestone,comments,createdAt,updatedAt,projectItems > all-issues.json
```

Size, Estimate and Priority could not be extracted
