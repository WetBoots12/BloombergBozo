#!/usr/bin/env python3
"""
BloombergBozo Data Scraper
===========================
Scrapes financial data from public sources using requests + BeautifulSoup.
Serves as a local data bridge when browser CORS restrictions block direct API calls.

Usage:
    # Install deps
    pip install -r requirements.txt

    # Run as a local API server (the HTML app will call http://localhost:8765)
    python scraper.py --server

    # Or run once and dump JSON to stdout
    python scraper.py --ticker AAPL

Data sources scraped:
    - Yahoo Finance (quotes, profiles, historical data)
    - Finviz (fundamentals, sector data)
    - Macrotrends (historical macro data)
    - StockAnalysis.com (earnings, revenue)
"""

import argparse
import json
import time
import sys
import re
from datetime import datetime, timedelta
from typing import Optional
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERROR: Missing dependencies. Run: pip install -r requirements.txt")
    sys.exit(1)

# ─── HEADERS ─────────────────────────────────────────────────────────────────

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/html, */*",
    "Accept-Language": "en-US,en;q=0.9",
}

SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# Simple in-memory cache
_cache: dict = {}
CACHE_TTL = 30  # seconds

def cached_get(url: str, ttl: int = CACHE_TTL, **kwargs) -> Optional[requests.Response]:
    key = url
    if key in _cache:
        data, ts = _cache[key]
        if time.time() - ts < ttl:
            return data
    try:
        resp = SESSION.get(url, timeout=10, **kwargs)
        resp.raise_for_status()
        _cache[key] = (resp, time.time())
        return resp
    except Exception as e:
        print(f"[scraper] GET {url} failed: {e}", file=sys.stderr)
        return None


# ─── YAHOO FINANCE SCRAPER ────────────────────────────────────────────────────

def get_yahoo_quote(ticker: str) -> dict:
    """Scrape real-time quote from Yahoo Finance chart API."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"interval": "1d", "range": "1d"}
    resp = cached_get(url, params=params)
    if not resp:
        return {}

    try:
        data = resp.json()
        meta = data["chart"]["result"][0]["meta"]
        return {
            "symbol":        ticker.upper(),
            "price":         meta.get("regularMarketPrice", 0),
            "change":        meta.get("regularMarketChange", 0),
            "changePercent": meta.get("regularMarketChangePercent", 0),
            "open":          meta.get("regularMarketOpen", 0),
            "high":          meta.get("regularMarketDayHigh", 0),
            "low":           meta.get("regularMarketDayLow", 0),
            "prevClose":     meta.get("regularMarketPreviousClose", 0),
            "volume":        meta.get("regularMarketVolume", 0),
            "marketCap":     meta.get("marketCap", 0),
            "currency":      meta.get("currency", "USD"),
            "exchangeName":  meta.get("exchangeName", ""),
            "timestamp":     int(time.time()),
            "source":        "yahoo-finance",
        }
    except (KeyError, IndexError, TypeError) as e:
        print(f"[scraper] Yahoo quote parse error for {ticker}: {e}", file=sys.stderr)
        return {}


def get_yahoo_chart(ticker: str, range_str: str = "1mo", interval: str = "1d") -> list:
    """Scrape OHLCV chart data from Yahoo Finance."""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
    params = {"interval": interval, "range": range_str}
    resp = cached_get(url, ttl=300, params=params)
    if not resp:
        return []

    try:
        data = resp.json()
        result = data["chart"]["result"][0]
        timestamps = result["timestamp"]
        quote = result["indicators"]["quote"][0]

        rows = []
        for i, ts in enumerate(timestamps):
            close = quote["close"][i]
            if close is None:
                continue
            rows.append({
                "date":   datetime.utcfromtimestamp(ts).strftime("%Y-%m-%d"),
                "open":   round(quote["open"][i] or 0, 2),
                "high":   round(quote["high"][i] or 0, 2),
                "low":    round(quote["low"][i] or 0, 2),
                "close":  round(close, 2),
                "volume": int(quote["volume"][i] or 0),
            })
        return rows
    except (KeyError, IndexError, TypeError) as e:
        print(f"[scraper] Yahoo chart parse error for {ticker}: {e}", file=sys.stderr)
        return []


def get_yahoo_profile(ticker: str) -> dict:
    """Scrape company profile from Yahoo Finance summary."""
    url = f"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{ticker}"
    params = {"modules": "assetProfile,summaryDetail,price"}
    resp = cached_get(url, ttl=600, params=params)
    if not resp:
        return {}

    try:
        data = resp.json()
        result = data["quoteSummary"]["result"][0]
        profile = result.get("assetProfile", {})
        detail  = result.get("summaryDetail", {})
        price   = result.get("price", {})

        return {
            "symbol":      ticker.upper(),
            "name":        price.get("longName") or price.get("shortName", ticker),
            "exchange":    price.get("exchangeName", ""),
            "currency":    price.get("currency", "USD"),
            "sector":      profile.get("sector", ""),
            "industry":    profile.get("industry", ""),
            "description": profile.get("longBusinessSummary", ""),
            "marketCap":   detail.get("marketCap", {}).get("raw", 0),
            "peRatio":     detail.get("trailingPE", {}).get("raw", 0),
            "week52High":  detail.get("fiftyTwoWeekHigh", {}).get("raw", 0),
            "week52Low":   detail.get("fiftyTwoWeekLow", {}).get("raw", 0),
            "employees":   profile.get("fullTimeEmployees", 0),
            "country":     profile.get("country", "US"),
            "website":     profile.get("website", ""),
            "source":      "yahoo-finance",
        }
    except (KeyError, IndexError, TypeError) as e:
        print(f"[scraper] Yahoo profile parse error for {ticker}: {e}", file=sys.stderr)
        return {}


# ─── FINVIZ SCRAPER ───────────────────────────────────────────────────────────

def get_finviz_fundamentals(ticker: str) -> dict:
    """Scrape key fundamentals from Finviz (P/E, EPS, beta, etc.)"""
    url = f"https://finviz.com/quote.ashx?t={ticker}&p=d"
    resp = cached_get(url, ttl=600)
    if not resp:
        return {}

    try:
        soup = BeautifulSoup(resp.text, "html.parser")
        # Finviz stores fundamentals in a table with class "snapshot-table2"
        table = soup.find("table", class_=re.compile("snapshot"))
        if not table:
            return {}

        cells = table.find_all("td")
        data = {}
        for i in range(0, len(cells) - 1, 2):
            key   = cells[i].get_text(strip=True)
            value = cells[i + 1].get_text(strip=True)
            data[key] = value

        def safe_float(s: str) -> float:
            try:
                return float(s.replace(",", "").replace("%", "").replace("B", "e9").replace("M", "e6").replace("K", "e3"))
            except (ValueError, AttributeError):
                return 0.0

        return {
            "peRatio":      safe_float(data.get("P/E", "0")),
            "forwardPE":    safe_float(data.get("Forward P/E", "0")),
            "eps":          safe_float(data.get("EPS (ttm)", "0")),
            "beta":         safe_float(data.get("Beta", "0")),
            "shortFloat":   data.get("Short Float", ""),
            "rsi14":        safe_float(data.get("RSI (14)", "0")),
            "avgVolume":    safe_float(data.get("Avg Volume", "0")),
            "relVolume":    safe_float(data.get("Rel Volume", "0")),
            "earningsDate": data.get("Earnings", ""),
            "dividendYield":safe_float(data.get("Dividend %", "0")),
            "priceTgt":     safe_float(data.get("Target Price", "0")),
            "analystRec":   data.get("Recom.", ""),
            "insider":      data.get("Insider Own", ""),
            "source":       "finviz",
        }
    except Exception as e:
        print(f"[scraper] Finviz parse error for {ticker}: {e}", file=sys.stderr)
        return {}


# ─── MULTIPLE QUOTES ─────────────────────────────────────────────────────────

def get_multiple_quotes(tickers: list) -> list:
    results = []
    for ticker in tickers:
        q = get_yahoo_quote(ticker)
        if q:
            results.append(q)
        time.sleep(0.1)  # polite delay
    return results


# ─── LOCAL HTTP SERVER ────────────────────────────────────────────────────────
# The HTML app can call http://localhost:8765/api/... endpoints

class ScraperHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        path   = parsed.path

        def json_response(data: dict | list, status: int = 200):
            body = json.dumps(data).encode()
            self.send_response(status)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)

        try:
            if path == "/api/quote":
                ticker = params.get("ticker", ["AAPL"])[0].upper()
                json_response(get_yahoo_quote(ticker))

            elif path == "/api/chart":
                ticker   = params.get("ticker", ["AAPL"])[0].upper()
                rng      = params.get("range",    ["1mo"])[0]
                interval = params.get("interval", ["1d"])[0]
                json_response(get_yahoo_chart(ticker, rng, interval))

            elif path == "/api/profile":
                ticker = params.get("ticker", ["AAPL"])[0].upper()
                json_response(get_yahoo_profile(ticker))

            elif path == "/api/fundamentals":
                ticker = params.get("ticker", ["AAPL"])[0].upper()
                yp = get_yahoo_profile(ticker)
                fv = get_finviz_fundamentals(ticker)
                json_response({**yp, **fv})

            elif path == "/api/quotes":
                tickers_raw = params.get("tickers", [""])[0]
                tickers = [t.strip().upper() for t in tickers_raw.split(",") if t.strip()]
                json_response(get_multiple_quotes(tickers))

            elif path == "/api/health":
                json_response({"status": "ok", "timestamp": int(time.time())})

            else:
                json_response({"error": "Unknown endpoint"}, 404)

        except Exception as e:
            json_response({"error": str(e)}, 500)

    def log_message(self, fmt, *args):
        print(f"[scraper] {self.address_string()} - {fmt % args}")


def run_server(port: int = 8765):
    server = HTTPServer(("127.0.0.1", port), ScraperHandler)
    print(f"[scraper] Local API server running at http://localhost:{port}")
    print(f"[scraper] Endpoints:")
    print(f"[scraper]   GET /api/quote?ticker=AAPL")
    print(f"[scraper]   GET /api/chart?ticker=AAPL&range=1mo&interval=1d")
    print(f"[scraper]   GET /api/profile?ticker=AAPL")
    print(f"[scraper]   GET /api/fundamentals?ticker=AAPL  (Yahoo + Finviz)")
    print(f"[scraper]   GET /api/quotes?tickers=AAPL,MSFT,NVDA")
    print(f"[scraper] Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[scraper] Stopped.")


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="BloombergBozo Data Scraper")
    parser.add_argument("--server",      action="store_true", help="Run as local API server")
    parser.add_argument("--port",        type=int, default=8765, help="Server port (default: 8765)")
    parser.add_argument("--ticker",      type=str, help="Scrape a single ticker and print JSON")
    parser.add_argument("--chart",       type=str, help="Scrape chart data for ticker")
    parser.add_argument("--range",       type=str, default="1mo", help="Chart range (1d,5d,1mo,3mo,6mo,1y,5y)")
    parser.add_argument("--interval",    type=str, default="1d",  help="Chart interval (1m,5m,15m,30m,1h,1d,1wk)")
    parser.add_argument("--fundamentals",type=str, help="Scrape Finviz fundamentals for ticker")
    parser.add_argument("--watchlist",   type=str, help="Comma-separated list of tickers to quote")
    args = parser.parse_args()

    if args.server:
        run_server(args.port)

    elif args.ticker:
        result = get_yahoo_quote(args.ticker.upper())
        print(json.dumps(result, indent=2))

    elif args.chart:
        result = get_yahoo_chart(args.chart.upper(), args.range, args.interval)
        print(json.dumps(result, indent=2))

    elif args.fundamentals:
        yp = get_yahoo_profile(args.fundamentals.upper())
        fv = get_finviz_fundamentals(args.fundamentals.upper())
        print(json.dumps({**yp, **fv}, indent=2))

    elif args.watchlist:
        tickers = [t.strip().upper() for t in args.watchlist.split(",")]
        result = get_multiple_quotes(tickers)
        print(json.dumps(result, indent=2))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
