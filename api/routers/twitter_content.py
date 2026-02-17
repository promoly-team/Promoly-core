from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from api.services.deal_service import DealService
from api.services.twitter_content_service import TwitterContentService


router = APIRouter(prefix="/twitter", tags=["twitter"])


@router.get("/price-drop")
def generate_price_drop(db: Session = Depends(get_db)):
    twitter_service = TwitterContentService(db)
    return {"tweet": twitter_service.generate_price_drop_tweet()}



@router.get("/all-time-low")
def generate_all_time_low(db: Session = Depends(get_db)):
    twitter_service = TwitterContentService(db)
    return {"tweet": twitter_service.generate_all_time_low_tweet()}


@router.get("/historical-rotating")
def generate_historical_rotating(db: Session = Depends(get_db)):

    twitter_service = TwitterContentService(db)
    tweet = twitter_service.generate_rotating_historical_tweet()

    return {"tweet": tweet}

