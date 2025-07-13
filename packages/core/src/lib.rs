mod memory_manager;
mod query_engine;
mod utils;

pub use memory_manager::MemoryManager;
pub use query_engine::{QueryEngine, QueryResult};
pub use utils::*;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[wasm_bindgen]
pub fn init_panic_hook() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen(start)]
pub fn main() {
    init_panic_hook();
    log("DataPrism Core WASM module initialized");
}

// Version and metadata
#[wasm_bindgen]
pub fn get_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[wasm_bindgen]
pub fn get_build_info() -> JsValue {
    let info = serde_json::json!({
        "version": env!("CARGO_PKG_VERSION"),
        "name": env!("CARGO_PKG_NAME"),
        "description": "DataPrism Core WASM Engine",
        "build_timestamp": js_sys::Date::now()
    });

    serde_wasm_bindgen::to_value(&info).unwrap_or(JsValue::NULL)
}

#[cfg(test)]
mod tests {
    use super::*;
    use wasm_bindgen_test::*;

    wasm_bindgen_test_configure!(run_in_browser);

    #[wasm_bindgen_test]
    fn test_memory_manager_allocation() {
        let mut manager = MemoryManager::new();
        let buffer_id = manager.allocate_buffer(1024);
        assert_eq!(manager.get_buffer_len(buffer_id), 0);
        assert!(manager.deallocate_buffer(buffer_id));
    }

    #[wasm_bindgen_test]
    async fn test_query_engine_basic() {
        let mut engine = QueryEngine::new();
        let test_data = b"test data";

        match engine.process_data(test_data).await {
            Ok(result) => {
                assert!(result.row_count > 0);
                assert!(result.execution_time_ms >= 0);
            }
            Err(e) => panic!("Query processing failed: {:?}", e),
        }
    }

    #[cfg(target_arch = "wasm32")]
    #[test]
    fn test_input_validation() {
        assert!(validate_input_data(&[1, 2, 3]).is_ok());
        assert!(validate_input_data(&[]).is_err());

        let large_data = vec![0u8; 200_000_000];
        assert!(validate_input_data(&large_data).is_err());
    }

    #[test]
    fn test_version_info() {
        let version = env!("CARGO_PKG_VERSION");
        assert!(!version.is_empty());
    }
}
