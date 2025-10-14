# ======================================================
# gemini_client.py
# ======================================================

import os
import json
import pandas as pd
from google import genai

# ✅ Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyBxz_0rS01gPLoxMcupUa9voc47M_WVyx0"))

# ======================================================
# 🧠 Function: analyze_catalog
# ======================================================
def analyze_catalog(file_path: str) -> dict:
    """
    Reads a product catalog (CSV, XLSX, JSON) and uses Gemini 2.5 Flash
    to pick the best product, explain why, and suggest alternatives.
    """

    if not os.path.exists(file_path):
        return {"status": "error", "message": f"File not found: {file_path}"}

    # --- Load dataset ---
    ext = os.path.splitext(file_path)[-1].lower()
    if ext == ".csv":
        df = pd.read_csv(file_path)
    elif ext in (".xls", ".xlsx"):
        df = pd.read_excel(file_path)
    elif ext == ".json":
        df = pd.read_json(file_path)
    else:
        return {"status": "error", "message": "Unsupported file type."}

    # --- Trim dataset to avoid token overflow ---
    if len(df) > 5:
        df = df.head(5)

    print(f"📄 Loaded catalog with {len(df)} rows and {len(df.columns)} columns.")

    # --- Compact representation for Gemini ---
    essential_cols = (
        ["name", "price", "rating", "description"]
        if all(col in df.columns for col in ["name", "price", "rating", "description"])
        else df.columns[:4]
    )
    df_compact = df[essential_cols].copy()

    if "description" in df_compact.columns:
        df_compact["description"] = df_compact["description"].astype(str).str[:100]

    products_list = []
    for idx, row in df_compact.iterrows():
        product_str = " | ".join([f"{col}: {row[col]}" for col in df_compact.columns])
        products_list.append(f"{idx+1}. {product_str}")

    catalog_text = "\n".join(products_list)

    # --- Build concise prompt ---
    prompt = f"""Analyze these products and recommend the best one based on VALUE, FEATURES, and RATING.

{catalog_text}

Provide compelling, data-driven reasoning with specific numbers and comparisons. Keep each reason under 50 words.

JSON format:
{{
  "best_product": "<exact name>",
  "reasoning": [
    "<specific feature/spec that stands out>",
    "<price-to-performance comparison with numbers>",
    "<unique selling point or rating insight>"
  ],
  "alternatives": ["<exact name>", "<exact name>"]
}}"""

    # --- Call Gemini ---
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "temperature": 0.3,
                "top_p": 0.9,
                "max_output_tokens": 4000,
                "response_mime_type": "application/json",
                "candidate_count": 1,
            },
        )

        # ✅ FIXED: Correct way to extract text from response
        output_text = None
        
        if hasattr(response, 'text') and response.text:
            output_text = response.text
        elif hasattr(response, 'candidates') and len(response.candidates) > 0:
            candidate = response.candidates[0]
            if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                if len(candidate.content.parts) > 0:
                    output_text = candidate.content.parts[0].text

        if not output_text:
            print(f"⚠️ Debug - Response object: {response}")
            if hasattr(response, 'candidates'):
                print(f"⚠️ Finish reason: {response.candidates[0].finish_reason}")
            return {"status": "error", "message": "No output received from Gemini."}

        # --- Parse JSON ---
        cleaned = output_text.strip()
        
        # Remove markdown code blocks if present
        if cleaned.startswith("```"):
            cleaned = cleaned.split("```")[1]
            if cleaned.startswith("json"):
                cleaned = cleaned[4:]
        
        result = json.loads(cleaned)

        return {
            "status": "success",
            "result": result,
        }

    except json.JSONDecodeError as e:
        print(f"❌ JSON parsing error: {e}")
        print(f"Raw output: {output_text}")
        return {"status": "error", "message": f"JSON parsing failed: {str(e)}"}
    
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        import traceback
        traceback.print_exc()
        return {"status": "error", "message": str(e)}