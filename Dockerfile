# Use an official Node.js image as a base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
#RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Expose the port that your application will run on
EXPOSE 5001

# Specify the command to run your application
CMD [ "npm", "uninstall", "bcrypt" ]
CMD [ "npm", "install", "bcrypt" ]
CMD ["npm", "start"]


RUN apk add --no-cache make gcc g++ python && \
  npm install && \
  npm rebuild bcrypt --build-from-source && \
  apk del make gcc g++ python


