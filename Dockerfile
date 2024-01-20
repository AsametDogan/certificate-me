# Use an official Node.js image as a base image
FROM node:18
# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
#COPY package*.json ./
COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm install 
  
COPY ./src ./src

# Specify the command to run your application
CMD [ "npm", "uninstall", "bcrypt" ]
CMD [ "npm", "install", "bcrypt" ]
CMD ["npm", "start"]