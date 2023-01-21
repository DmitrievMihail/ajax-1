// pointerdown, pointerup, pointermove

const source = document.getElementById('source');
const move = document.getElementById('move');
const dest1 = document.getElementById('dest1');
const dest2 = document.getElementById('dest2');
const debug = true;
let blockCounter = 0; // Счётчик блоков
let blockOver = 0; // Номеб блока в который кидаем

let posX = 0; // Позиция начального смещения по X и Y
let posY = 0;

// Событие-перемещалка (на body, потому что ездить может везде, даже за экраном)
const moveListener = function (event) {
    // eslint-disable-next-line no-use-before-define
    !event.pressure && drop(event); // если отпустили за экраном
    move.style.left = `${event.pageX - posX}px`;
    move.style.top = `${event.pageY - posY}px`;
};

// Событие-определялка куда кинули
const dropListener = function (event) {
    // Событие одноразовое, прибиваем
    console.log('Попал', event.target.id);
    const elem = document.createElement('div'); // элемент для вставки
    // eslint-disable-next-line no-plusplus
    elem.innerHTML = `Блок номер ${++blockCounter}`;
    event.target.append(elem);
    console.log(event.target);
};

const destListener = function (event) {
    // eslint-disable-next-line no-nested-ternary
    blockOver = event.type === 'pointerout' ? 0 : event.target.id === 'dest1' ? 1 : 2;
    if (blockOver) {
        event.target.classList.add('over');
    } else {
        event.target.classList.remove('over');
    }
    debug && console.log(event.type, event.target, blockOver);
    return false;
};

// Схватить (событие постоянно висит)
source.addEventListener('pointerdown', (event) => {
    // pageX pageY - абсолютные координаты блока
    // offsetX offsetY - относительные координаты клика внутри блока
    posX = event.offsetX;
    posY = event.offsetY;
    move.style.left = `${event.pageX - event.offsetX}px`;
    move.style.top = `${event.pageY - event.offsetY}px`;
    // Светлый цвет
    const randColor = `rgb(${128 + parseInt(128 * Math.random(), 10)},${128 + parseInt(128 * Math.random(), 10)},${
        128 + parseInt(128 * Math.random(), 10)
    })`;
    move.style.backgroundColor = randColor;
    move.classList.remove('hidden');
    debug && console.log('Схватили:', event.pageX, event.pageY, randColor);

    document.body.addEventListener('pointermove', moveListener); // Для движения
    dest1.addEventListener('pointerover', destListener); // Для наведения
    dest2.addEventListener('pointerover', destListener);
    dest1.addEventListener('pointerout', destListener); // Для снятия
    dest2.addEventListener('pointerout', destListener);

});

// Событие при опускании
const drop = function (event) {
    // Скрыли таскалку
    move.classList.add('hidden');
    // Проверяем куда кинули
    dest1.addEventListener('pointermove', dropListener);
    dest2.addEventListener('pointermove', dropListener);

    setTimeout(() => {
        // через минимальное время отключаем проверялку для исключения ложных попаданий
        dest1.removeEventListener('pointermove', dropListener);
        dest2.removeEventListener('pointermove', dropListener);
    }, 100);

    // Отключили перемещалку
    document.body.removeEventListener('pointermove', moveListener);
    debug && console.log('Кинули: ', event.pageX, event.pageY);
};

// Отпустить (событие постоянно висит)
move.addEventListener('pointerup', drop);
