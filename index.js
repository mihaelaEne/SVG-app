document.addEventListener('DOMContentLoaded', function() {
    const svgNS = "http://www.w3.org/2000/svg";
    const svgCanvas = document.getElementById('svgCanvas');
    const colorPicker = document.getElementById('colorPicker');
    const lineWidth = document.getElementById('lineWidth');
    const undoButton = document.getElementById('undoButton');
    const saveButton = document.getElementById('saveButton');
    let selectedElement = null;
    let offset = { x: 0, y: 0 };
    let history = [];
    let historyStep = -1;

    function saveHistory() {
        historyStep++;
        history.length = historyStep;
        history.push(svgCanvas.innerHTML);
    }

    function undo() {
        if (historyStep > 0) {
            historyStep--;
            svgCanvas.innerHTML = history[historyStep];
            document.querySelectorAll('.draggable').forEach(makeDraggable);
        }
    }

    function makeDraggable(elem) {
        elem.addEventListener('mousedown', startDrag);
    }

    function startDrag(evt) {
        if (evt.target.classList.contains('draggable')) {
            selectedElement = evt.target;
            offset.x = evt.clientX - selectedElement.getBoundingClientRect().x;
            offset.y = evt.clientY - selectedElement.getBoundingClientRect().y;
            svgCanvas.addEventListener('mousemove', drag);
            svgCanvas.addEventListener('mouseup', endDrag);
            svgCanvas.addEventListener('mouseleave', endDrag);
        }
    }

    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            const coord = getMousePosition(evt);
            if (selectedElement.tagName === 'circle') {
                selectedElement.setAttribute('cx', coord.x - offset.x);
                selectedElement.setAttribute('cy', coord.y - offset.y);
            } else if (selectedElement.tagName === 'rect') {
                selectedElement.setAttribute('x', coord.x - offset.x);
                selectedElement.setAttribute('y', coord.y - offset.y);
            }
        }
    }

    function endDrag(evt) {
        selectedElement = null;
        svgCanvas.removeEventListener('mousemove', drag);
        svgCanvas.removeEventListener('mouseup', endDrag);
        svgCanvas.removeEventListener('mouseleave', endDrag);
    }

    function getMousePosition(evt) {
        var CTM = svgCanvas.getScreenCTM();
        return {
            x: (evt.clientX - CTM.e) / CTM.a,
            y: (evt.clientY - CTM.f) / CTM.d
        };
    }

    function addElement(tagName, attributes, draggable) {
        const elem = document.createElementNS(svgNS, tagName);
        for (const attr in attributes) {
            elem.setAttribute(attr, attributes[attr]);
        }
        if (draggable) {
            elem.classList.add('draggable');
            makeDraggable(elem);
        }
        svgCanvas.appendChild(elem);
        saveHistory();
    }

    document.getElementById('addRect').addEventListener('click', function() {
        addElement('rect', { x: 50, y: 50, width: 100, height: 100, fill: colorPicker.value }, true);
    });

    document.getElementById('addCircle').addEventListener('click', function() {
        addElement('circle', { cx: 150, cy: 150, r: 50, fill: colorPicker.value }, true);
    });

    document.getElementById('addLine').addEventListener('click', function() {
        addElement('line', { x1: 100, y1: 100, x2: 200, y2: 200, stroke: colorPicker.value, 'stroke-width': lineWidth.value }, false);
    });

    undoButton.addEventListener('click', undo);

    saveButton.addEventListener('click', function() {
        const svgData = new XMLSerializer().serializeToString(svgCanvas);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            canvas.width = svgCanvas.clientWidth;
            canvas.height = svgCanvas.clientHeight;
            ctx.drawImage(img, 0, 0);
            const jpgUrl = canvas.toDataURL('image/jpeg');
            const downloadLink = document.createElement('a');
            downloadLink.href = jpgUrl;
            downloadLink.download = 'image.jpg';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });

    saveHistory();


});