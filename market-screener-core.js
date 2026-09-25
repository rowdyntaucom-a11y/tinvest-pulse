function tableRows(block) {
  const columns = Array.isArray(block?.columns) ? block.columns : [];
  const data = Array.isArray(block?.data) ? block.data : [];
  return data.map(row => {
    const out = {};
    for (let i = 0; i < columns.length; i++) out[columns[i]] = row?.[i];
    return out;
  });
}

function finite(...values) {
  for (const value of values) {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function text(value) {
  const s = String(value ?? '').trim();
  return s || null;
}

function normalizeMoexScreener(payload) {
  const securities = tableRows(payload?.securities);
  const marketdata = tableRows(payload?.marketdata);
  const marketById = new Map(marketdata.map(row => [String(row.SECID || '').trim(), row]));

  const rows = [];
  for (const sec of securities) {
    const secid = text(sec.SECID);
    if (!secid) continue;
    const md = marketById.get(secid) || {};
    const prev = finite(sec.PREVPRICE);
    const last = finite(md.LAST, md.MARKETPRICE, md.MARKETPRICE2, md.WAPRICE, prev);
    if (last == null || last <= 0) continue;
    const dayChangePct = finite(
      md.LASTTOPREVPRICE,
      prev && prev > 0 ? (last / prev - 1) * 100 : null
    );
    const turnoverRub = finite(md.VALTODAY_RUR, md.VALTODAY, 0) ?? 0;
    const volume = finite(md.VOLTODAY, 0) ?? 0;
    const trades = finite(md.NUMTRADES, 0) ?? 0;
    const high = finite(md.HIGH);
    const low = finite(md.LOW);
    const open = finite(md.OPEN);
    const rangePct = high != null && low != null && last > 0 ? (high - low) / last * 100 : null;

    rows.push({
      secid,
      name: text(sec.SHORTNAME) || secid,
      lotSize: finite(sec.LOTSIZE),
      listingLevel: finite(sec.LISTLEVEL),
      prevPrice: prev,
      last,
      dayChangePct,
      turnoverRub,
      volume,
      trades,
      open,
      high,
      low,
      rangePct,
    });
  }

  rows.sort((a,b) => (b.turnoverRub || 0) - (a.turnoverRub || 0) || a.secid.localeCompare(b.secid));
  return rows;
}

module.exports = { tableRows, normalizeMoexScreener };
