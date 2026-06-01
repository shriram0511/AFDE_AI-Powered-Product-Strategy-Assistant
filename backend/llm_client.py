import httpx
from openai import OpenAI

def get_client():
    return OpenAI(
        api_key="learner014",
        base_url="https://keygateway.arshnivlabs.com/v1",
        http_client=httpx.Client(verify=False)
    )

def chat(prompt: str, system: str = "You are a helpful business analyst.") -> str:
    client = get_client()
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": prompt}
        ],
        temperature=0.3
    )
    return response.choices[0].message.content

def embed(texts: list[str]) -> list[list[float]]:
    client = get_client()
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    return [item.embedding for item in response.data]
