function initPlant(wasm_plant) {
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
}