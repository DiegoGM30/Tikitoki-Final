FROM node:18

# Install packages
RUN apt-get update -q \
    && apt-get install -qy ffmpeg
    
# Create service directory
WORKDIR /usr/src/service

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

# Copy service code into service directory
COPY . .

# Install dependencies
RUN npm install

# Launch the service
CMD /wait && node index.js