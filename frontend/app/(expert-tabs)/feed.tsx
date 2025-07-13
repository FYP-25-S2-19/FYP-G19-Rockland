import React, { useState } from "react";
import BaseFeed from "../../components/BaseFeed";
import { sampleArticles } from "../../data/article";
import { rockData } from "../../data/rocks";

export default function ExpertFeed() {
  const [articles, setArticles] = useState(
    sampleArticles.map((article) => ({ ...article, liked: false }))
  );

  const onLikeToggle = (articleId: number) => {
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId
          ? { ...a, liked: !a.liked, likes: a.liked ? a.likes - 1 : a.likes + 1 }
          : a
      )
    );
  };

  return (
    <BaseFeed
      userRole="expert"
      articles={articles}
      rocks={rockData}
      tabs={[
        { key: "articles", label: "Articles" },
        { key: "rocks", label: "Rock Entries" },
      ]}
      onLikeToggle={onLikeToggle}
      onUpgradeRequest={(message) => alert(message)}
    />
  );
}
