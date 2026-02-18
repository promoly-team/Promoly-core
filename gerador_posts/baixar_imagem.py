import os
import requests

 def copy(aself, conn=None):
 
 (
    SELECT
        tp.tweet_text,
        tp.produto_id,
        p.imagem_url
    FROM twitter_posts tp
    JOIN produtos p
        ON tp.produto_id = p.id
    ORDER BY tp.created_at DESC
) TO 'tweets_listagem.csv'
WITH CSV HEADER;