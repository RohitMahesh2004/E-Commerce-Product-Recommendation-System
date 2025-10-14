import os
import pandas as pd
from google import genai
import json

# ======================================================
# 🔑 Configure Gemini Client
# ======================================================
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY", "AIzaSyBxz_0rS01gPLoxMcupUa9voc47M_WVyx0"))

# ======================================================
# ⚙️ Load CSV File
# ======================================================
csv_path = "/Users/rohitmahesh/Desktop/E-commerce-Product-Recommender/backend/uploads/sample__catalog.csv"

if not os.path.exists(csv_path):
    raise FileNotFoundError(f"❌ CSV file not found at: {csv_path}")

df = pd.read_csv(csv_path)
print(f"📄 Loaded catalog with {len(df)} rows and {len(df.columns)} columns.")

# Limit rows and truncate descriptions
if len(df) > 10:
    df = df.head(10)
    print(f"⚠️ Limited to {len(df)} rows to stay within token limits")

# ======================================================
# 🧠 Step 1 — Convert CSV to Compact Format
# ======================================================
essential_cols = ['name', 'price', 'rating', 'description'] if all(col in df.columns for col in ['name', 'price', 'rating', 'description']) else df.columns[:4]
df_compact = df[essential_cols].copy()

# Truncate descriptions to 100 characters (increased for better analysis)
if 'description' in df_compact.columns:
    df_compact['description'] = df_compact['description'].astype(str).str[:100]

# Convert to compact string format
products_list = []
for idx, row in df_compact.iterrows():
    product_str = " | ".join([f"{col}: {row[col]}" for col in df_compact.columns])
    products_list.append(f"{idx+1}. {product_str}")

catalog_text = "\n".join(products_list)

# ======================================================
# 🧩 Step 2 — Build Ultra-Compact Prompt
# ======================================================
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

# ======================================================
# 🚀 Step 3 — Generate Response with Optimized Settings
# ======================================================
try:
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config={
            "temperature": 0.3,
            "top_p": 0.9,
            "max_output_tokens": 4500,  # Increased for complete response
            "response_mime_type": "application/json",
            "candidate_count": 1,
        },
    )

    # ======================================================
    # ✅ Step 4 — Extract and Display Output
    # ======================================================
    print("\n✅ Gemini Response Received\n")
    
    output_text = None
    
    # Extract text from response
    if hasattr(response, 'text') and response.text:
        output_text = response.text
    elif hasattr(response, 'candidates') and len(response.candidates) > 0:
        candidate = response.candidates[0]
        if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
            if len(candidate.content.parts) > 0:
                output_text = candidate.content.parts[0].text
    
    if output_text:
        try:
            # Clean and parse JSON
            cleaned_text = output_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned_text.startswith('```'):
                cleaned_text = cleaned_text.split('```')[1]
                if cleaned_text.startswith('json'):
                    cleaned_text = cleaned_text[4:]
            
            result = json.loads(cleaned_text)
            
            print("✅ Analysis Complete!\n")
            print(f"🏆 BEST PRODUCT: {result['best_product']}")
            print(f"\n💡 WHY YOU SHOULD BUY THIS:\n")
            for i, reason in enumerate(result['reasoning'], 1):
                print(f"   {i}. {reason}")
            
            if 'alternatives' in result and result['alternatives']:
                print(f"\n🥈 Similar Alternatives:")
                for idx, alt in enumerate(result['alternatives'], 1):
                    print(f"   {idx}. {alt}")
            
            print("\n" + "="*70)
            print("📄 Full JSON Response:")
            print(json.dumps(result, indent=2))
            
        except json.JSONDecodeError as e:
            print("⚠️ JSON parsing failed. Raw response:")
            print(output_text)
            print(f"\nError: {e}")
            
    else:
        print("⚠️ No text output. Details:")
        if hasattr(response, 'candidates') and len(response.candidates) > 0:
            print(f"Finish reason: {response.candidates[0].finish_reason}")
        if hasattr(response, 'usage_metadata'):
            print(f"Token usage: {response.usage_metadata}")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()