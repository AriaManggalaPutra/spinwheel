// Daftar pakaian tradisional dan pertanyaannya
const sectors = [
  { 
    color: "#FFBC03", 
    text: "#333333", 
    label: "Kebaya", 
    image: "image/kebaya.jpeg", // Tambahkan path gambar
    questions: ["Apa asal daerah Kebaya?", "Kebaya biasanya dipadukan dengan kain apa?"] 
  }, 
  { 
    color: "#FF5A10", 
    text: "#333333", 
    label: "Batik", 
    image: "image/batik.jpeg",
    questions: ["Batik diakui oleh UNESCO pada tahun berapa?", "Sebutkan salah satu motif batik terkenal!"] 
  },  { color: "#FFBC03", text: "#333333", label: "Ulos", questions: ["Ulos berasal dari suku apa?", "Apa arti simbolik kain Ulos?"] },
  { color: "#FF5A10", text: "#333333", label: "Payas Agung", questions: ["Payas Agung berasal dari daerah mana?", "Apa ciri khas dari pakaian ini?"] },
  { color: "#FFBC03", text: "#333333", label: "Baju Bodo", questions: ["Apa keunikan Baju Bodo?", "Baju Bodo digunakan dalam acara apa?"] },
  { color: "#FF5A10", text: "#333333", label: "Pakaian Saibatin", questions: ["Pakaian Saibatin berasal dari mana?", "Apa bahan utama Pakaian Saibatin?"] },
  { color: "#FFBC03", text: "#333333", label: "Ta’a dan Sapei Sapaq", questions: ["Apa arti motif pada Ta’a dan Sapei Sapaq?", "Pakaian ini berasal dari suku apa?"] },
  { color: "#FF5A10", text: "#333333", label: "Koteka", questions: ["Koteka digunakan oleh suku mana?", "Apa bahan utama pembuatan Koteka?"] },
];

let spinCount = 0;
const maxSpins = 3;

const prizeResult = document.getElementById("prizeResult");
const spinCountDisplay = document.getElementById("spinCount");

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

// Fungsi hasil terkontrol
function getControlledResult() {
  return Math.floor(Math.random() * sectors.length); // Random sektor
}

function calculateTargetAngle(targetIndex) {
  const fullSpins = 5;
  const sectorAngle = (2 * Math.PI) / sectors.length;
  const targetAngle = fullSpins * 2 * Math.PI + (sectors.length - targetIndex) * sectorAngle;
  return targetAngle;
}

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991;
let angVel = 0;
let ang = 0;
let targetAngle = 0;
let isSpinning = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i; // Sudut awal sektor
  ctx.save();

  // Menggambar sektor
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // Garis pembatas antar sektor
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Menulis teks di tengah sektor
  ctx.translate(rad, rad); // Pusatkan ke tengah roda
  ctx.rotate(ang + arc / 2); // Rotasi teks agar sejajar sektor
  ctx.textAlign = "center"; // Posisi teks rata tengah
  ctx.textBaseline = "middle"; // Teks berada di tengah secara vertikal
  ctx.fillStyle = sector.text;
  ctx.font = "bold 18px 'Lato', sans-serif"; // Ukuran font

  // Posisi teks (di tengah sektor, sedikit ke dalam)
  ctx.fillText(sector.label, rad * 0.6, 0);

  ctx.restore();
}


function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  spinEl.textContent = !isSpinning ? "SPIN" : sector.label;
}

function frame() {
  if (!isSpinning) return;

  angVel *= friction;

  if (angVel < 0.002) {
    isSpinning = false;
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector);
    return;
  }

  ang += angVel;
  ang %= TAU;
  rotate();
}

function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate();
  engine();

  spinEl.addEventListener("click", () => {
    if (spinCount < maxSpins && !isSpinning) {
      const targetIndex = getControlledResult();
      targetAngle = calculateTargetAngle(targetIndex);
      angVel = rand(0.25, 0.45);
      isSpinning = true;
      
      spinCount++;
      spinCountDisplay.textContent = spinCount;
    } else if (spinCount >= maxSpins) {
      Swal.fire({
        title: "Batas Putar Tercapai!",
        text: "Anda telah mencapai batas maksimal putaran",
        icon: "warning",
        confirmButtonText: "OK",
        confirmButtonColor: "#d33"
      });
    }
  });
}

init();

events.addListener("spinEnd", (sector) => {
  prizeResult.textContent = sector.label;

  Swal.fire({
    title: `Pertanyaan tentang ${sector.label}`,
    html: `
      <p>1. ${sector.questions[0]}</p>
      <p>2. ${sector.questions[1]}</p>
    `,
    imageUrl: sector.image, // Menampilkan gambar
    imageWidth: 200, // Lebar gambar
    imageAlt: `Gambar ${sector.label}`, // Alt text
    icon: "question",
    confirmButtonText: "OK",
    confirmButtonColor: "#3085d6",
    customClass: {
      popup: 'swal2-custom-popup'
    }
  });
});

