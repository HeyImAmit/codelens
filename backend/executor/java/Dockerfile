FROM eclipse-temurin:21-jdk-alpine

# Create non-root runner user with UID 1000
RUN addgroup -S runner -g 1000 && adduser -S runner -G runner -u 1000

# Copy runner script to system path
COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh && chown runner:runner /usr/local/bin/run.sh

# Setup working directory
WORKDIR /app

# Switch to non-root user
USER runner

# Set entrypoint to /usr/local/bin/run.sh
ENTRYPOINT ["/usr/local/bin/run.sh"]
