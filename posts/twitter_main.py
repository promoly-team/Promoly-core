import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from sqlalchemy import text
from database.db import get_connection  # ajuste pro seu projeto

TWITTER_EMAIL = "SEU_EMAIL"
TWITTER_PASSWORD = "SUA_SENHA"

def get_next_tweet(db):
    result = db.execute(text("""
        SELECT id, tweet_text
        FROM twitter_posts
        WHERE publicado = FALSE
        ORDER BY created_at ASC
        LIMIT 1
    """)).fetchone()

    return result

def mark_as_posted(db, post_id):
    db.execute(text("""
        UPDATE twitter_posts
        SET publicado = TRUE,
            publicado_em = NOW()
        WHERE id = :id
    """), {"id": post_id})
    db.commit()

def post_tweet():

    db = get_connection()

    tweet = get_next_tweet(db)
    if not tweet:
        print("Nenhum tweet pendente.")
        return

    post_id, tweet_text = tweet

    driver = webdriver.Chrome(ChromeDriverManager().install())
    driver.get("https://twitter.com/login")

    time.sleep(5)

    '''    # Login
    driver.find_element(By.NAME, "text").send_keys(TWITTER_EMAIL)
    driver.find_element(By.NAME, "text").send_keys(Keys.RETURN)

    time.sleep(3)

    driver.find_element(By.NAME, "password").send_keys(TWITTER_PASSWORD)
    driver.find_element(By.NAME, "password").send_keys(Keys.RETURN)

    time.sleep(5)

    # Ir para campo de tweet
    tweet_box = driver.find_element(By.CSS_SELECTOR, "[data-testid='tweetTextarea_0']")
    tweet_box.send_keys(tweet_text)

    time.sleep(2)

    # Botão postar
    driver.find_element(By.CSS_SELECTOR, "[data-testid='tweetButtonInline']").click()

    time.sleep(5)

    mark_as_posted(db, post_id)
'''
    driver.quit()

if __name__ == "__main__":
    post_tweet()
