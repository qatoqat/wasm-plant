async function loadWasm() {
    let loadingElement = document.getElementById('loading');
    try {
        let wasm_plant = await import('./pkg/wasm_plant.js');
        await wasm_plant.default('./pkg/wasm_plant_bg.wasm');
        loadingElement.textContent = 'App loaded successfully!';
        setTimeout(() => loadingElement.textContent = '', 2000);
        initPlant(wasm_plant);
        initJoystick(wasm_plant);
    } catch (error) {
        loadingElement.textContent = 'Failed to load app: ' + error.message;
        loadingElement.style.color = 'orange';
    }
}

document.addEventListener('DOMContentLoaded', loadWasm);