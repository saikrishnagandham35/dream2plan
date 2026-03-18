from langchain_community.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
import os

# Paths
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/india_startup_knowledge.txt")
FAISS_INDEX_PATH = os.path.join(os.path.dirname(__file__), "../data/faiss_index")

def get_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def build_vector_store():
    try:
        loader = TextLoader(DATA_PATH, encoding="utf-8")
        documents = loader.load()

        # Larger chunks = more context per retrieval, less info loss
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,   # was 500 — doubled for richer context
            chunk_overlap=150  # was 50 — more overlap = no info cut at boundaries
        )
        chunks = text_splitter.split_documents(documents)
        print(f"📄 Total chunks created: {len(chunks)}")

        embeddings = get_embeddings()
        vector_store = FAISS.from_documents(chunks, embeddings)
        vector_store.save_local(FAISS_INDEX_PATH)
        print("✅ FAISS Vector Store Built Successfully!")
        return vector_store

    except Exception as e:
        print(f"❌ FAISS Build Error: {e}")
        return None

def load_vector_store():
    try:
        embeddings = get_embeddings()
        if os.path.exists(FAISS_INDEX_PATH):
            vector_store = FAISS.load_local(
                FAISS_INDEX_PATH,
                embeddings,
                allow_dangerous_deserialization=True
            )
            print("✅ FAISS Index Loaded!")
            return vector_store
        else:
            print("⚠️ Index not found — building now...")
            return build_vector_store()

    except Exception as e:
        print(f"❌ FAISS Load Error: {e}")
        return None

def retrieve_context(query: str, k: int = 6) -> str:
    """
    Retrieve top-k relevant chunks from knowledge base.
    k=6 (was 3) — retrieves more relevant sections for richer context.
    """
    try:
        vector_store = load_vector_store()
        if vector_store is None:
            return ""

        docs = vector_store.similarity_search(query, k=k)
        context = "\n\n---\n\n".join([doc.page_content for doc in docs])
        return context

    except Exception as e:
        print(f"❌ Retrieval Error: {e}")
        return ""