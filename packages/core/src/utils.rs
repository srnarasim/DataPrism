use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct DataPrismError {
    message: String,
    error_type: String,
    code: u32,
}

#[wasm_bindgen]
impl DataPrismError {
    #[wasm_bindgen(constructor)]
    pub fn new(message: &str, error_type: &str, code: u32) -> DataPrismError {
        DataPrismError {
            message: message.to_string(),
            error_type: error_type.to_string(),
            code,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn message(&self) -> String {
        self.message.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn error_type(&self) -> String {
        self.error_type.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn code(&self) -> u32 {
        self.code
    }
}

#[wasm_bindgen]
pub fn validate_input_data(data: &[u8]) -> Result<bool, JsValue> {
    // Validate input data format and size
    if data.is_empty() {
        return Err(JsValue::from_str("Input data cannot be empty"));
    }
    
    if data.len() > 100_000_000 { // 100MB limit
        return Err(JsValue::from_str("Input data exceeds maximum size limit"));
    }
    
    Ok(true)
}

#[wasm_bindgen]
pub fn log_performance_metric(operation: &str, duration_ms: f64, memory_bytes: u32) {
    web_sys::console::log_3(
        &format!("Performance: {}", operation).into(),
        &format!("Duration: {}ms", duration_ms).into(),
        &format!("Memory: {}MB", memory_bytes as f64 / 1_000_000.0).into(),
    );
}

#[wasm_bindgen]
pub fn get_browser_info() -> JsValue {
    let info = serde_json::json!({
        "user_agent": web_sys::window()
            .and_then(|w| w.navigator().user_agent().ok())
            .unwrap_or_default(),
        "memory": get_memory_info(),
        "performance": get_performance_info()
    });
    
    serde_wasm_bindgen::to_value(&info).unwrap()
}

fn get_memory_info() -> serde_json::Value {
    // Get memory information if available
    if let Some(window) = web_sys::window() {
        if let Some(performance) = window.performance() {
            // Note: performance.memory is non-standard and may not be available
            return serde_json::json!({
                "available": true,
                "timestamp": performance.now()
            });
        }
    }
    
    serde_json::json!({
        "available": false
    })
}

fn get_performance_info() -> serde_json::Value {
    if let Some(window) = web_sys::window() {
        if let Some(performance) = window.performance() {
            return serde_json::json!({
                "now": performance.now(),
                "timing_available": true
            });
        }
    }
    
    serde_json::json!({
        "timing_available": false
    })
}

// Benchmark operation - simplified version without generics for WASM compatibility
#[wasm_bindgen]
pub fn benchmark_start() -> f64 {
    js_sys::Date::now()
}

#[wasm_bindgen]
pub fn benchmark_end(start_time: f64, operation_name: &str) -> f64 {
    let end = js_sys::Date::now();
    let duration = end - start_time;
    
    log_performance_metric(operation_name, duration, 0);
    duration
}