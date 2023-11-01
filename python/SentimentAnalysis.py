import praw
from textblob import TextBlob
import matplotlib.pyplot as plt
import sys
import io
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import json

reddit = praw.Reddit(
    client_id='MwLr045f4GHl-xANrc1Wwg',
    client_secret='nNYWDLTyI_DPB5mMbH12vFwbIUgJuA',
    user_agent='Analyser'
)

def analyze_sentiment(product_name):
    subreddit = reddit.subreddit('all')
    posts = subreddit.search(product_name, limit=100)  # Adjust limit as needed

    sentiments = []
    comments = []
    analyzer = SentimentIntensityAnalyzer()
    max_positive = -1
    min_negative = 1
    highest_comment = ""
    lowest_comment = ""

    for post in posts:
        blob = TextBlob(post.title)
        comments.append(post.title)
        sentiments.append(blob.sentiment.polarity)

        # Using VADER for compound sentiment analysis
        vs = analyzer.polarity_scores(post.title)
        compound = vs['compound']

        if compound > max_positive:
            max_positive = compound
            highest_comment = post.title

        if compound < min_negative:
            min_negative = compound
            lowest_comment = post.title

    # Create a dictionary with the highest and lowest sentiment comments
    sentiment_comments = {
        "highest_positive_comment": highest_comment,
        "lowest_negative_comment": lowest_comment
    }

    # Save the sentiment comments to a JSON file
    with open('sentiment_comments.json', 'w') as file:
        json.dump(sentiment_comments, file, indent=4)

    return sentiments

def generate_pie_chart(product_name, sentiments):
    labels = ['Positive', 'Neutral', 'Negative']
    sentiment_counts = [sum(1 for sentiment in sentiments if sentiment > 0),
                        sum(1 for sentiment in sentiments if sentiment == 0),
                        sum(1 for sentiment in sentiments if sentiment < 0)]

    plt.figure(figsize=(6, 6))
    plt.pie(sentiment_counts, labels=labels, autopct='%1.1f%%', startangle=140, colors=['green', 'grey', 'red'])
    plt.axis('equal')

    # Save the pie chart as an image file
    img_stream = io.BytesIO()
    plt.savefig(img_stream, format='png')
    img_stream.seek(0)

    with open('sentiment_chart.png', 'wb') as file:
        file.write(img_stream.read())

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Please provide a product or brand name as an argument.")
    else:
        product_name = sys.argv[1]
        sentiments = analyze_sentiment(product_name)
        generate_pie_chart(product_name, sentiments)
