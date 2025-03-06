# Sử dụng image Node.js v18 làm base image
FROM node:18


# Sao chép package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt các dependencies từ package.json
RUN npm install

# Sao chép toàn bộ mã nguồn vào thư mục gốc của container
COPY . .

# Mở port 3000 để container có thể giao tiếp với môi trường bên ngoài
EXPOSE 2001

# Chạy server.js từ thư mục src
CMD ["npm", "start"]