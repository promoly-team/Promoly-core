import logging
import sys

from api.core.settings import settings


def setup_logging():
    """
    Configura logging estruturado da aplicação.
    """

    logging.basicConfig(
        level=settings.LOG_LEVEL,
        format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
    )


def get_logger(name: str):
    return logging.getLogger(name)
