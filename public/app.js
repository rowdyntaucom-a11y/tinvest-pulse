const state = {
    portfolio: {
        value: 0,
        invested: 0,
        profit: 0,
        profitPercent: 0,
        startDate: "—"
    },
    assets: [],
    history: [],
    income: 0,
    imoex: 0
};

function money(value) {
    return new Intl.NumberFormat("ru-RU", {
        maximumFractionDigits: 0
    }).format(value || 0) + " ₽";
}

function percent(value) {
    const n = Number(value || 0);
    return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function dateRu(value) {
    if (!value) return "—";

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleDateString("ru-RU");
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function renderPortfolio(data) {
    const p = data.portfolio || {};

    setText("portfolioValue", money(p.value));
    setText("portfolioProfit", percent(p.profitPercent));

    const invested = Number(p.invested || 0);
    const value = Number(p.value || 0);
    const profit = Number(p.profit ?? value - invested);

    setText("invested", money(invested));
    setText("profitMoney", money(profit));
    setText("startDate", dateRu(p.startDate));
    setText("currentDate", new Date().toLocaleDateString("ru-RU"));

    const assets = data.assets || [];

    const list = document.getElementById("assetsList");

    if (list) {
        list.innerHTML = "";

        assets.slice(0, 6).forEach(asset => {
            const row = document.createElement("div");
            row.className = "asset-row";

            const change = Number(asset.change || 0);

            row.innerHTML = `
                <div class="asset-name">
                    <strong>${asset.name || asset.ticker || "Актив"}</strong>
                    <small>${asset.ticker || ""}</small>
                </div>

                <div class="asset-value">
                    ${money(asset.value || 0)}
                    <span class="${change >= 0 ? "up" : "down"}">
                        ${percent(change)}
                    </span>
                </div>
            `;

            list.appendChild(row);
        });
    }

    setText("passiveIncome", money(data.income || 0));
    setText("imoexReturn", percent(data.imoex || 0));

    renderTopAssets(assets);
    renderChart(data.history || []);
}

function renderTopAssets(assets) {
    const sorted = [...assets].sort(
        (a, b) => Number(b.change || 0) - Number(a.change || 0)
    );

    const winners = document.getElementById("topGainers");
    const losers = document.getElementById("topLosers");

    if (winners) {
        winners.innerHTML = sorted.slice(0, 3).map(asset => `
            <div class="mini-row">
                <span>${asset.ticker || asset.name || "—"}</span>
                <b class="up">${percent(asset.change)}</b>
            </div>
        `).join("");
    }

    if (losers) {
        losers.innerHTML = sorted.slice(-3).reverse().map(asset => `
            <div class="mini-row">
                <span>${asset.ticker || asset.name || "—"}</span>
                <b class="down">${percent(asset.change)}</b>
            </div>
        `).join("");
    }
}

function renderChart(history) {
    const canvas = document.getElementById("portfolioChart");

    if (!canvas || !history.length) return;

    const ctx = canvas.getContext("2d");

    const width = canvas.width = canvas.clientWidth * devicePixelRatio;
    const height = canvas.height = canvas.clientHeight * devicePixelRatio;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    const values = history.map(x => Number(x.value || 0));

    const min = Math.min(...values);
    const max = Math.max(...values);

    const range = max - min || 1;

    ctx.beginPath();

    values.forEach((value, index) => {
        const x = (index / Math.max(values.length - 1, 1)) * w;
        const y = h - ((value - min) / range) * (h - 20) - 10;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00d084";
    ctx.stroke();

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();

    ctx.fillStyle = "rgba(0,208,132,0.12)";
    ctx.fill();
}

async function loadPortfolio() {
    try {
        const response = await fetch("/api/portfolio", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("API error");
        }

        const data = await response.json();

        renderPortfolio(data);

    } catch (error) {
        console.log("API пока недоступен:", error);

        // Временные данные для проверки интерфейса
        renderPortfolio({
            portfolio: {
                value: 0,
                invested: 0,
                profit: 0,
                profitPercent: 0,
                startDate: "—"
            },
            assets: [],
            history: [],
            income: 0,
            imoex: 0
        });
    }
}

function pulse() {
    document.body.classList.add("pulse-animation");

    setTimeout(() => {
        document.body.classList.remove("pulse-animation");
    }, 700);
}

document.addEventListener("DOMContentLoaded", () => {

    const pulseButton = document.getElementById("pulse");

    if (pulseButton) {
        pulseButton.addEventListener("click", pulse);
    }

    loadPortfolio();

    // Автообновление каждые 60 секунд
    setInterval(loadPortfolio, 60000);
});
