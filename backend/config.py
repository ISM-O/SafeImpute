from dotenv import load_dotenv, find_dotenv
from pydantic_settings import BaseSettings
import os


load_dotenv(find_dotenv())

class settings(BaseSettings):

    database_url : str = os.getenv("DATABASE_URL")


settings = settings()
