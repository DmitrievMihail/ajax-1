const debug = true;
const debugHTML = document.getElementById('debugHTML');
const debugCoords = document.getElementById('debugCoords');

const source = document.getElementById('source');
const move = document.getElementById('move');
const dest1 = document.getElementById('dest1');
const dest2 = document.getElementById('dest2');

let blockCounter = 0; // Счётчик блоков
let blockOver = 0; // Номеб блока в который кидаем
let posX = 0; // Позиция начального смещения по X и Y
let posY = 0;

function deb() {
    if (debug) {
        // eslint-disable-next-line prefer-template, prefer-rest-params
        debugHTML.innerHTML += Array.prototype.slice.call(arguments).join('\t') + '\n';
    }
}

// Событие-перемещалка (на body, потому что ездить может везде, даже за экраном)
const moveListener = function (event) {
    // eslint-disable-next-line no-use-before-define
    !event.pressure && dropListener(event); // если отпустили за экраном
    move.style.left = `${event.pageX - posX}px`;
    move.style.top = `${event.pageY - posY}px`;
    // eslint-disable-next-line prefer-template
    debugCoords.value = move.style.left + ', ' + move.style.top;
};

const destListener = function (event) {
    if (event.type === 'pointerout') {
        blockOver = 0;
        event.target.parentElement.classList.remove('over');
    } else {
        if (event.target.id === 'dest1' || event.target.parentElement.id === 'dest1') {
            blockOver = 1;
            document.getElementById('dest1').parentElement.classList.add('over');
        }
        if (event.target.id === 'dest2' || event.target.parentElement.id === 'dest2') {
            blockOver = 2;
            document.getElementById('dest2').parentElement.classList.add('over');
        }
    }
    debug && deb(event.type, event.target, blockOver);
};

// Событие хватание блока
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

    document.body.addEventListener('pointermove', moveListener); // Движение
    // контроль попадания
    dest1.addEventListener('pointerover', destListener); // Наведение
    dest2.addEventListener('pointerover', destListener);
    dest1.addEventListener('pointerout', destListener); // Снятие
    dest2.addEventListener('pointerout', destListener);
});

// Событие при опускании
const dropListener = function (event) {
    debug && console.log('Кинули');
    // Скрыли таскалку
    move.classList.add('hidden');
    deb('Кинули', event.pageX, event.pageY);
    console.log(event.target);

    // перемещение
    document.body.removeEventListener('pointermove', moveListener);
    // контроль попадания
    dest1.removeEventListener('pointerover', destListener); // Наведение
    dest2.removeEventListener('pointerover', destListener);
    dest1.removeEventListener('pointerout', destListener); // Снятие
    dest2.removeEventListener('pointerout', destListener);
    debug && console.log('Кинули: ', event.pageX, event.pageY);

    let offsetX = 0;
    let offsetY = 0;

    if (event.target.id === 'source') {
        // Это условие ТОЛЬКО для мобильного
        const elem = document.elementFromPoint(event.clientX, event.clientY); // Элемент на котором кликнули
        blockOver = 0;
        if (elem.id === 'dest1') {
            blockOver = 1;
        }
        if (elem.id === 'dest2') {
            blockOver = 2;
            const bounds = elem.getBoundingClientRect();
            console.log(bounds);
            offsetX = bounds.x - 16;
            offsetY = bounds.y - 16;
        }
        // console.log(document.elementFromPoint(event.clientX, event.clientY));
    }
    if (blockOver) {
        const blockTarget = blockOver === 1 ? dest1 : dest2;
        blockTarget.parentElement.classList.remove('over');
        debug && console.log('Попали: ', blockTarget.parentElement);

        const elem = document.createElement('div'); // элемент для вставки
        // eslint-disable-next-line no-plusplus
        elem.innerHTML = `Элемент номер ${++blockCounter}`;
        elem.style.backgroundColor = move.style.backgroundColor;
        blockTarget.append(elem);

        if (blockTarget === dest2) {
            // определяем относительные координаты top = y, left = x, если координаты отрицательные то зануляем их, а отрицательность превращаем в дельту
            let top = dest2.scrollTop + event.layerY - posY - offsetY; // Отступ сверху
            const deltaTop = top < 0 ? -top : 0;
            top = top < 0 ? 0 : top;
            let left = dest2.scrollLeft + event.layerX - posX - offsetX; // Отступ слева
            const deltaLeft = left < 0 ? -left : 0;
            left = left < 0 ? 0 : left;

            deb(top, deltaTop, left, deltaLeft);

            if (deltaTop + deltaLeft) {
                // Если вылезли за левый верхний край, то двигаем ВСЕ внутренние блоки на дельту вправо-вниз
                for (const block of dest2.children) {
                    block.style.top = parseInt(block.style.top, 10) + deltaTop + 'px';
                    block.style.left = parseInt(block.style.left, 10) + deltaLeft + 'px';
                }
                dest2.scrollTop = parseInt(dest2.scrollTop, 10) + deltaTop + 'px';
                dest2.scrollLeft = parseInt(dest2.scrollLeft, 10) + deltaLeft + 'px';
            }
            deb(top, deltaTop, left, deltaLeft);
            elem.style.top = `${top}px`;
            elem.style.left = `${left}px`;
        }
        blockOver = 0; // обнулили блок
    }
};

// Отпустить (событие постоянно висит)
move.addEventListener('pointerup', dropListener);
document.body.addEventListener('pointerup', dropListener);
