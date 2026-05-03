import os

from dotenv import find_dotenv, load_dotenv
from pydantic_settings import BaseSettings

load_dotenv(find_dotenv())


class settings(BaseSettings):

    database_url: str = os.getenv("DATABASE_URL")


settings = settings()
