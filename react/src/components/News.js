import React, { useEffect, useState } from "react";
import NewsItem from "./NewsItem";
import Spinner from "./Spinner";
import PropTypes from "prop-types";
import InfiniteScroll from "react-infinite-scroll-component";

const News = (props) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const apiKey = process.env.REACT_APP_NEWS_API; // ✅ from .env
  const proxyUrl = "https://cors-anywhere.herokuapp.com/"; // ✅ working proxy

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const updateNews = async () => {
    try {
      props.setProgress(10);

      const targetUrl = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${apiKey}&page=${page}&pageSize=${props.pageSize}`;
      const finalUrl = proxyUrl + targetUrl; // ✅ combined for proxy

      setLoading(true);
      const response = await fetch(finalUrl);
      props.setProgress(30);

      const parsedData = await response.json();
      props.setProgress(70);

      if (parsedData && parsedData.articles) {
        setArticles(parsedData.articles);
        setTotalResults(parsedData.totalResults || 0);
      } else {
        console.error("Invalid API response:", parsedData);
        setArticles([]);
        setTotalResults(0);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      setArticles([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
      props.setProgress(100);
    }
  };

  useEffect(() => {
    document.title = `${capitalizeFirstLetter(props.category)} - NewsMonkey`;
    updateNews();
    // eslint-disable-next-line
  }, []);

  const fetchMoreData = async () => {
    try {
      const nextPage = page + 1;
      const targetUrl = `https://newsapi.org/v2/top-headlines?country=${props.country}&category=${props.category}&apiKey=${apiKey}&page=${nextPage}&pageSize=${props.pageSize}`;
      const finalUrl = proxyUrl + targetUrl;

      const response = await fetch(finalUrl);
      const parsedData = await response.json();

      if (parsedData && parsedData.articles) {
        setArticles((prevArticles) => prevArticles.concat(parsedData.articles));
        setTotalResults(parsedData.totalResults || 0);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more news:", error);
    }
  };

  return (
    <>
      <h1
        className="text-center"
        style={{ margin: "35px 0px", marginTop: "90px" }}
      >
        NewsMonkey - Top {capitalizeFirstLetter(props.category)} Headlines
      </h1>

      {loading && <Spinner />}

      {!loading && articles && articles.length > 0 ? (
        <InfiniteScroll
          dataLength={articles.length}
          next={fetchMoreData}
          hasMore={articles.length < totalResults}
          loader={<Spinner />}
        >
          <div className="container">
            <div className="row">
              {articles.map((element) => (
                <div className="col-md-4" key={element.url || Math.random()}>
                  <NewsItem
                    title={element.title || ""}
                    description={element.description || ""}
                    imageUrl={element.urlToImage}
                    newsUrl={element.url}
                    author={element.author || "Unknown"}
                    date={element.publishedAt}
                    source={element.source?.name || "Unknown"}
                  />
                </div>
              ))}
            </div>
          </div>
        </InfiniteScroll>
      ) : (
        !loading && (
          <h5 className="text-center text-muted">No news articles found.</h5>
        )
      )}
    </>
  );
};

News.defaultProps = {
  country: "in",
  pageSize: 8,
  category: "general",
};

News.propTypes = {
  country: PropTypes.string,
  pageSize: PropTypes.number,
  category: PropTypes.string,
  setProgress: PropTypes.func.isRequired,
};

export default News;
