<script setup lang="ts">
import { knowledgeSections } from '../../navigation'

const firstArticle = knowledgeSections.flatMap((section) => section.items)[0]
</script>

<template>
  <div class="knowledge-home">
    <div class="home-kicker"><span class="kicker-line"></span> A PERSONAL KNOWLEDGE LIBRARY</div>
    <header class="home-header">
      <p class="home-overline">Sunny 的技术手记</p>
      <h1>理解原理，<br>也记录<span class="title-accent">来路。</span></h1>
      <p class="home-description">关于 Android、安全与逆向的知识与实践。<br class="desktop-break">把零散的线索串成体系，让每一次探索都有迹可循。</p>
      <div class="home-actions"><a v-if="firstArticle" class="primary-action" :href="firstArticle.link">开始阅读 <span aria-hidden="true">↗</span></a><a class="secondary-action" href="/guide.html">如何使用这座知识库 <span aria-hidden="true">→</span></a></div>
    </header>

    <section class="topics-section" aria-labelledby="topics-heading">
      <div class="section-label"><h2 id="topics-heading">沿着兴趣，深入一点</h2><span>{{ String(knowledgeSections.length).padStart(2, '0') }} 个知识领域</span></div>
      <div class="topic-grid">
        <a v-for="(section, index) in knowledgeSections" :key="section.id" :href="section.link" :class="['topic-card', `topic-${section.id}`]">
          <div class="topic-top"><span class="topic-number">{{ String(index + 1).padStart(2, '0') }} /</span><span class="topic-symbol" aria-hidden="true">{{ ['{ }', '◇', '⌘', '↗'][index] }}</span></div>
          <div class="topic-heading"><h3>{{ section.title }}</h3><span class="topic-arrow" aria-hidden="true">↗</span></div>
          <span class="topic-en">{{ section.en }}</span>
          <p>{{ section.description }}</p>
          <span class="topic-footer">探索这个领域 <span aria-hidden="true">→</span></span>
        </a>
      </div>
    </section>

    <section class="starting-section" aria-labelledby="starting-heading">
      <div class="section-label"><h2 id="starting-heading">从一个具体问题开始</h2><span>READING PICKS</span></div>
      <div class="reading-picks">
        <template v-for="section in knowledgeSections" :key="section.id">
          <a v-if="section.items[0]" class="reading-pick" :href="section.items[0].link">
            <span class="pick-category">{{ section.title }}</span><span class="pick-body"><strong>{{ section.items[0].text }}</strong><span>{{ section.items[0].description }}</span></span><span class="pick-arrow" aria-hidden="true">→</span>
          </a>
        </template>
      </div>
    </section>

    <aside class="home-note"><span class="note-mark" aria-hidden="true">“</span><div><strong>知识不是收藏夹，是不断建立的联系。</strong><p>在这里，保留问题、过程与证据，也为未来的自己留下一条清楚的路。</p></div></aside>
    <footer class="home-footer"><span>Sunny · 学习，实践，记录。</span><a href="/legacy/index.html">旧博客仍在这里 <span aria-hidden="true">↗</span></a></footer>
  </div>
</template>
