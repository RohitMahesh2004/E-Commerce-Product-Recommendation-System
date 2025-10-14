import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyBk71fnK_Wkac6WKIUPLiVeod_aTYloODw")
genai.configure(api_key=GEMINI_API_KEY)

def explain_and_recommend(product_info: dict):
    """
    Uses Google Gemini to explain why the product is a good recommendation
    and suggest similar items.
    """
    title = product_info.get("title", "Unknown Product")
    price = product_info.get("price", "N/A")
    description = product_info.get("description", "No description available.")

    prompt = f"""
    You are an AI shopping assistant.
    Explain to a user why this product might be a good recommendation
    based on its features, benefits, and general appeal.

    Product Details:
    - Name: {title}
    - Price: {price}
    - Description: {description}

    Then, suggest 3–5 similar products (by type, feature, or brand)
    that they might also like.
    """

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)

        explanation = response.text.strip()
        return {"explanation": explanation}
    except Exception as e:
        print("❌ Gemini API Error:", e)
        return {"explanation": "Explanation unavailable. Gemini service error."}
