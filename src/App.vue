<template>
  <article>
    <img src='assets/img/triangle.svg' width='200'>
    <div class='picList'>
      <div class='pic-item' v-for='item in pics' :key='item.title'>
        <img :src='item.src' :alt='item.title' width='100%'>
      </div>
    </div>
  </article>
</template>

<script>
export default {
  name: 'app',
  data() {
    return {
      pics: []
    }
  },
  mounted() {
    fetch('/media/data/ui.json')
      .then(res => res.json())
      .then(({ data }) => {
        this.pics = data;
      })
  }
}
</script>
