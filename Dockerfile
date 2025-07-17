# Step 1: Start with a pre-built "gallery wall" - an official Nginx web server.
# 'nginx:stable-alpine' is a small and reliable version.
FROM nginx:stable-alpine

# Step 2: Take all our files from our project...
# The first '.' means "everything in my current project folder".
# The second part is the destination: where Nginx expects to find website files inside the container.
COPY . /usr/share/nginx/html

# Step 3: Tell Docker that the container will be listening for visitors on port 80.
# Port 80 is the standard port for HTTP web traffic.
EXPOSE 80

# That's it! The base Nginx image already knows how to start itself.
# We don't need a CMD instruction.