FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl bash git

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Install OpenAPI generator CLI glob
RUN npm install -g @openapitools/openapi-generator-cli

# Copy source code including pre-generated OpenAPI spec
COPY . .

# Generate API client at build time
# `src/api/openapi.json` has tio exist in the repo or is copied in
RUN if [ -f src/api/openapi.json ]; then \
      echo "Generating API client..." && \
      openapi-generator-cli generate -i src/api/openapi.json -g typescript-fetch -o src/api/generated; \
    else \
      echo "Warning: src/api/openapi.json not found, skipping client generation"; \
    fi

# Expose dev server port
EXPOSE 5173

# Start dev server
CMD ["npm", "run", "dev"]
