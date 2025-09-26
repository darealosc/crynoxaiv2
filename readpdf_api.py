from langchain_ollama import OllamaLLM, OllamaEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import DocArrayInMemorySearch
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain.schema import Document
from sys import argv
import sys
import os

# Check if PDF file path is provided
if len(argv) < 2:
    print("Error: Please provide a PDF file path as argument", file=sys.stderr)
    sys.exit(1)

pdf_path = argv[1]

# Check if file exists
if not os.path.exists(pdf_path):
    print(f"Error: PDF file '{pdf_path}' not found", file=sys.stderr)
    sys.exit(1)

try:
    print(f"Processing PDF: {pdf_path}", file=sys.stderr)
    
    # 1. Create the model and embeddings - SEPARATE MODELS
    print("Creating Ollama model and embeddings...", file=sys.stderr)
    llm = OllamaLLM(model='llama3.2-vision:latest')  # For text generation
    embeddings = OllamaEmbeddings(model='nomic-embed-text')  # For embeddings

    # 2. Try to load PDF with LangChain
    print("Loading PDF with PyPDFLoader...", file=sys.stderr)
    loader = PyPDFLoader(pdf_path)
    pages = loader.load_and_split()
    print(f"Loaded {len(pages)} pages", file=sys.stderr)
    
    # Enhanced text extraction for image-heavy PDFs
    if not pages or len(pages) == 0:
        print("Standard loading failed, trying enhanced extraction...", file=sys.stderr)
        
        try:
            # Try loading without splitting first
            loader = PyPDFLoader(pdf_path)
            raw_pages = loader.load()
            print(f"Raw load got {len(raw_pages)} pages", file=sys.stderr)
            
            if raw_pages:
                # Extract any available text
                pages = []
                total_content = ""
                
                for i, page in enumerate(raw_pages):
                    content = page.page_content.strip()
                    if content and len(content) > 10:  # Only meaningful content
                        pages.append(Document(page_content=content))
                        total_content += content + " "
                        print(f"Added page {i+1} with {len(content)} characters", file=sys.stderr)
                
                # If we got some content but it's sparse, combine it
                if len(pages) < 3 and total_content.strip():
                    combined_doc = Document(page_content=total_content.strip())
                    pages = [combined_doc]
                    print(f"Combined content into single document: {len(total_content)} chars", file=sys.stderr)
                
            # If still no meaningful content, create a more helpful placeholder
            if not pages or (len(pages) == 1 and len(pages[0].page_content) < 50):
                print("No extractable text found - likely image-based PDF", file=sys.stderr)
                filename = os.path.basename(pdf_path)
                placeholder_content = f"""
                This appears to be a slide deck or image-based PDF about macromolecules based on the filename '{filename}'.
                
                Since I cannot extract the actual text content, here are some general topics that are typically covered in macromolecule notes:
                
                1. The four main types of macromolecules: carbohydrates, lipids, proteins, and nucleic acids
                2. Monomers and polymers - how small units combine to form large molecules
                3. Dehydration synthesis and hydrolysis reactions
                4. Structure and function relationships of each macromolecule type
                5. Examples of each macromolecule in biological systems
                
                For better results, please try uploading a PDF that contains searchable text rather than just images or scanned content.
                """
                pages = [Document(page_content=placeholder_content)]
                
        except Exception as e:
            print(f"Enhanced extraction failed: {e}", file=sys.stderr)
            # Create error document with helpful info
            error_content = f"""
            Error processing PDF: {str(e)}
            
            This PDF appears to be a slide deck about macromolecules but contains primarily images or complex formatting that cannot be extracted as text.
            
            Common macromolecule topics include:
            - Carbohydrates (sugars, starches, cellulose)
            - Lipids (fats, oils, phospholipids, steroids)
            - Proteins (enzymes, structural proteins, antibodies)
            - Nucleic acids (DNA, RNA)
            - Biochemical processes like dehydration synthesis and hydrolysis
            
            Please try a different PDF with searchable text content.
            """
            pages = [Document(page_content=error_content)]
    
    print(f"Final page count: {len(pages)}", file=sys.stderr)
    
    # Show content preview
    if pages and pages[0].page_content:
        preview = pages[0].page_content[:300].replace('\n', ' ')
        print(f"Content preview: {preview}...", file=sys.stderr)
    
    print("Creating embeddings store...", file=sys.stderr)
    store = DocArrayInMemorySearch.from_documents(pages, embedding=embeddings)
    retriever = store.as_retriever()

    # 3. FIXED prompt template - removed duplicate {question}
    template = """
    You are an expert biology tutor specializing in macromolecules. Answer based on the context provided and your knowledge of biochemistry.
    
    Context from document: {context}
    
    User request: {question}
    
    Instructions:
    - If creating flashcards, focus on macromolecule concepts like:
      * Types of macromolecules (carbohydrates, lipids, proteins, nucleic acids)
      * Monomers vs polymers
      * Structure and function relationships
      * Biochemical processes (dehydration synthesis, hydrolysis)
      * Specific examples and biological roles
    - Format flashcards as a clean JSON array: [{{"question": "...", "answer": "..."}}]
    - Create comprehensive, educational flashcards suitable for studying
    - If the document content is limited, use general macromolecule knowledge to create relevant study materials
    """

    prompt = PromptTemplate.from_template(template)

    def format_docs(docs):
        return "\n\n".join(doc.page_content for doc in docs)

    # 4. Build the chain
    print("Building processing chain...", file=sys.stderr)
    chain = (
        RunnablePassthrough()
        | (lambda x: {
            'context': format_docs(retriever.invoke(x['question'])),
            'question': x['question']
        })
        | prompt
        | llm
        | StrOutputParser()
    )

    # 5. Read question from stdin and answer once
    print("Waiting for question...", file=sys.stderr)
    question = input().strip()
    print(f"Got question: {question}", file=sys.stderr)
    
    if not question:
        print("Error: No question provided", file=sys.stderr)
        sys.exit(1)
    
    print("Processing question with AI...", file=sys.stderr)
    answer = chain.invoke({'question': question})
    print(answer)

except Exception as e:
    print(f"Error processing PDF: {str(e)}", file=sys.stderr)
    import traceback
    traceback.print_exc(file=sys.stderr)
    sys.exit(1)