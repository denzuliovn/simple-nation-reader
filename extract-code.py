import os

def collect_code(output_file='all_code.txt'):
    # Thư mục gốc là thư mục hiện tại nơi file python đang chạy
    root_dir = os.getcwd()

    # Các thư mục cần BỎ QUA (không lấy code)
    ignored_dirs = {
        '.next', 
        'node_modules', 
        '.git', 
        '.vscode', 
        'dist', 
        'build', 
        'ARCHIVE', # Dựa trên ảnh của bạn
        'public'   # Thường chứa ảnh, font, không cần lấy
    }

    # Các đuôi file cần LẤY nội dung (dựa trên project Next.js của bạn)
    allowed_extensions = {
        '.ts', 
        '.tsx', 
        '.js', 
        '.mjs', 
        '.json', 
        '.css',
        '.scss'
    }

    # Các file cụ thể nên bỏ qua (nếu muốn)
    ignored_files = {
        'package-lock.json', # File này thường quá dài và không cần thiết
        'yarn.lock'
    }

    print(f"Đang bắt đầu quét thư mục: {root_dir}...")

    with open(output_file, 'w', encoding='utf-8') as outfile:
        # Duyệt qua các thư mục
        for root, dirs, files in os.walk(root_dir):
            # Lọc bỏ các thư mục nằm trong danh sách ignored_dirs
            dirs[:] = [d for d in dirs if d not in ignored_dirs]

            for file in files:
                file_ext = os.path.splitext(file)[1]
                
                # Kiểm tra xem file có đuôi cho phép và không nằm trong danh sách loại trừ không
                if file_ext in allowed_extensions and file not in ignored_files:
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, root_dir)

                    # Bỏ qua chính file output và file script python này
                    if file == output_file or file == os.path.basename(__file__):
                        continue

                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # Ghi tiêu đề để phân biệt các file
                            outfile.write(f"\n{'='*80}\n")
                            outfile.write(f"FILE PATH: {relative_path}\n")
                            outfile.write(f"{'='*80}\n\n")
                            
                            # Ghi nội dung code
                            outfile.write(content)
                            outfile.write("\n")
                            
                        print(f"Đã thêm: {relative_path}")
                    except Exception as e:
                        print(f"Lỗi khi đọc file {relative_path}: {e}")

    print(f"\nHoàn tất! Toàn bộ code đã được lưu vào file: {output_file}")

if __name__ == "__main__":
    # Bạn có thể đổi tên file đầu ra ở đây, ví dụ 'du_lieu_code.txt'
    collect_code('full_project_source.txt')