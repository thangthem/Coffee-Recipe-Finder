# Hướng Dẫn Cập Nhật Recipe

## Yêu cầu

- Tài khoản GitHub có quyền push vào repo

---

## Bước 1 — Mở màn hình Admin

Mở màn hình admin và load file recipes mới nhất

---

## Bước 2 — Thêm / Sửa / Xóa Recipe

### Thêm recipe mới

1. Nhấn **New Recipe** ở sidebar trái
2. Chọn **Tool** (Espresso / Phin / Filter / Cold Brew)
3. Điền đầy đủ thông tin theo form tương ứng
4. Nhấn **Save Recipe**

### Sửa recipe có sẵn

1. Click vào recipe trong danh sách sidebar
2. Chỉnh sửa các field cần thay đổi
3. Nhấn **Save Recipe**

### Xóa recipe

1. Click vào recipe cần xóa
2. Nhấn nút **Delete** (màu đỏ, góc dưới trái)
3. Xác nhận trong hộp thoại

### Lọc danh sách

Dùng 2 dropdown phía trên danh sách để lọc theo **Tool** và **Preference**.

---

## Bước 3 — Export file JSON

Sau khi cập nhật xong, nhấn nút **Export JSON** ở góc trên phải.

Trình duyệt sẽ tải về file `recipes.json` vào thư mục Downloads.

---

## Bước 4 — Thay file trên GitHub

Có 2 cách:

---

### Cách A — Trực tiếp trên GitHub (không cần terminal)

1. Vào repo trên GitHub, điều hướng đến file `data/recipes.json`
2. Nhấn icon bút chì **Edit this file** (góc trên phải file)
3. Xóa toàn bộ nội dung cũ
4. Mở file `recipes.json` vừa export → Copy toàn bộ nội dung → Paste vào
5. Kéo xuống phần **Commit changes**
6. Nhập message ví dụ: `update recipes`
7. Nhấn **Commit changes**

GitHub Pages sẽ tự cập nhật sau 1–2 phút.

---

### Cách B — Dùng terminal (nhanh hơn nếu quen git)

**1. Copy file export vào đúng chỗ:**

Lấy file `recipes.json` vừa tải về từ trình duyệt, đặt đè vào:

```
data/recipes.json
```

**2. Commit và push:**

```bash
git add data/recipes.json
git commit -m "update recipes"
git push
```

GitHub Pages sẽ tự cập nhật sau 1–2 phút.

---

## Kiểm tra kết quả

Sau khi push xong, mở trang web (GitHub Pages URL) và hard refresh:

- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

Kiểm tra xem recipes mới đã hiện chưa.

---

## Lưu ý

| Tình huống | Cách xử lý |
|---|---|
| Export ra file nhưng chưa push | Chưa ảnh hưởng gì đến production |
| Push nhưng web chưa cập nhật | Chờ 1–2 phút, sau đó hard refresh |
| Muốn rollback về version cũ | Vào GitHub → file `data/recipes.json` → **History** → chọn commit cũ → copy nội dung |
| Admin không load được recipes | Kiểm tra đang chạy `npx serve .`, không mở file:// |
