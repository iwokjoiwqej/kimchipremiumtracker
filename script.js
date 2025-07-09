const USD_KRW = 1400; // 현재 확정형 환율
const proxy = "https://your-proxy.vercel.app"; // 네가 지정한 Vercel Proxy

async function fetchData() {
  try {
    const upbitMarkets = await fetch(`${proxy}/upbit/markets`).then(r => r.json());
    const krwMarkets = upbitMarkets.filter(m => m.market.startsWith("KRW-"));
    const marketString = krwMarkets.map(m => m.market).join(",");

    const [upbitPrices, binancePrices] = await Promise.all([
      fetch(`${proxy}/upbit/ticker?markets=${marketString}`).then(r => r.json()),
      fetch(`${proxy}/binance`).then(r => r.json())
    ]);

    const tbody = document.getElementById("data-body");
    tbody.innerHTML = "";

    krwMarkets.forEach(market => {
      const coin = market.market.replace("KRW-", "");
      const upbit = upbitPrices.find(t => t.market === market.market);
      const binance = binancePrices.find(b => b.symbol === coin + "USDT");

      if (upbit && binance) {
        const upbitKRW = parseFloat(upbit.trade_price);
        const binanceKRW = parseFloat(binance.price) * USD_KRW;
        const premium = ((upbitKRW - binanceKRW) / binanceKRW * 100).toFixed(2);

        const row = `<tr>
          <td>${coin}</td>
          <td>${upbitKRW.toLocaleString()}\u20a9</td>
          <td>${binanceKRW.toLocaleString()}\u20a9</td>
          <td>${premium}%</td>
        </tr>`;
        tbody.innerHTML += row;
      }
    });

  } catch (err) {
    console.error("오류: ", err);
    document.getElementById("data-body").innerHTML = `<tr><td colspan='4'>패치에서 데이터를 로드할 수 없어요.</td></tr>`;
  }
}

fetchData();
setInterval(fetchData, 10000);