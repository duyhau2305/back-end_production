# Sử dụng node.js image
FROM node:16

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file package.json và cài đặt các dependencies
COPY package*.json ./

RUN npm install

# Copy toàn bộ source code vào thư mục làm việc
COPY . .

# Expose port cho backend
EXPOSE 5000

# Chạy ứng dụng Node.js
CMD ["npm", "run", "start"]
