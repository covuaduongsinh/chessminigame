use tauri::Manager;

/// Khởi động bản desktop: một cửa sổ duy nhất chứa bản web xuất từ Expo.
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Mở app lần hai thì đưa cửa sổ đang chạy lên trước thay vì mở thêm.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.unminimize();
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        // Nhớ vị trí và kích thước cửa sổ giữa các lần mở (tiện cho máy chiếu lớp học).
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .run(tauri::generate_context!())
        .expect("không khởi động được Dương Sinh Chess");
}
