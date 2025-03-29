function initJoystick(wasm_plant) {
    ((wasm_plant) => {
        let joystick = {
            active: false,
            startX: 0,
            startY: 0,
            currentX: 0,
            currentY: 0,
            threshold: 20,   // Minimum distance to register movement
            runThreshold: 60, // Run trigger area radius
            keys: new Set()
        };

        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');

        // Create overlay canvas for joystick drawing
        let overlayCanvas = document.getElementById("joystick-overlay");
        if (!overlayCanvas) {
            overlayCanvas = document.createElement("canvas");
            overlayCanvas.id = "joystick-overlay";
            overlayCanvas.width = canvas.width;
            overlayCanvas.height = canvas.height;
            let rect = canvas.getBoundingClientRect();
            overlayCanvas.style.position = "absolute";
            overlayCanvas.style.left = rect.left + "px";
            overlayCanvas.style.top = rect.top + "px";
            overlayCanvas.style.pointerEvents = "none"; // Allow events to pass through
            overlayCanvas.style.zIndex = "100";
            document.body.appendChild(overlayCanvas);
        }
        let overlayCtx = overlayCanvas.getContext('2d');

        // Calculate directions using inverted Y delta for natural mapping.
        function getDirection(dx, dy) {
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= joystick.threshold) return [];

            let angle = Math.atan2(dy, dx);
            let keys = [];

            if (angle >= -Math.PI/8 && angle < Math.PI/8) {
                keys.push('d');
            } else if (angle >= Math.PI/8 && angle < 3*Math.PI/8) {
                keys.push('w'); keys.push('d');
            } else if (angle >= 3*Math.PI/8 && angle < 5*Math.PI/8) {
                keys.push('w');
            } else if (angle >= 5*Math.PI/8 && angle < 7*Math.PI/8) {
                keys.push('w'); keys.push('a');
            } else if (angle >= 7*Math.PI/8 || angle < -7*Math.PI/8) {
                keys.push('a');
            } else if (angle >= -7*Math.PI/8 && angle < -5*Math.PI/8) {
                keys.push('s'); keys.push('a');
            } else if (angle >= -5*Math.PI/8 && angle < -3*Math.PI/8) {
                keys.push('s');
            } else if (angle >= -3*Math.PI/8 && angle < -Math.PI/8) {
                keys.push('s'); keys.push('d');
            }

            if (distance > joystick.runThreshold) {
                keys.push('Shift');
            }
            return keys;
        }

        // Update joystick from a client point (mouse or touch)
        function updateJoystickFromPoint(clientX, clientY) {
            const rect = canvas.getBoundingClientRect();
            let x = clientX - rect.left;
            let y = clientY - rect.top;
            joystick.currentX = x;
            joystick.currentY = y;

            // Invert the Y delta for natural joystick behavior:
            let dx = joystick.currentX - joystick.startX;
            let dy = -(joystick.currentY - joystick.startY);

            let newKeys = new Set(getDirection(dx, dy));

            // Trigger key-down for new keys:
            for (let key of newKeys) {
                if (!joystick.keys.has(key)) {
                    wasm_plant.key_down(key);
                }
            }
            // Trigger key-up for keys that are no longer active:
            for (let key of joystick.keys) {
                if (!newKeys.has(key)) {
                    wasm_plant.key_up(key);
                }
            }
            joystick.keys = newKeys;
            drawJoystick();
        }

        // Wrapper to support both touch and mouse events:
        function updateJoystick(event) {
            if (event.touches && event.touches.length > 0) {
                let touch = event.touches[0];
                updateJoystickFromPoint(touch.clientX, touch.clientY);
            } else {
                updateJoystickFromPoint(event.clientX, event.clientY);
            }
        }

        // Draw joystick overlay: base, run trigger area, and thumb.
        function drawJoystick() {
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

            // Draw shift trigger area (dashed circle)
            overlayCtx.beginPath();
            overlayCtx.arc(joystick.startX, joystick.startY, joystick.runThreshold, 0, Math.PI * 2);
            overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            overlayCtx.setLineDash([2, 2]);
            overlayCtx.stroke();
            overlayCtx.setLineDash([]);

            // Draw joystick base
            overlayCtx.beginPath();
            overlayCtx.arc(joystick.startX, joystick.startY, 40, 0, Math.PI * 2);
            overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            overlayCtx.fill();

            // Draw joystick thumb indicator
            overlayCtx.beginPath();
            overlayCtx.arc(joystick.currentX, joystick.currentY, 20, 0, Math.PI * 2);
            overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            overlayCtx.fill();
        }

        // Touch events
        canvas.addEventListener('touchstart', event => {
            let touch = event.touches[0];
            const rect = canvas.getBoundingClientRect();
            joystick.active = true;
            // Use the actual event position for both X and Y
            joystick.startX = touch.clientX - rect.left;
            joystick.startY = touch.clientY - rect.top;
            joystick.currentX = joystick.startX;
            joystick.currentY = joystick.startY;
            event.preventDefault();
        });

        canvas.addEventListener('touchmove', event => {
            if (joystick.active) {
                updateJoystick(event);
            }
            event.preventDefault();
        });

        canvas.addEventListener('touchend', () => {
            joystick.keys.forEach(key => wasm_plant.key_up(key));
            joystick.keys.clear();
            joystick.active = false;
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        });

        // Mouse events
        canvas.addEventListener('mousedown', event => {
            const rect = canvas.getBoundingClientRect();
            joystick.active = true;
            joystick.startX = event.clientX - rect.left;
            joystick.startY = event.clientY - rect.top;
            joystick.currentX = joystick.startX;
            joystick.currentY = joystick.startY;
            event.preventDefault();
        });

        canvas.addEventListener('mousemove', event => {
            if (joystick.active) {
                updateJoystick(event);
            }
            event.preventDefault();
        });

        canvas.addEventListener('mouseup', () => {
            joystick.keys.forEach(key => wasm_plant.key_up(key));
            joystick.keys.clear();
            joystick.active = false;
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        });

        canvas.addEventListener('mouseleave', () => {
            if (joystick.active) {
                joystick.keys.forEach(key => wasm_plant.key_up(key));
                joystick.keys.clear();
                joystick.active = false;
                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
            }
        });

        // Update overlay canvas position on window resize/scroll.
        function updateOverlayPosition() {
            let rect = canvas.getBoundingClientRect();
            overlayCanvas.style.left = rect.left + "px";
            overlayCanvas.style.top = rect.top + "px";
        }
        window.addEventListener('resize', updateOverlayPosition);
        window.addEventListener('scroll', updateOverlayPosition);
    })(wasm_plant);
}