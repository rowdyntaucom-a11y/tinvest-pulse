// TINVEST PULSE — frontend
// Данные загружаются с /api/portfolio

const state = {
  data: null,
  loading: false,
  error: null
};

const $ = (selector) => document.querySelector(selector);

function money(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(Number(value)) + " ₽";
}

function percent(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  const n = Number(value);
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}

function date(value) {
  if (!value) return "—";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) return String(value);

  return d.toLocaleDateString("ru-RU");
}

function number(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "—";
  }

  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2
  }).format(Number(value));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function createStyles() {
  if (document.getElementById("pulse-styles")) return;

  const style = document.createElement("style");
  style.id = "pulse-styles";

  style.textContent = `
    * {
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      font-family:
        Inter,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        Roboto,
        Arial,
        sans-serif;
      background: #0b0d12;
      color: #f4f5f7;
    }

    body {
      overflow-x: hidden;
    }

    .pulse-app {
      width: 100%;
      max-width: 520px;
      min-height: 100vh;
      margin: 0 auto;
      padding: 12px;
      background:
        radial-gradient(circle at 90% 0%, rgba(76, 105, 255, .18), transparent 32%),
        radial-gradient(circle at 0% 45%, rgba(0, 220, 170, .08), transparent 30%),
        #0b0d12;
    }

    .pulse-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 9px;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, #7d8cff, #5366ff);
      box-shadow: 0 8px 25px rgba(83,102,255,.25);
      font-size: 19px;
      font-weight: 900;
    }

    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -.4px;
    }

    .brand-subtitle {
      margin-top: 2px;
      font-size: 10px;
      color: #8e95a4;
    }

    .refresh {
      border: 0;
      color: #fff;
      background: #191d27;
      border: 1px solid #292e3a;
      border-radius: 11px;
      width: 39px;
      height: 39px;
      font-size: 18px;
    }

    .hero {
      position: relative;
      overflow: hidden;
      padding: 17px;
      border-radius: 20px;
      background:
        linear-gradient(145deg, rgba(40,46,67,.95), rgba(18,21,29,.98));
      border: 1px solid #2b3040;
      box-shadow: 0 16px 40px rgba(0,0,0,.22);
      margin-bottom: 10px;
    }

    .hero::after {
      content: "";
      position: absolute;
      width: 180px;
      height: 180px;
      right: -80px;
      top: -80px;
      border-radius: 50%;
      background: rgba(100,115,255,.16);
      filter: blur(10px);
    }

    .label {
      color: #9ba2b1;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: .8px;
    }

    .portfolio-value {
      margin-top: 4px;
      font-size: 32px;
      line-height: 1.05;
      font-weight: 850;
      letter-spacing: -1.2px;
    }

    .hero-row {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 12px;
      margin-top: 12px;
    }

    .growth {
      font-size: 18px;
      font-weight: 800;
    }

    .positive {
      color: #5fe0a7;
    }

    .negative {
      color: #ff707c;
    }

    .muted {
      color: #858d9d;
    }

    .period {
      text-align: right;
      font-size: 10px;
      color: #858d9d;
    }

    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 9px;
      margin-bottom: 10px;
    }

    .card {
      padding: 13px;
      min-height: 86px;
      border-radius: 17px;
      background: #12151c;
      border: 1px solid #252a35;
    }

    .card-title {
      font-size: 10px;
      color: #858d9d;
      text-transform: uppercase;
      letter-spacing: .5px;
      margin-bottom: 7px;
    }

    .card-value {
      font-size: 18px;
      font-weight: 800;
    }

    .card-small {
      margin-top: 4px;
      font-size: 10px;
      color: #858d9d;
    }

    .section {
      margin-bottom: 10px;
      padding: 13px;
      border-radius: 17px;
      background: #12151c;
      border: 1px solid #252a35;
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    .section-title {
      font-size: 13px;
      font-weight: 800;
    }

    .section-caption {
      color: #737b8c;
      font-size: 9px;
    }

    .chart {
      width: 100%;
      height: 135px;
      display: block;
    }

    .assets {
      display: flex;
      gap: 7px;
      overflow: hidden;
    }

    .asset {
      min-width: 70px;
      padding: 9px 7px;
      border-radius: 12px;
      background: #191d26;
      border: 1px solid #292e39;
      text-align: center;
    }

    .asset-name {
      font-size: 11px;
      font-weight: 800;
    }

    .asset-value {
      margin-top: 3px;
      font-size: 9px;
      color: #858d9d;
    }

    .leaders {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .leader {
      padding: 10px;
      border-radius: 13px;
      background: #191d26;
      border: 1px solid #292e39;
    }

    .leader-name {
      font-size: 12px;
      font-weight: 800;
    }

    .leader-result {
      margin-top: 3px;
      font-size: 14px;
      font-weight: 800;
    }

    .pulse-button {
      width: 100%;
      height: 48px;
      border: 0;
      border-radius: 15px;
      color: white;
      font-size: 14px;
      font-weight: 850;
      letter-spacing: .2px;
      background: linear-gradient(135deg, #6476ff, #4659ec);
      box-shadow: 0 10px 28px rgba(75,91,238,.3);
      margin-bottom: 8px;
    }

    .updated {
      text-align: center;
      font-size: 9px;
      color: #666e7d;
      padding-bottom: 5px;
    }

    .loading,
    .error {
      padding: 25px;
      text-align: center;
      color: #8e95a4;
    }

    .error {
      color: #ff8790;
    }

    @media (max-height: 700px) {
      .pulse-app {
        padding: 8px;
      }

      .portfolio-value {
        font-size: 27px;
      }

      .card {
        min-height: 73px;
        padding: 10px;
      }

      .section {
        padding: 10px;
        margin-bottom: 7px;
      }

      .chart {
        height: 105px;
      }

      .hero {
        padding: 13px;
      }
    }
  `;

  document.head.appendChild(style);
}

function render(data) {
  const root = $("#app");

  const value =
    data?.portfolioValue ??
    data?.value ??
    data?.totalValue ??
    data?.portfolio?.value ??
    0;

  const growth =
    data?.growth ??
    data?.returnPercent ??
    data?.profitPercent ??
    data?.portfolio?.growth ??
    0;

  const profit =
    data?.profit ??
    data?.profitRub ??
    data?.portfolio?.profit ??
    0;

  const startDate =
    data?.startDate ??
    data?.createdAt ??
    data?.portfolioStartDate ??
    data?.portfolio?.startDate;

  const passiveIncome =
    data?.averageMonthlyPassiveIncome ??
    data?.passiveIncomeMonthly ??
    data?.monthlyPassiveIncome ??
    0;

  const cagr =
    data?.cagr ??
    data?.annualReturn ??
    data?.xirr ??
    0;

  const imoex =
    data?.imoexReturn ??
    data?.imoex ??
    0;

  const assets = safeArray(
    data?.assets ??
    data?.positions ??
    data?.portfolio?.assets
  );

  const gainers = safeArray(
    data?.topGainers ??
    data?.gainers
  );

  const losers = safeArray(
    data?.topLosers ??
    data?.losers
  );

  const history = safeArray(
    data?.history ??
    data?.chart ??
    data?.portfolioHistory
  );

  const growthClass = Number(growth) >= 0 ? "positive" : "negative";
  const cagrClass = Number(cagr) >= 0 ? "positive" : "negative";

  root.innerHTML = `
    <main class="pulse-app">

      <header class="pulse-header">
        <div class="brand">
          <div class="brand-icon">↗</div>
          <div>
            <div class="brand-title">TINVEST PULSE</div>
            <div class="brand-subtitle">Investment dashboard</div>
          </div>
        </div>

        <button class="refresh" id="refreshBtn" title="Обновить">
          ↻
        </button>
      </header>

      <section class="hero">
        <div class="label">Стоимость портфеля</div>

        <div class="portfolio-value">
          ${money(value)}
        </div>

        <div class="hero-row">
          <div>
            <div class="growth ${growthClass}">
              ${percent(growth)}
            </div>

            <div class="card-small">
              Результат: ${money(profit)}
            </div>
          </div>

          <div class="period">
            <div>Портфель с</div>
            <strong>${date(startDate)}</strong>
            <div>по ${date(new Date())}</div>
          </div>
        </div>
      </section>

      <section class="grid">

        <div class="card">
          <div class="card-title">Пассивный доход</div>
          <div class="card-value">
            ${money(passiveIncome)}
          </div>
          <div class="card-small">
            среднее в месяц
          </div>
        </div>

        <div class="card">
          <div class="card-title">CAGR / XIRR</div>
          <div class="card-value ${cagrClass}">
            ${percent(cagr)}
          </div>
          <div class="card-small">
            годовая доходность
          </div>
        </div>

      </section>

      <section class="section">

        <div class="section-head">
          <div class="section-title">Доходность</div>
          <div class="section-caption">
            PORTFOLIO / IMOEX
          </div>
        </div>

        <canvas class="chart" id="chart"></canvas>

        <div class="section-caption">
          Портфель: <strong>${percent(cagr)}</strong>
          &nbsp; · &nbsp;
          IMOEX: <strong>${percent(imoex)}</strong>
        </div>

      </section>

      <section class="section">

        <div class="section-head">
          <div class="section-title">Активы</div>
          <div class="section-caption">
            ${assets.length} позиций
          </div>
        </div>

        <div class="assets">
          ${
            assets.length
              ? assets.slice(0, 7).map((asset) => `
                  <div class="asset">
                    <div class="asset-name">
                      ${asset.ticker ?? asset.name ?? "—"}
                    </div>
                    <div class="asset-value">
                      ${money(asset.value ?? asset.amount ?? 0)}
                    </div>
                  </div>
                `).join("")
              : `<div class="muted">Нет данных об активах</div>`
          }
        </div>

      </section>

      <section class="section">

        <div class="section-head">
          <div class="section-title">Лидеры</div>
          <div class="section-caption">за период</div>
        </div>

        <div class="leaders">

          <div class="leader">
            <div class="card-title">TOP GAINER</div>
            <div class="leader-name">
              ${gainers[0]?.ticker ?? gainers[0]?.name ?? "—"}
            </div>
            <div class="leader-result positive">
              ${percent(gainers[0]?.return ?? gainers[0]?.percent ?? 0)}
            </div>
          </div>

          <div class="leader">
            <div class="card-title">TOP LOSER</div>
            <div class="leader-name">
              ${losers[0]?.ticker ?? losers[0]?.name ?? "—"}
            </div>
            <div class="leader-result negative">
              ${percent(losers[0]?.return ?? losers[0]?.percent ?? 0)}
            </div>
          </div>

        </div>

      </section>

      <button class="pulse-button" id="pulseBtn">
        ✦ PULSE — СОЗДАТЬ СНИМОК
      </button>

      <div class="updated">
        Обновлено: ${new Date().toLocaleString("ru-RU")}
      </div>

    </main>
  `;

  $("#refreshBtn").onclick = loadData;
  $("#pulseBtn").onclick = makePulse;

  drawChart(history);
}

function drawChart(history) {
  const canvas = $("#chart");

  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  const ctx = canvas.getContext("2d");

  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;

  ctx.clearRect(0, 0, width, height);

  let values = history
    .map((x) => Number(x?.value ?? x?.portfolio ?? x))
    .filter((x) => Number.isFinite(x));

  if (values.length < 2) {
    values = [100, 101, 99, 104, 103, 108, 112, 111, 118, 121];
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const padding = 8;

  ctx.beginPath();

  values.forEach((value, index) => {
    const x =
      padding +
      (index / (values.length - 1)) *
        (width - padding * 2);

    const y =
      height -
      padding -
      ((value - min) / range) *
        (height - padding * 2);

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });

  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.strokeStyle = "#7180ff";
  ctx.stroke();

  // точка последнего значения
  const last = values[values.length - 1];

  const lx =
    padding +
    (width - padding * 2);

  const ly =
    height -
    padding -
    ((last - min) / range) *
      (height - padding * 2);

  ctx.beginPath();
  ctx.arc(lx, ly, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(lx, ly, 2, 0, Math.PI * 2);
  ctx.fillStyle = "#7180ff";
  ctx.fill();
}

async function loadData() {
  if (state.loading) return;

  state.loading = true;

  const root = $("#app");

  if (root) {
    root.innerHTML = `
      <div class="pulse-app">
        <div class="loading">
          Загрузка портфеля…
        </div>
      </div>
    `;
  }

  try {
    const response = await fetch("/api/portfolio", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "API ответил с кодом " + response.status
      );
    }

    const data = await response.json();

    state.data = data;
    state.error = null;

    render(data);

  } catch (error) {

    console.error(error);

    state.error = error;

    if (root) {
      root.innerHTML = `
        <div class="pulse-app">

          <header class="pulse-header">
            <div class="brand">
              <div class="brand-icon">↗</div>
              <div>
                <div class="brand-title">TINVEST PULSE</div>
                <div class="brand-subtitle">
                  Investment dashboard
                </div>
              </div>
            </div>
          </header>

          <section class="section">
            <div class="error">
              Не удалось получить данные портфеля.
              <br><br>
              Проверь server.js и API-токен.
              <br><br>
              <button class="refresh" id="retryBtn">
                ↻ Повторить
              </button>
            </div>
          </section>

        </div>
      `;

      $("#retryBtn").onclick = loadData;
    }
  }

  state.loading = false;
}

async function makePulse() {
  try {
    const button = $("#pulseBtn");

    if (button) {
      button.textContent = "✦ PULSE...";
    }

    // Сначала пробуем серверный screenshot endpoint.
    try {
      const response = await fetch("/api/pulse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        const result = await response.json();

        if (result.url) {
          window.open(result.url, "_blank");
          return;
        }
      }
    } catch (_) {
      // Если endpoint пока отсутствует —
      // просто сохраняем страницу через браузер.
    }

    // Fallback для телефона:
    // открываем печатную версию, которую можно
    // сохранить как PDF / сделать скриншот.
    window.print();

  } finally {
    const button = $("#pulseBtn");

    if (button) {
      button.textContent = "✦ PULSE — СОЗДАТЬ СНИМОК";
    }
  }
}

function start() {
  createStyles();

  const root = document.getElementById("app");

  if (!root) {
    document.body.innerHTML = `
      <div id="app"></div>
    `;
  }

  loadData();

  // Автообновление каждые 60 секунд.
  setInterval(loadData, 60000);

  // Обновляем график при изменении размера экрана.
  window.addEventListener("resize", () => {
    if (state.data) {
      drawChart(
        state.data.history ??
        state.data.chart ??
        state.data.portfolioHistory ??
        []
      );
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
