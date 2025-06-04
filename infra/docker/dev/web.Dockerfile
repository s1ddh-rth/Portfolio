FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY apps/web/package*.json ./
RUN npm install

# Copy configuration files
COPY apps/web/tsconfig.json ./
COPY apps/web/next.config.js ./
COPY apps/web/postcss.config.js ./
COPY apps/web/tailwind.config.ts ./

# Copy application code
COPY apps/web/src ./src
COPY packages/shared/ /packages/shared/

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV development

# Expose port
EXPOSE 3000

# Build and run the application
CMD ["npm", "run", "dev"] 