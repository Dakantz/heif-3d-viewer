import fastapi
import fastapi.middleware.cors as cors
from pydantic import BaseModel
import os
from pathlib import Path
import uuid

from starlette.responses import FileResponse


class UploadedHEIF(BaseModel):
    filename: str
    content_type: str
    size: int
    date_uploaded: str
    share_link: str


base_file_path = os.environ.get("HEIF_BASE_PATH", "./heif-sharing/data/")

app = fastapi.FastAPI()

# add cors middleware
app.add_middleware(
    cors.CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def read_root():
    return {"message": "Welcome to the HEIF Sharing API!"}


@app.post("/upload/")
async def upload_heif(file: fastapi.UploadFile = fastapi.File(...)) -> UploadedHEIF:
    file_id = uuid.uuid4().hex
    filename = f"{file_id}.heic"
    file_location = Path(base_file_path) / filename

    with open(file_location, "wb+") as file_object:
        file_object.write(await file.read())

    file_info = UploadedHEIF(
        filename=filename,
        share_link=f"/files/{filename}",
        content_type=file.content_type,
        size=os.path.getsize(file_location),
        date_uploaded=str(os.path.getmtime(file_location)),
    )

    return file_info


@app.get("/files/{filename}", response_class=FileResponse)
async def get_heif_file(filename: str) -> FileResponse:
    # sanitize filename
    if not filename.endswith(".heic"):
        raise fastapi.HTTPException(status_code=400, detail="Invalid file type")
    if "/" in filename or "\\" in filename:
        raise fastapi.HTTPException(status_code=400, detail="Invalid filename")
    file_location = Path(base_file_path) / filename
    if not file_location.exists():
        raise fastapi.HTTPException(status_code=404, detail="File not found")
    return fastapi.responses.FileResponse(
        path=file_location, media_type="image/heif", filename=filename
    )
