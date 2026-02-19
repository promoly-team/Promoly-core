import csv
import os
from datetime import datetime
from sqlalchemy.orm import Session

from api.services.twitter_content_service import TwitterContentService


def generate_daily_tweets_job(db: Session):

    service = TwitterContentService(db)

    tweets = []
    distribution = [
        ("price_drop", 6),
        ("historical", 4),
        ("all_time_low", 2),
        ("educational", 5),
    ]


    for tweet_type, quantity in distribution:

        for _ in range(quantity):

            if tweet_type == "price_drop":
                tweet = service.generate_price_drop_tweet()

            elif tweet_type == "historical":
                tweet = service.generate_rotating_historical_tweet()

            elif tweet_type == "all_time_low":
                tweet = service.generate_all_time_low_tweet()

            elif tweet_type == "educational":
                tweet = service.generate_educational_tweet()

            else:
                tweet = None

            if tweet:
                tweets.append(tweet)

    if not tweets:
        return {"status": "no_tweets"}

    os.makedirs("twitter_exports", exist_ok=True)

    filename = "twitter_exports/tweets_today.csv"


    with open(filename, "w", newline="", encoding="utf-8") as file:
        writer = csv.writer(file)

        writer.writerow([
            "tweet_text",
            "product_url",
            "affiliate_url"
        ])

        for t in tweets:
            writer.writerow([
                t["tweet_text"],
                t["product_url"],
                t["affiliate_url"]
            ])

    return {
        "status": "success",
        "file": filename,
        "total_generated": len(tweets)
    }
