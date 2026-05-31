# Plan: Recipe Data Management

## Vấn đề hiện tại

- Mỗi lần thêm/sửa/xóa recipe phải chỉnh `data/recipes.json` thủ công
- Inline fallback trong `data-service.js` phải sync lại bằng tay
- Dễ sai cú pháp JSON, không có validation

---

## Các hướng giải quyết

### Option A — Admin UI tĩnh (Recommended)

Tạo `admin.html` — một trang quản trị chạy hoàn toàn client-side, không cần backend.

**Cách hoạt động:**
1. Load `data/recipes.json` vào bảng danh sách
2. Form Add/Edit đầy đủ fields (name, origin, notes, steps, ratio, temp, v.v.)
3. Validate dữ liệu trước khi lưu
4. Nút **Export JSON** → tải file `recipes.json` mới về → đặt đè vào `data/`

**Ưu điểm:**
- Không cần server, không cần deploy thêm gì
- Chạy được ngay bằng `file://` hoặc local server
- Không thay đổi kiến trúc hiện tại

**Nhược điểm:**
- Vẫn phải copy file export vào `data/` thủ công (nhưng chỉ 1 bước)
- Không lưu tự động

---

### Option B — Express Admin API

Thêm `server.js` với Node.js + Express, có API CRUD viết thẳng vào `recipes.json`.

**Cách hoạt động:**
1. `GET  /api/recipes` → đọc file
2. `POST /api/recipes` → thêm recipe mới
3. `PUT  /api/recipes/:id` → cập nhật
4. `DELETE /api/recipes/:id` → xóa
5. Admin UI gọi API trên → lưu tự động, không cần export

**Ưu điểm:**
- Thay đổi được lưu ngay, không cần thao tác file
- Có thể thêm basic auth để bảo vệ admin route

**Nhược điểm:**
- Cần chạy Node server (`node server.js`) mỗi khi dùng
- Thêm dependency (express)

---

### Option C — Google Sheets làm CMS

Lưu data trên Google Sheets, app fetch qua published CSV.

**Ưu điểm:** Giao diện Sheets quen thuộc, dễ chia sẻ với team

**Nhược điểm:** Phụ thuộc internet + Google, latency cao hơn, cấu trúc bảng khó map nested steps

---

## Recommendation

**Chọn Option A** nếu đây là project cá nhân / nhỏ — triển khai nhanh, zero dependency mới.

**Chọn Option B** nếu cần cập nhật data thường xuyên hoặc có nhiều người dùng admin.

---

## Implementation Plan (Option A)

### Files cần tạo / sửa

```
cafe/
├── admin.html              ← trang admin mới
├── js/
│   └── admin.js            ← logic admin UI
└── data/
    └── recipes.json        ← không thay đổi structure
```

### Bước 1 — `admin.html`

- Sidebar: danh sách recipes (filter theo tool/preference)
- Main panel: form edit với tất cả fields
- Nút: New Recipe, Save, Delete, Export JSON, Import JSON

### Bước 2 — `js/admin.js`

- `loadRecipes()` — fetch `data/recipes.json`
- `renderList()` — hiển thị danh sách
- `renderForm(recipe)` — populate form
- `saveRecipe()` — validate + update in-memory array
- `exportJSON()` — `Blob` + `URL.createObjectURL` → trigger download
- `importJSON()` — file input → parse + load vào editor
- Dynamic steps editor — thêm/xóa step rows

### Bước 3 — Validation

Validate trước khi save:
- `id` unique, không rỗng
- `tool` ∈ `[PHIN, ESPRESSO, FILTER, COLD_BREW]`
- `preference` ∈ `[BALANCED, FRUITY, STRONG]`
- `score` trong khoảng 0–5
- Mỗi step có `name`, `water`, `start`, `end`

### Bước 4 — Sync inline fallback (tùy chọn)

Sau khi export `recipes.json`, chạy một script nhỏ để tự động sync vào `RECIPES_INLINE` trong `data-service.js`:

```
node scripts/sync-inline.js
```

Script đọc `data/recipes.json` → ghi lại phần `RECIPES_INLINE` trong `data-service.js`.

---

## Estimated effort

| Task | Thời gian ước tính |
|---|---|
| `admin.html` layout + CSS cơ bản | 1–2 giờ |
| `admin.js` CRUD + export/import | 2–3 giờ |
| Dynamic steps editor | 1 giờ |
| Validation | 30 phút |
| Script sync inline fallback | 30 phút |
| **Tổng** | **~5–6 giờ** |
