let wasm_plant;
const loadingElement = document.getElementById('loading');

async function loadWasm() {
    try {
        wasm_plant = await import('./pkg/wasm_plant.js');
        await wasm_plant.default('./pkg/wasm_plant_bg.wasm');
        loadingElement.textContent = 'App loaded successfully!';
        setTimeout(() => loadingElement.textContent = '', 2000);
    } catch (error) {
        loadingElement.textContent = 'Failed to load app: ' + error.message;
        loadingElement.style.color = 'orange';
    }
}

document.addEventListener('DOMContentLoaded', loadWasm);

window.addEventListener('keydown', e => {
    e.preventDefault();
    wasm_plant.key_down(e.key);
});
window.addEventListener('keyup', e => {
    e.preventDefault();
    wasm_plant.key_up(e.key);
});

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Apply nearest-neighbor scaling
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

// fullscreen
document.getElementById('fs-button').addEventListener('click', () => {
    canvas.requestFullscreen?.() || canvas.webkitRequestFullscreen?.()
});