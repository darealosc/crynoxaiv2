from langchain_community.llms import Ollama
from langchain_community.document_loaders import PyPDFLoader
from langchain.prompts import PromptTemplate
from langchain_community.vectorstores import DocArrayInMemorySearch
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from sys import argv

# 1. Create the model
llm = Ollama(model='llama3.2-vision:latest')
embeddings = HuggingFaceEmbeddings(model_name='sentence-transformers/all-MiniLM-L6-v2')

# 2. Load the PDF file and create a retriever to be used for providing context
loader = PyPDFLoader(argv[1])
pages = loader.load_and_split()
store = DocArrayInMemorySearch.from_documents(pages, embedding=embeddings)
retriever = store.as_retriever()

# 3. Create the prompt template
template = """
Answer the question based only on the context provided.

Context: {context}

Question: {question}
"""

prompt = PromptTemplate.from_template(template)

def format_docs(docs):
  return "\n\n".join(doc.page_content for doc in docs)

# 4. Build the chain of operations
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

# 5. Start asking questions and getting answers in a loop
while True:
  question = input('What do you want to learn from the document?\n')
  print()
  print(chain.invoke({'question': question}))
  print()