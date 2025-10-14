# serpapi_client.py
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

SERP_API_KEY = os.getenv("SERP_API_KEY", "05fb4ef16f9353e9db0f575775041c4cf6494874c84cf6e3a37c2fc2bbdc3a16")

def search_amazon_products(query: str):
    """Fetch top 10 product results from SerpAPI (Amazon)"""
    url = "https://serpapi.com/search.json"
    params = {
        "engine": "amazon",
        "amazon_domain": "amazon.in",
        "api_key": SERP_API_KEY,
        "k": query
    }

    try:
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print("❌ API request failed:", e)
        return []

    if "error" in data:
        print("❌ SerpAPI Error:", data["error"])
        return []

    # Check common product result sections
    result_sections = [
        "shopping_results",
        "organic_results",
        "search_results",
        "category_results",
        "filters",
        "features",
        "items",
    ]

    products_data = None
    for key in result_sections:
        if key in data and isinstance(data[key], list) and len(data[key]) > 0:
            products_data = data[key]
            print(f"✅ Found results under key: {key}")
            break

    if not products_data:
        print("⚠️ No recognizable product results found.")
        return []

    # Normalize data into consistent format
    products = []
    for item in products_data[:12]:
        title = item.get("title") or item.get("name") or "Unknown Product"
        price = (
            item.get("price") or
            item.get("price_str") or
            item.get("price_symbol") or
            "N/A"
        )
        image = item.get("thumbnail") or item.get("image") or ""
        url = item.get("link") or item.get("product_link") or ""
        desc = (
            item.get("snippet") or
            item.get("description") or
            "No description available."
        )

        products.append({
            "title": title,
            "price": price,
            "image": image,
            "url": url,
            "description": desc
        })

    print(f"🛍️ Extracted {len(products)} product(s)")
    return products
