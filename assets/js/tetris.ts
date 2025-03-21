let canvas = document.getElementById('tetris')
let context = canvas.getContext('2d')
context.scale(20,20)

let rows = 30;
let collums = 10

function createMatrix(width, height) {
    return Array.from({ length: height }, () => Array(width).fill(0));
}

function createPiece(type) {
    switch (type) {
        case 'T': return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
        case 'O': return [[1, 1], [1, 1]];
        case 'L': return [[0, 0, 1], [1, 1, 1], [0, 0, 0]];
        case 'J': return [[1, 0, 0], [1, 1, 1], [0, 0, 0]];
        case 'I': return [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]];
        case 'S': return [[0, 1, 1], [1, 1, 0], [0, 0, 0]];
        case 'Z': return [[1, 1, 0], [0, 1, 1], [0, 0, 0]];
    }
}

const arena = createMatrix(COLUMNS, ROWS);
const player = { pos: { x: 5, y: 0 }, matrix: createPiece('T') };

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                context.fillStyle = "red";
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}



function draw() {
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

document.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") {
        player.pos.x--;
    } else if (event.key === "ArrowRight") {
        player.pos.x++;
    } else if (event.key === "ArrowDown") {
        player.pos.y++;
    }
    draw();
});

draw();

export default tetris;