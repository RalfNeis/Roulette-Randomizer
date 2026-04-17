// Full list of 38 participants
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

// The active pool of targets who haven't been picked yet
let activeParticipants = [...participants];

const track = document.getElementById('track');
const scanBtn = document.getElementById('scan-btn');
const resetBtn = document.getElementById('reset-btn'); // Grab the new button
const reticle = document.getElementById('reticle');
const flash = document.getElementById('flash');
const modal = document.getElementById('winner-modal');
const winnerCard = document.getElementById('winner-card');
const winnerImg = document.getElementById('winner-img');
const winnerName = document.getElementById('winner-name');

let position = 0;
let isSpinning = false;
let animationFrameId;
let DOMItems = [];

// Shuffle Array purely for visually scrambling the reel
function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

// Build the Reel
function buildTrack() {
    track.innerHTML = '';
    DOMItems = [];
    position = 0;
    track.style.transform = `translateX(0px)`;
    
    const shuffled1 = shuffle([...participants]);
    const shuffled2 = shuffle([...participants]);
    const shuffled3 = shuffle([...participants]);
    const shuffled4 = shuffle([...participants]);
    
    const trackData = [...shuffled1, ...shuffled2, ...shuffled3, ...shuffled4]; 

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
}

// Start the Roll
function startScan() {
    if (isSpinning) return;
    
    // Check if everyone has been picked
    if (activeParticipants.length === 0) {
        alert("ALL TARGETS ELIMINATED! Please press RESET to restock the deck.");
        return; // Stop function so they have to manually reset
    }
    
    isSpinning = true;

    // 1. Pick a truly random winner from the remaining ACTIVE pool
    const randomIndex = Math.floor(Math.random() * activeParticipants.length);
    const chosenWinner = activeParticipants[randomIndex];
    
    // 2. DELETE them from the active pool so they cannot be picked again
    activeParticipants.splice(randomIndex, 1);

    // 3. Build the visual track 
    buildTrack(); 
    
    // UI Updates
    scanBtn.disabled = true;
    scanBtn.innerText = `HUNTING... (${activeParticipants.length} LEFT)`;
    reticle.classList.add('is-scanning');
    
    // 4. Locate the chosen winner in the 3rd duplicated chunk of the track 
    let targetDOMItem = DOMItems.find((item, index) => 
        item.data.name === chosenWinner.name && 
        index >= participants.length * 2 && 
        index < participants.length * 3
    );

    // 5. Calculate the exact math required to land that specific image in the center
    const screenCenter = window.innerWidth / 2;
    const targetRect = targetDOMItem.element.getBoundingClientRect();
    const targetOffset = (screenCenter - (targetRect.left + targetRect.width / 2));
    
    // 6. Smooth Deceleration Physics
    let startTime = null;
    let startPos = 0;
    let duration = 3500 + Math.random() * 1500; // Spins for 3.5 to 5 seconds

    function animateSpin(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / duration;

        if (progress > 1) progress = 1;

        let ease = 1 - Math.pow(1 - progress, 3);

        position = startPos + (targetOffset - startPos) * ease;
        track.style.transform = `translateX(${position}px)`;

        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animateSpin);
        } else {
            // Animation finished! Lock target.
            isSpinning = false;
            targetDOMItem.element.classList.remove('opacity-40');
            targetDOMItem.element.classList.add('border-red-500', 'opacity-100');
            targetDOMItem.element.querySelector('img').classList.remove('mix-blend-luminosity', 'brightness-75');
            
            triggerShotSequence(chosenWinner);
        }
    }

    // Start the animation loop
    animationFrameId = requestAnimationFrame(animateSpin);
}

// The Zapper Shot and Cinematic Reveal
function triggerShotSequence(winner) {
    reticle.classList.remove('is-scanning');
    
    flash.classList.add('flash-active');
    document.body.classList.add('shake-active');
    
    setTimeout(() => {
        flash.classList.remove('flash-active');
        document.body.classList.remove('shake-active');
    }, 400);

    setTimeout(() => {
        winnerImg.src = winner.image;
        winnerName.innerText = winner.name;
        
        modal.classList.remove('hidden');
        
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            winnerCard.classList.remove('scale-500');
            winnerCard.classList.add('scale-100');
        }, 50);
        
        scanBtn.disabled = false;
        scanBtn.innerText = `FIRE ZAPPER! (${activeParticipants.length} LEFT)`;
    }, 800);
}

// Logic for the new Reset Button
function resetGame() {
    if (isSpinning) return; // Prevent resetting while the reel is actively spinning
    
    activeParticipants = [...participants]; // Refill the array
    scanBtn.innerText = `FIRE ZAPPER! (${activeParticipants.length} LEFT)`; // Update the UI
    buildTrack(); // Re-shuffle the reel visually
}

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
resetBtn.addEventListener('click', resetGame); // Bind the event listener to the reset button

// Build an initial track on page load so it's not empty
buildTrack();
scanBtn.innerText = `FIRE ZAPPER! (${activeParticipants.length} LEFT)`;