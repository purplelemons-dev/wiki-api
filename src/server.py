import fastapi
from fastapi.responses import HTMLResponse
import requests as r


def generate_titles_URL(query: str):
    return f"https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=8&gsrsearch={query}&format=json"


def generate_page_URL(page_id: int):
    return f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exlimit=1&pageids={page_id}&format=json&explaintext=true"


app = fastapi.FastAPI()


@app.get("/")
def read_root():
    return fastapi.responses.Response(status_code=301, headers={"Location": "/docs"})


@app.get("/titles")
def read_item(q: str = None):
    url = generate_titles_URL(q)
    response = r.get(url)
    return {
        "pages": sorted(
            response.json()["query"]["pages"].values(), key=lambda x: x["index"]
        )
    }


@app.get("/page")
def read_item(pageid: int = None):
    url = generate_page_URL(pageid)
    response = r.get(url)
    return response.json()["query"]["pages"][str(pageid)]


@app.get("/docs", response_class=HTMLResponse)
async def read_docs():
    return app.openapi()
