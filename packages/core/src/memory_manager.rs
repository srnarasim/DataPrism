use wasm_bindgen::prelude::*;
use std::collections::HashMap;

#[wasm_bindgen]
pub struct MemoryManager {
    buffers: HashMap<u32, Vec<u8>>,
    next_id: u32,
}

#[wasm_bindgen]
impl MemoryManager {
    #[wasm_bindgen(constructor)]
    pub fn new() -> MemoryManager {
        console_error_panic_hook::set_once();
        MemoryManager {
            buffers: HashMap::new(),
            next_id: 0,
        }
    }

    #[wasm_bindgen]
    pub fn allocate_buffer(&mut self, size: usize) -> u32 {
        let buffer = Vec::with_capacity(size);
        let id = self.next_id;
        self.buffers.insert(id, buffer);
        self.next_id += 1;
        id
    }

    #[wasm_bindgen]
    pub fn get_buffer_ptr(&self, id: u32) -> *const u8 {
        self.buffers.get(&id)
            .map(|b| b.as_ptr())
            .unwrap_or(std::ptr::null())
    }

    #[wasm_bindgen]
    pub fn get_buffer_len(&self, id: u32) -> usize {
        self.buffers.get(&id)
            .map(|b| b.len())
            .unwrap_or(0)
    }

    #[wasm_bindgen]
    pub fn deallocate_buffer(&mut self, id: u32) -> bool {
        self.buffers.remove(&id).is_some()
    }

    #[wasm_bindgen]
    pub fn get_total_allocated(&self) -> usize {
        self.buffers.values().map(|b| b.capacity()).sum()
    }

    #[wasm_bindgen]
    pub fn get_buffer_count(&self) -> u32 {
        self.buffers.len() as u32
    }
}