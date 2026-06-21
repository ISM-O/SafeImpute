import os
from functools import lru_cache
from pydantic_settings import BaseSettings
from dotenv import load_dotenv, find_dotenv


load_dotenv(find_dotenv())

class AppSettings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL")
    secret_key: str = os.getenv("SECRET_KEY")
    algorithm: str = os.getenv("ALGORITHM")
    access_token_expire_minutes: int = 60 * 24 # 1 day

settings = AppSettings()

@lru_cache
def get_settings() -> AppSettings:
    return AppSettings()    