import { douglasPeucker, _Vector } from './douglas-peucker.js';
window.onload = (event) => {
    let canvas = document.getElementById('canvas');
    let ei = document.getElementById('epsilonValue');
    let epsilon = 10;
    ei.addEventListener('change', (event) => {
        try {
            let e = Number.parseFloat(event.target.value)
            if (epsilon != e) {
                epsilon = e;
                if (points) {
                    let ps = douglasPeucker(points, epsilon);
                    redraw(ctx, points, ps);
                }
            }
        } catch (e) { }
    })
    ei.addEventListener('keypress', (event) => {
        if (event.key == 'Enter') {
            event.target.blur();
        }
    })
    let scale = window.devicePixelRatio;
    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight * scale;
    let ctx = canvas.getContext('2d');
    let start = false;
    let points = [];
    let rid;

    canvas.ontouchstart = (event) => {
        let touches = event.touches;
        clickStart(touches[0].clientX * scale, touches[0].clientY * scale);
    }

    canvas.ontouchmove = (event) => {
        let touches = event.touches;
        move(touches[0].clientX * scale, touches[0].clientY * scale);
    }

    canvas.ontouchend = canvas.onmouseup = () => {
        clickEnd();
    }

    canvas.onmousedown = (event) => {
        clickStart(event.offsetX, event.offsetY);
    }
    canvas.onmousemove = (event) => {
        let x = event.offsetX;
        let y = event.offsetY;
        move(x, y);
    }

    function clickStart(x, y) {
        if (start) return;
        start = true;
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'black';
        ctx.globalAlpha = 1;
        ctx.moveTo(x, y);
        points = [];
        points.push([x, y]);
    }

    function move(x, y) {
        if (!start) return;
        if (rid) cancelAnimationFrame(rid);
        rid = requestAnimationFrame(() => {
            points.push([x, y]);
            ctx.lineTo(x, y);
            ctx.stroke();
            rid = null;
        })
    }

    function clickEnd() {
        start = false;
        if (rid) cancelAnimationFrame(rid);
        let ps = douglasPeucker(points, epsilon);
        redraw(ctx, points, ps);
    }
}

function redraw(ctx, points, points2) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'black';
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.stroke();

    ctx.strokeStyle = 'red';
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = '#3D8BFD'
    ctx.beginPath();
    ctx.moveTo(points2[0][0], points2[0][1]);
    for (let i = 1; i < points2.length; i++) {
        ctx.lineTo(points2[i][0], points2[i][1]);
    }
    ctx.stroke();

    points2.forEach(p => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 5, 0, Math.PI * 2);
        ctx.fill()
    })
}
