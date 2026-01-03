const symbols = {
  "NIFTY": "^NSEI",
  "BANK NIFTY": "^NSEBANK",
  "FIN NIFTY": "NIFTY_FIN_SERVICE.NS",
  "SENSEX": "^BSESN",
  "GOLD": "GC=F",
  "SILVER": "SI=F",
  "CRUDE": "CL=F"
};

// CORS-safe proxy
const PROXY = "https://cors.isomorphic-git.org/";

async function getMarketData() {
  const symbolList = Object.values(symbols).join(",");
  const url = `${PROXY}https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolList}`;

  const res = await fetch(url);
  const json = await res.json();
  return json.quoteResponse.result;
}

async function getNews(query) {
  const rss = `https://news.google.com/rss/search?q=${query}+market+India`;
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rss)}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.items && data.items.length > 0) {
    return { title: data.items[0].title, link: data.items[0].link };
  }
  return { title: "No major news available", link: "#" };
}

async function loadDashboard() {
  const table = document.getElementById("marketTable");

  try {
    const marketData = await getMarketData();

    marketData.forEach(async item => {
      const name = Object.keys(symbols).find(k => symbols[k] === item.symbol);

      if (!name) return;

      const price = item.regularMarketPrice ?? item.previousClose ?? "N/A";
      const changePct = item.regularMarketChangePercent ?? 0;
      const trend = changePct >= 0 ? "UP 📈" : "DOWN 📉";

      const news = await getNews(name);

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${name}</td>
        <td>${price}</td>
        <td>${changePct.toFixed(2)}%</td>
        <td class="${changePct >= 0 ? 'up' : 'down'}">${trend}</td>
        <td><a href="${news.link}" target="_blank">${news.title}</a></td>
      `;
      table.appendChild(row);
    });

  } catch (err) {
    table.innerHTML += `
      <tr>
        <td colspan="5">⚠️ Data temporarily unavailable</td>
      </tr>`;
  }
}

loadDashboard();
