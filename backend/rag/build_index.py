import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rag_engine import build_vector_store, FAISS_INDEX_PATH, DATA_PATH

def main():
    print("=" * 50)
    print("  DREAM2PLAN — FAISS Index Builder")
    print("=" * 50)

    # Check if knowledge base file exists
    if not os.path.exists(DATA_PATH):
        print(f"❌ Knowledge base not found at: {DATA_PATH}")
        print("   Please add india_startup_knowledge.txt to backend/data/")
        sys.exit(1)

    # Check file size
    size_kb = os.path.getsize(DATA_PATH) / 1024
    print(f"📄 Knowledge base size: {size_kb:.1f} KB")

    # Check if index already exists
    if os.path.exists(FAISS_INDEX_PATH):
        print(f"⚠️  Existing index found at: {FAISS_INDEX_PATH}")
        print("   Rebuilding with updated knowledge base...")
    else:
        print("🆕 No existing index found. Building fresh...")

    # Build the index
    vector_store = build_vector_store()

    if vector_store:
        print("=" * 50)
        print("✅ Index built successfully!")
        print(f"   Saved to: {FAISS_INDEX_PATH}")
        print("   Restart your backend server now.")
        print("=" * 50)
    else:
        print("=" * 50)
        print("❌ Failed to build index. Check errors above.")
        print("=" * 50)
        sys.exit(1)

if __name__ == "__main__":
    main()