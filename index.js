// pointerdown, pointerup, pointermove

const source = document.getElementById('source');
const move = document.getElementById('move');
const dest1 = document.getElementById('dest1');
const dest2 = document.getElementById('dest2');

let posX = 0; // Позиция начального смещения по X и Y
let posY = 0;

source.addEventListener('pointerdown', (event) => {
    // pageX pageY - абсолютные координаты блока
    // offsetX offsetY - относительные координаты клика внутри блока
    posX = event.offsetX;
    posY = event.offsetY;
    move.style.left = (event.pageX - event.offsetX) +'px';
    move.style.top = (event.pageY - event.offsetY) +'px';
    move.classList.remove('hidden');
});

move.addEventListener('pointermove', (event) => {
    if (!event.pressure) {
        return;
    }
    move.style.left = (event.pageX - posX) +'px';
    move.style.top = (event.pageY - posY) +'px';
});
