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

const destListener = function (event) {
    if (event.type === 'pointerout') {
        blockOver = 0;
        event.target.classList.remove('over');
    } else {
        if (event.target.id === 'dest1' || event.target.parentElement.id === 'dest1') {
            blockOver = 1;
            document.getElementById('dest1').classList.add('over');
        }
        if (event.target.id === 'dest2' || event.target.parentElement.id === 'dest2') {
            blockOver = 2;
            document.getElementById('dest2').classList.add('over');
        }
    }
    debug && console.log(event.type, event.target, blockOver);
    // debug && console.log('***', event.type, event.target);
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

    document.body.addEventListener('pointermove', moveListener); // Движение
    // контроль попадания
    dest1.addEventListener('pointerover', destListener); // Наведение
    dest2.addEventListener('pointerover', destListener);
    dest1.addEventListener('pointerout', destListener); // Снятие
    dest2.addEventListener('pointerout', destListener);
});

// Событие при опускании
const drop = function (event) {
    // Скрыли таскалку
    move.classList.add('hidden');

    // перемещение
    document.body.removeEventListener('pointermove', moveListener);
    // контроль попадания
    dest1.removeEventListener('pointerover', destListener); // Наведение
    dest2.removeEventListener('pointerover', destListener);
    dest1.removeEventListener('pointerout', destListener); // Снятие
    dest2.removeEventListener('pointerout', destListener);
    debug && console.log('Кинули: ', event.pageX, event.pageY);
    if (blockOver) {
        const blockTarget = blockOver === 1 ? dest1 : dest2;
        blockTarget.classList.remove('over');
        debug && console.log('Попали: ', blockTarget);

        const elem = document.createElement('div'); // элемент для вставки
        // eslint-disable-next-line no-plusplus
        elem.innerHTML = `Элемент номер ${++blockCounter}`;
        elem.style.backgroundColor = move.style.backgroundColor;
        blockTarget.append(elem);

        if (blockTarget === dest1) {
            // Костыль по установке высоты элементу (фону)
            if (dest1.children.length > 9) {
                // 101 - высота блока, 3 - кол-во блоков в строке
                const newHeight = 101 * (1 + parseInt(dest1.children.length / 3, 10));
                console.log(dest1.children.length, newHeight);
                document.styleSheets[0].cssRules[0].style.height = `${newHeight}px`;
            }
        } else {
            let top = dest2.scrollTop + event.layerY - posY; // Отступ сверху
            const deltaTop = top < 0 ? -top : 0;
            top = top < 0 ? 0 : top;
            let left = dest2.scrollLeft + event.layerX - posX; // Отступ слева
            const deltaLeft = left < 0 ? -left : 0;
            left = left < 0 ? 0 : left;

            if (deltaTop + deltaLeft) {
                for (const block of dest2.children) {
                    block.style.top = parseInt(block.style.top, 10) + deltaTop;
                    block.style.left = parseInt(block.style.left, 10) + deltaLeft;
                    console.log(block.style.top, block.style.left);
                }
                dest2.scrollTop = deltaTop;
                dest2.scrollLeft = deltaLeft;
            }

            elem.style.top = top;
            elem.style.left = left;
            console.log(top, left, deltaTop, deltaLeft);
        }

        blockOver = 0; // обнулили блок
    }
};

// Отпустить (событие постоянно висит)
move.addEventListener('pointerup', drop);
