
const participants = [
    { name: "SURIAGA", image: "./images/SURIAGA.jpg" },
    { name: "ENDAYA", image: "./images/ENDAYA.png" },
    { name: "FLORES", image: "./images/FLORES.png" },
    { name: "MAGPANTAY", image: "./images/MAGPANTAY.jpg" },
    { name: "MARTINEZ", image: "./images/MARTINEZ.jpg" },
    { name: "MEDRANO", image: "./images/MEDRANO.jpg" },
    { name: "FRAGIO", image: "./images/FRAGIO.jpg" },
    { name: "CALINGASIN", image: "./images/CALINGASIN.jpg" },
    { name: "SARMIENTO", image: "./images/SARMIENTO.jpg" },
    { name: "PAPIO", image: "./images/PAPIO.jpg" },
    { name: "CAYMO", image: "./images/CAYMO.jpg" },
    { name: "BALINTON", image: "./images/BALINTON.jpg" },
    { name: "ILAO", image: "./images/ILAO.jpg" },
    { name: "DE GUZMAN", image: "./images/DE GUZMAN.jpg" },
    { name: "MERCADO", image: "./images/MERCADO.jpg" },
    { name: "DELA CRUZ", image: "./images/DELA CRUZ.jpg" },
    { name: "DE SAGUN", image: "./images/DE SAGUN.jpg" },
    { name: "LOYOLA", image: "./images/LOYOLA.jpg" },
    { name: "MORALES", image: "./images/MORALES.jpg" },
    { name: "ROSALES", image: "./images/ROSALES.jpg" },
    { name: "CABANIG", image: "./images/CABANIG.jpg" },
    { name: "ACLAN", image: "./images/ACLAN.jpg" },
    { name: "REYNOSO", image: "./images/REYNOSO.jpg" },
    { name: "DIMAANO", image: "./images/DIMAANO.jpg" },
    { name: "GRUTAS", image: "./images/GRUTAS.jpg" },
    { name: "BARRION", image: "./images/BARRION.jpg" },
    { name: "FANER", image: "./images/FANER.jpg" },
    { name: "RAMOS", image: "./images/RAMOS.jpg" },
    { name: "QUESADA", image: "./images/QUESADA.jpg" },
    { name: "DUGA", image: "./images/DUGA.jpg" },
    { name: "UMALI", image: "./images/UMALI.jpg" },
    { name: "ARANAS", image: "./images/ARANAS.jpg" },
    { name: "ANGAT", image: "./images/ANGAT.jpg" },
    { name: "OBTIAL", image: "./images/OBTIAL.jpg" },
    { name: "BERMUDO", image: "./images/BERMUDO.jpg" },
    { name: "ASILO", image: "./images/ASILO.jpg" },
    { name: "FABRERO", image: "./images/FABRERO.jpg" },
    { name: "DIMAILIG", image: "./images/DIMAILIG.jpg" }
];

const track = document.getElementById('track');
const scanBtn = document.getElementById('scan-btn');
const reticle = document.getElementById('reticle');
const flash = document.getElementById('flash');
const modal = document.getElementById('winner-modal');
const winnerCard = document.getElementById('winner-card');
const winnerImg = document.getElementById('winner-img');
const winnerName = document.getElementById('winner-name');

let position = 0;
let velocity = 0;
let isSpinning = false;
let animationFrameId;
let targetLocked = false;
let DOMItems = [];

// Shuffle Array 
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function buildTrack() {
    track.innerHTML = '';
    DOMItems = [];
    
    const shuffled = shuffle([...participants]);
    const trackData = [...shuffled, ...shuffled, ...shuffled, ...shuffled]; 

    trackData.forEach((participant, index) => {
        const item = document.createElement('div');
        item.className = 'w-48 h-48 md:w-64 md:h-64 flex-shrink-0 border-8 border-orange-950 bg-black overflow-hidden relative opacity-40 transition-opacity duration-200 shadow-lg';
        
        const img = document.createElement('img');
        img.src = participant.image;
        img.className = 'w-full h-full object-cover mix-blend-luminosity brightness-75';
        
        item.appendChild(img);
        track.appendChild(item);
        
        DOMItems.push({
            element: item,
            data: participant,
            index: index
        });
    });

    position = 0;
    track.style.transform = `translateX(0px)`;
}

function updatePhysics() {
    if (!isSpinning) return;

    position -= velocity; 
    
    if (targetLocked) {
        velocity *= 0.975; 
    }

    if (targetLocked && velocity < 1.5) {
        velocity = 0;
        isSpinning = false;
        
        const screenCenter = window.innerWidth / 2;
        let closestItem = null;
        let minDistance = Infinity;

        DOMItems.forEach(itemObj => {
            const rect = itemObj.element.getBoundingClientRect();
            const itemCenter = rect.left + rect.width / 2;
            const distance = Math.abs(screenCenter - itemCenter);

            if (distance < minDistance) {
                minDistance = distance;
                closestItem = itemObj;
            }
        });

        //snap the closest image perfectly to the center
        const winnerRect = closestItem.element.getBoundingClientRect();
        const winnerCenter = winnerRect.left + winnerRect.width / 2;
        const snapOffset = screenCenter - winnerCenter;

        position += snapOffset;
        track.style.transform = `translateX(${position}px)`;
        
        // Highlight 
        const winner = closestItem.data;
        closestItem.element.classList.remove('opacity-40');
        closestItem.element.classList.add('border-red-500', 'opacity-100');
        closestItem.element.querySelector('img').classList.remove('mix-blend-luminosity', 'brightness-75');
        
        triggerShotSequence(winner);
        return; 
    }

    track.style.transform = `translateX(${position}px)`;
    animationFrameId = requestAnimationFrame(updatePhysics);
}

// Start the Roll
function startScan() {
    if (isSpinning) return;
    
    buildTrack(); 
    isSpinning = true;
    targetLocked = false;
    velocity = 60 + Math.random() * 20; // Very fast initial speed
    
    scanBtn.disabled = true;
    scanBtn.innerText = "HUNTING...";
    reticle.classList.add('is-scanning');
    
    updatePhysics();

    // Lock onto target 
    setTimeout(() => {
        targetLocked = true;
    }, 1500 + Math.random() * 1500);
}

function triggerShotSequence(winner) {
    reticle.classList.remove('is-scanning');
    
    //Flash and Shake
    flash.classList.add('flash-active');
    document.body.classList.add('shake-active');
    
    setTimeout(() => {
        flash.classList.remove('flash-active');
        document.body.classList.remove('shake-active');
    }, 400);

    // Pop up
    setTimeout(() => {
        // Insert data
        winnerImg.src = winner.image;
        winnerName.innerText = winner.name;
        
        modal.classList.remove('hidden');
        
        // Animate pop-in
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            winnerCard.classList.remove('scale-500');
            winnerCard.classList.add('scale-100');
        }, 50);
        
        // Reset Button
        scanBtn.disabled = false;
        scanBtn.innerText = "FIRE ZAPPER!";
    }, 800);
}

// Close the modal by clicking anywhere on it
modal.addEventListener('click', (e) => {
    if(e.target === modal) {
        modal.classList.add('opacity-0');
        winnerCard.classList.remove('scale-100');
        winnerCard.classList.add('scale-500');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 500);
    }
});

scanBtn.addEventListener('click', startScan);

// Build the track when the page loads
buildTrack();