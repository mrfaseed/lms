FROM ubuntu:22.04

# Avoid prompts during apt installs
ENV DEBIAN_FRONTEND=noninteractive

# Install common compilers and runtimes
RUN apt-get update && apt-get install -y \
    python3 \
    nodejs \
    openjdk-17-jdk \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user to run student code
RUN useradd -m -s /bin/bash student

# The workspace will be mounted at /code
WORKDIR /code

# Change owner to student
RUN chown -R student:student /code

USER student

# Default command
CMD ["/bin/bash"]
