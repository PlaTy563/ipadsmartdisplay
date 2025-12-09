const API_KEY = 'd296586f1668c901aff613627ef18035';
const CITY_NAME = 'Gifu';
const LANG = 'en';

// DOM Elements
const els = {
    hTen: document.getElementById('h-ten'),
    hOne: document.getElementById('h-one'),
    mTen: document.getElementById('m-ten'),
    mOne: document.getElementById('m-one'),
    date: document.getElementById('date-text'),
    temp: document.getElementById('temperature'),
    wDesc: document.getElementById('weather-desc'),
    wIcon: document.getElementById('weather-icon'),
    humidity: document.getElementById('humidity'),
    greeting: document.getElementById('greeting'),
    slider: document.getElementById('slider'),
    dot0: document.getElementById('dot-0'),
    dot1: document.getElementById('dot-1'),
    schedule: document.getElementById('schedule-list'),
    news: document.getElementById('news-list')
};

// --- Clock Logic ---
let previousTime = { h1: null, h2: null, m1: null, m2: null };

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');

    // Update Slider UI if page changed or something? No, keep separate.

    flipDigit(els.hTen, h[0], 'h1');
    flipDigit(els.hOne, h[1], 'h2');
    flipDigit(els.mTen, m[0], 'm1');
    flipDigit(els.mOne, m[1], 'm2');

    updateDate(now);
    updateGreeting(now.getHours());
}

function updateGreeting(hour) {
    let text = '';
    if (hour >= 5 && hour < 12) text = 'Good Morning';
    else if (hour >= 12 && hour < 18) text = 'Good Afternoon';
    else if (hour >= 18 && hour < 22) text = 'Good Evening';
    else text = 'Good Night';

    if (els.greeting.innerText !== text) els.greeting.innerText = text;
}

function flipDigit(element, newVal, key) {
    const oldVal = previousTime[key];
    if (oldVal === newVal) return;
    previousTime[key] = newVal;
    if (oldVal === null) {
        setStaticNumber(element, newVal);
        return;
    }
    const topHalf = element.querySelector('.top-half .flip-text');
    const bottomHalf = element.querySelector('.bottom-half .flip-text');
    const topFlip = element.querySelector('.top-flip .flip-text');
    const bottomFlip = element.querySelector('.bottom-flip .flip-text');

    topHalf.innerText = newVal;
    bottomHalf.innerText = oldVal;
    topFlip.innerText = oldVal;
    bottomFlip.innerText = newVal;

    element.classList.remove('animate');
    void element.offsetWidth;
    element.classList.add('animate');
    setTimeout(() => {
        setStaticNumber(element, newVal);
        element.classList.remove('animate');
    }, 600);
}

function setStaticNumber(element, val) {
    element.querySelector('.top-half .flip-text').innerText = val;
    element.querySelector('.bottom-half .flip-text').innerText = val;
    element.querySelector('.top-flip .flip-text').innerText = val;
    element.querySelector('.bottom-flip .flip-text').innerText = val;
}

function updateDate(date) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' };
    els.date.innerText = date.toLocaleDateString('ja-JP', options);
}

// --- Weather Logic ---
// DEBUG: Set to true to cycle through weathers for testing
let DEBUG_WEATHER = false;

async function fetchWeather() {
    if (DEBUG_WEATHER) {
        showDemoWeather();
        return;
    }

    if (!API_KEY) return;
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&units=metric&lang=${LANG}&appid=${API_KEY}`;
        const response = await fetch(url);
        // ... (rest of logic)
        if (!response.ok) {
            els.temp.innerText = response.status === 401 ? 'Wait...' : `Err:${response.status}`;
            return;
        }
        const data = await response.json();
        updateWeatherUI(Math.round(data.main.temp), data.weather[0].description, data.main.humidity, data.weather[0].icon);
    } catch (e) { console.error(e); }
}

function updateWeatherUI(temp, desc, humidity, iconCode) {
    els.temp.innerText = `${temp}°C`;
    els.wDesc.innerText = desc;
    els.humidity.innerText = `Humidity: ${humidity}%`;
    els.wIcon.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@4x.png" alt="${desc}">`;
}

// Demo Data
let demoIndex = 0;
const demoData = [
    { temp: 25, desc: 'Clear Sky', hum: 40, icon: '01d' },
    { temp: 18, desc: 'Few Clouds', hum: 60, icon: '03d' },
    { temp: 10, desc: 'Light Rain', hum: 85, icon: '09d' },
    { temp: 5, desc: 'Thunderstorm', hum: 90, icon: '11d' },
    { temp: -2, desc: 'Snow', hum: 50, icon: '13d' }
];

function showDemoWeather() {
    const w = demoData[demoIndex];
    updateWeatherUI(w.temp, w.desc, w.hum, w.icon);
    demoIndex = (demoIndex + 1) % demoData.length;
}

// --- Swipe Logic ---
let startX = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let isDragging = false;
let currentIndex = 0;

els.slider.addEventListener('touchstart', touchStart);
els.slider.addEventListener('touchmove', touchMove);
els.slider.addEventListener('touchend', touchEnd);
els.slider.addEventListener('mousedown', touchStart);
els.slider.addEventListener('mousemove', touchMove);
els.slider.addEventListener('mouseup', touchEnd);
els.slider.addEventListener('mouseleave', () => { if (isDragging) touchEnd() });

function touchStart(event) {
    // Only drag if not interacting with scrollable content (simple check usually ok)
    startX = getPositionX(event);
    isDragging = true;
    els.slider.style.transition = 'none';
}

function touchMove(event) {
    if (!isDragging) return;
    const currentX = getPositionX(event);
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
    els.slider.style.transform = `translateX(${currentTranslate}px)`;
}

function touchEnd() {
    isDragging = false;
    const movedBy = currentTranslate - prevTranslate;
    if (movedBy < -100 && currentIndex < 1) currentIndex += 1;
    if (movedBy > 100 && currentIndex > 0) currentIndex -= 1;
    setPositionByIndex();
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

function setPositionByIndex() {
    currentTranslate = currentIndex * -window.innerWidth;
    prevTranslate = currentTranslate;
    els.slider.style.transition = 'transform 0.3s ease-out';
    els.slider.style.transform = `translateX(${currentTranslate}px)`;
    updateDots();
}

function updateDots() {
    if (currentIndex === 0) {
        els.dot0.classList.add('active');
        els.dot1.classList.remove('active');
    } else {
        els.dot0.classList.remove('active');
        els.dot1.classList.add('active');
    }
}

// --- Dashboard Logic (Schedule & QR News) ---

function renderSchedule() {
    // Mock Schedule Data
    const scheduleData = [
        { time: '09:00', title: '朝会 / Morning Meeting' },
        { time: '10:30', title: 'デザインレビュー' },
        { time: '12:00', title: 'ランチ' },
        { time: '14:00', title: '開発集中タイム' },
        { time: '18:00', title: 'ジムに行く' },
        { time: '20:00', title: '映画鑑賞' }
    ];

    let html = '';
    scheduleData.forEach(item => {
        html += `
            <div class="schedule-item">
                <div class="schedule-time">${item.time}</div>
                <div class="schedule-title">${item.title}</div>
            </div>
        `;
    });
    els.schedule.innerHTML = html;
}

function fetchNews() {
    // Mock News with URLs
    const newsData = [
        { title: "JAXA新型ロケット打ち上げ成功、軌道投入", source: "Science Daily", url: "https://www.jaxa.jp" },
        { title: "Apple、新しいiPadシリーズを発表か", source: "Tech News", url: "https://www.apple.com" },
        { title: "東京都心の気温、12月としては異例の暖かさ", source: "Weather JP", url: "https://weather.yahoo.co.jp" },
        { title: "円相場、一時145円台前半で推移", source: "Finance Watch", url: "https://finance.yahoo.co.jp" }
    ];

    let html = '';
    newsData.forEach(item => {
        // Generate QR Code URL (using qrserver API)
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(item.url)}`;

        html += `
            <div class="news-item">
                <div class="news-content">
                    <div class="news-title">${item.title}</div>
                    <div class="news-source">${item.source}</div>
                </div>
                <div class="news-qr">
                    <img src="${qrUrl}" alt="QR Code">
                </div>
            </div>
        `;
    });
    els.news.innerHTML = html;
}

// Init
updateClock();
setInterval(updateClock, 1000);

if (typeof DEBUG_WEATHER !== 'undefined' && DEBUG_WEATHER) {
    fetchWeather();
    setInterval(fetchWeather, 3000);
} else {
    fetchWeather();
    setInterval(fetchWeather, 600000);
}

renderSchedule();
fetchNews();
