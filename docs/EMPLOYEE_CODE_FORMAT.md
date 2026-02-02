# Định dạng Mã Nhân Viên (Employee Code Format)

## Format Chuẩn

**Format:** `CBA` + 4 chữ số

### Ví dụ:
- `CBA0001` - Nguyễn Anh (Giám đốc)
- `CBA0004` - Lê Dũng (Trưởng phòng KT)
- `CBA0016` - Trần Bình (Trưởng phòng KT)
- `CBA0040` - Bùi Minh (Nhân viên KT)

## Cấu trúc

```
CBA + [4 chữ số]
│    │
│    └─ Số thứ tự nhân viên (0001 - 9999)
└────── Tiền tố cố định (Cảng Hàng Không)
```

## Quy tắc

1. **Tiền tố:** Luôn là `CBA` (viết hoa)
2. **Số thứ tự:** 4 chữ số, bắt đầu từ `0001`
3. **Độ dài:** Tổng cộng 7 ký tự (3 chữ cái + 4 chữ số)
4. **Case:** Tự động chuyển sang chữ hoa khi nhập

## Validation

- ✅ Hợp lệ: `CBA0001`, `CBA0004`, `CBA0016`, `CBA0040`
- ❌ Không hợp lệ:
  - `CBA1` (thiếu số 0)
  - `CBA00001` (quá 4 chữ số)
  - `CBA000A` (có chữ cái trong phần số)
  - `ABC0001` (sai tiền tố)
  - `cba0001` (chữ thường - sẽ tự động chuyển thành CBA0001)

## Regex Pattern

```regex
^CBA\d{4}$
```

- `^` - Bắt đầu chuỗi
- `CBA` - Tiền tố cố định
- `\d{4}` - Đúng 4 chữ số
- `$` - Kết thúc chuỗi

## Lưu ý

- Mã nhân viên phải là **UNIQUE** trong hệ thống
- Không được trùng với mã đã tồn tại
- Tự động chuyển sang chữ hoa khi lưu vào database
- Format này được áp dụng cho tất cả nhân viên mới
