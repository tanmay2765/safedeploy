from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings

# Determine async connection string
database_url = settings.get_async_database_url()

# If in test/development mode with sqlite fallback
connect_args = {}
if "sqlite" in database_url:
    connect_args = {"check_same_thread": False}

async_engine = create_async_engine(
    database_url,
    echo=settings.DEBUG,
    future=True,
    connect_args=connect_args,
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
    class_=AsyncSession,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

