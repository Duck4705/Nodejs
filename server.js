const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors()); // Cho phép frontend truy cập API

// Kết nối MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "040705",
    database: "moviedb",
});

db.connect(err => {
    if (err) throw err;
    console.log("✅ Kết nối MySQL thành công!");
});

// 📌 API: Lấy danh sách phim
app.get("/movies", (req, res) => {
    db.query("SELECT * FROM movies", (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// 📌 API: Đặt vé xem phim
app.post("/bookings", (req, res) => {
    const { movieId, user } = req.body;
    
    // Kiểm tra xem còn chỗ không
    db.query("SELECT seats FROM movies WHERE id = ?", [movieId], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result[0].seats <= 0) return res.status(400).json({ error: "Hết vé!" });

        // Thêm đặt vé vào database
        db.query("INSERT INTO bookings (movie_id, user) VALUES (?, ?)", [movieId, user], (err, result) => {
            if (err) return res.status(500).json(err);

            // Cập nhật số ghế trống
            db.query("UPDATE movies SET seats = seats - 1 WHERE id = ?", [movieId]);

            res.json({ message: "🎟️ Đặt vé thành công!", bookingId: result.insertId });
        });
    });
});

// Khởi động server
app.listen(3000, () => console.log("🚀 Server chạy tại http://localhost:3000"));
