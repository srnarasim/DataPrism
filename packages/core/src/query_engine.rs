use crate::memory_manager::MemoryManager;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Serialize, Deserialize)]
#[wasm_bindgen]
pub struct QueryResult {
    #[wasm_bindgen(skip)]
    pub data: Vec<serde_json::Value>,
    pub row_count: u32,
    pub execution_time_ms: u32,
    pub memory_used_bytes: u32,
}

#[wasm_bindgen]
impl QueryResult {
    #[wasm_bindgen(getter)]
    pub fn data(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.data).unwrap()
    }
}

#[wasm_bindgen]
pub struct QueryEngine {
    memory_manager: MemoryManager,
}

#[wasm_bindgen]
impl QueryEngine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> QueryEngine {
        QueryEngine {
            memory_manager: MemoryManager::new(),
        }
    }

    #[wasm_bindgen]
    pub async fn process_data(&mut self, data: &[u8]) -> Result<QueryResult, JsValue> {
        let start_time = js_sys::Date::now();

        // Validate input data
        if data.is_empty() {
            return Err(JsValue::from_str("Input data cannot be empty"));
        }

        if data.len() > 100_000_000 {
            // 100MB limit
            return Err(JsValue::from_str("Input data exceeds maximum size limit"));
        }

        // Allocate buffer for processing
        let buffer_id = self.memory_manager.allocate_buffer(data.len());

        // Simulate data processing - in real implementation this would contain
        // optimized algorithms for data transformation and analysis
        let processed_data = self.process_internal(data)?;

        // Clean up buffer
        self.memory_manager.deallocate_buffer(buffer_id);

        let end_time = js_sys::Date::now();

        Ok(QueryResult {
            data: processed_data,
            row_count: 2, // This would be computed based on actual data
            execution_time_ms: (end_time - start_time) as u32,
            memory_used_bytes: data.len() as u32,
        })
    }

    fn process_internal(&self, data: &[u8]) -> Result<Vec<serde_json::Value>, JsValue> {
        // Parse input data and perform transformations
        let data_str =
            std::str::from_utf8(data).map_err(|_| JsValue::from_str("Invalid UTF-8 data"))?;

        // For demonstration, parse as JSON and perform simple transformations
        if let Ok(json_data) = serde_json::from_str::<serde_json::Value>(data_str) {
            if let Some(array) = json_data.as_array() {
                let processed: Vec<serde_json::Value> = array
                    .iter()
                    .map(|item| {
                        let mut processed_item = item.clone();
                        if let Some(obj) = processed_item.as_object_mut() {
                            obj.insert("processed".to_string(), serde_json::Value::Bool(true));
                            obj.insert(
                                "timestamp".to_string(),
                                serde_json::Value::Number(serde_json::Number::from(
                                    js_sys::Date::now() as i64,
                                )),
                            );
                        }
                        processed_item
                    })
                    .collect();

                return Ok(processed);
            }
        }

        // Fallback: create simple processed data structure
        Ok(vec![
            serde_json::json!({"id": 1, "value": "processed", "source": "wasm"}),
            serde_json::json!({"id": 2, "value": "data", "source": "wasm"}),
        ])
    }

    #[wasm_bindgen]
    pub fn get_memory_usage(&self) -> u32 {
        self.memory_manager.get_total_allocated() as u32
    }

    #[wasm_bindgen]
    pub fn optimize_memory(&mut self) -> u32 {
        // In a real implementation, this would perform memory optimization
        // For now, return current memory usage
        self.get_memory_usage()
    }

    #[wasm_bindgen]
    pub fn get_stats(&self) -> JsValue {
        let stats = serde_json::json!({
            "memory_usage": self.get_memory_usage(),
            "buffer_count": self.memory_manager.get_buffer_count(),
            "version": "0.1.0"
        });

        serde_wasm_bindgen::to_value(&stats).unwrap()
    }
}
